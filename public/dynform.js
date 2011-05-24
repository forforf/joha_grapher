/*
//-- to be able to query on .data attribute.
//-- example: assume data was set as so $('a#someLink').data('ABC', '123');
//-- usage: $('a[ABC=123]')
//-- returns the element.
// Code by James Padolsey, site: http://james.padolsey.com/javascript/a-better-data-selector-for-jquery/

(function($){
    var _dataFn = $.fn.data;
    $.fn.data = function(key, val){
        if (typeof val !== 'undefined'){ 
            $.expr.attrHandle[key] = function(elem){
                return $(elem).attr(key) || $(elem).data(key);
            };
        }
        return _dataFn.apply(this, arguments);
    };
})(jQuery);
*/

function get_keys(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}

//Class to hold Element Constructors, used as a mixin

var JohaElems = function() {}; //abstract-like class
JohaElems.prototype = {
  fieldContainer: function(fieldName, baseId) {
    var fc = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_container", //joha_node_dfield0_container",
      class: "field_container",
      text: "-" +  fieldName + "field container -",
    });
    return fc;
  },
  
  fieldLabel: function(fieldName, baseId, labelId) {
    var myId = baseId + "_" + fieldName + "_label"; //joha_node_dfield0_label";
    var myClass = "field_label";
    var fl = jQuery("<label for=\"" + labelId + "\" id=\"" + myId + "\" class=\"" + myClass + "\">" + fieldName + ":</label>");
    return fl;
  },
  
  keyContainer: function(keyName, keyIndex, fieldName, baseId) {
    var kc = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_" + keyIndex + "_container", //joha_node_dfield1_dkey0_container_diter",
      class: "key_field",
      text: keyName,
    })
    return kc;
  },
  
  listContainer: function(fieldName, baseId) {
    var lc = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_list_container", //joha_node_dfield1_dkey0_container_diter",
      class: "list_container",
    })
    return lc;
  },

  kvListItem: function(fieldName, baseId) {
    var kvli = jQuery("<div />", {
      class: "kvlist_item",
    })
    return kvli;
  }, 
  
  kvListContainer: function(fieldName, baseId) {
    var kvlc = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_kvlist_container", //joha_node_dfield1_dkey0_container_diter",
      class: "kvlist_container",
    })
    return kvlc;
  },  
  
  valueContainerParent: function(valIndex, keyIndex, fieldName, baseId) {
    var vcp = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_" + keyIndex + "_value_container_" + valIndex, //"joha_node_dfield1_dkey0_value_container_diter",
      class: "value_outer",
    })
    return vcp;
  },
  
  
  //Needs tested
  staticData: function(fieldName, baseId) {
    var vd = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_static_data",
      class: "joha_node_field static_field",
      text: valData,
    });
    return sd;
  },
  
  valueData: function(valData, valIndex, keyIndex, fieldName, baseId) {
    var vd = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_value_data_" + valIndex, //"joha_node_dfield1_dkey0_value_data_diter",
      class: "joha_node_field value_field",
      text: valData,
    })
    return vd;
  },
  
  deleteControls: function(valIndex, keyIndex, fieldName, baseId, delContainer, delValue) {
    var dc = jQuery("<div />", {
      id: baseId + "_" + fieldName +"_" + keyIndex + "_delete_controls_" + valIndex, //joha_node_dfield1_dkey0_value_controls_diter",
      class: "delete_controls",
      text: "-",
    })
    dc.data('deleteContainerId', delContainer.attr('id'));
    dc.data('deleteValue', delValue);
    return dc;
  }
};



/* Augment function. from: http://chamnapchhorn.blogspot.com/2009/05/javascript-mixins.html */
/* Used for mixing together two classes ... not used yet */
function augment(receivingClass, givingClass) {
   for(methodName in givingClass.prototype) {
      if(!receivingClass.prototype[methodName]) {
         receivingClass.prototype[methodName] = givingClass.prototype[methodName];
      }
   }
}
 
function BuildNodeEditDom(baseId, nodeId, appendDoms) {
  this.div_id = baseId;
  this.nodeId = nodeId;
  var domTemp = jQuery("<div />", {
    id: baseId,
  });
  
  for(index in appendDoms) {
    if (appendDoms[index] != null) {
      domTemp = jQuery(domTemp.append(appendDoms[index].domObj));
    };
  };
  this.domObj = domTemp;
}

function BuildNodeFieldContainer(containerObj, fieldNameObj, fieldObj){
  containerObj.append(fieldNameObj);
  containerObj.append(fieldObj);
}

function BuildReplaceDom(fieldData, baseId){

  //style inside the box stuff here, is there a way to style in css?
  // maybe through classnames?

  this.parentDom = jQuery("<div />", {
    id: baseId + "_replace",
    class: "replace",
  });
  
  this.fieldName = get_keys(fieldData)[0];
  
  var johaBuilder = new JohaElems();
  
  var fieldContainer = johaBuilder.fieldContainer(this.fieldName, baseId);  
  var valueContainerParent = johaBuilder.valueContainerParent("","", this.fieldName, baseId);
  var valueData = johaBuilder.valueData( fieldData[this.fieldName] , "", "", this.fieldName, baseId);
  var deleteControls = johaBuilder.deleteControls("","", this.fieldName, baseId, valueContainerParent, valueData.text());
  var fieldLabel = johaBuilder.fieldLabel(this.fieldName, baseId, valueContainerParent.attr('id'));
    
  //combine elements into Dom (TODO: This can be DRYed up)
  //-- Add Node Field Obj
  fieldContainer = fieldContainer.append(fieldLabel);
  // -- Add Node Data Obj
  valueContainerParent = valueContainerParent.append(valueData);
  valueContainerParent = valueContainerParent.append(deleteControls);
  // -- Complete Node Container
  fieldContainer = fieldContainer.append(valueContainerParent);
  
  var currentDomObj = this.parentDom.append(fieldContainer);

  this.domObj = currentDomObj;
}

function BuildListDom(fieldData, baseId) {

  this.parentDom = jQuery("<div />", {
    id: baseId + "_list",
    class: "list",
  });
  
  this.fieldName = get_keys(fieldData)[0];
  
  var johaBuilder = new JohaElems();

  var fieldContainer = johaBuilder.fieldContainer(this.fieldName, baseId);
  var listContainer = johaBuilder.listContainer(this.fieldName, baseId);
  
  var myData = fieldData[this.fieldName]; //["a", "b", "c", "d"];
  
  var valueContainerParents = []
  var valueDatas = []
  var deleteControls = []
  for (index in myData) {
    valueContainerParents[index] = johaBuilder.valueContainerParent("", index, this.fieldName, baseId);
    valueDatas[index] = johaBuilder.valueData(myData[index], "", index, this.fieldName, baseId);
    deleteControls[index] = johaBuilder.deleteControls("", index, this.fieldName, baseId, valueContainerParents[index], valueDatas[index].text() );
  }
  var fieldLabel = johaBuilder.fieldLabel(this.fieldName, baseId, listContainer.attr('id'));  
  
  
    //combine elements into Dom (TODO: This can be DRYed up)
  fieldContainer = fieldContainer.append(fieldLabel);
  
  
  for (index in myData) {
    valueContainerParents[index] = valueContainerParents[index].append(valueDatas[index]);
    valueContainerParents[index] = valueContainerParents[index].append(deleteControls[index]);
  //  fieldContainer = fieldContainer.append(keyContainer);
    listContainer = listContainer.append(valueContainerParents[index]);   
  }
  
  fieldContainer.append(listContainer);
  
  var currentDomObj = this.parentDom.append(fieldContainer);
  
  this.domObj = currentDomObj;
  
}

function BuildKvlistDom(fieldData, baseId){
  this.parentDom = jQuery("<div />", {
    id: baseId + "_kvlist",
    class: "kvlist",
  });  // this.parentDom = jQParent;
  
  this.fieldName = get_keys(fieldData)[0];
  var myData = fieldData[this.fieldName];
  //var keyList = get_keys(myData);
    
  var johaBuilder = new JohaElems();
  var fieldContainer = johaBuilder.fieldContainer(this.fieldName, baseId);  
  
  var keyContainers = {};

  var keyIndex = 0;
  for (myKey in myData){
    
    keyContainers[myKey] = {};
    var thisKeyContainer = keyContainers[myKey];
 
    var currentKeyContainer = johaBuilder.keyContainer(myKey, keyIndex, this.fieldName, baseId);
    thisKeyContainer['keyContainer'] = currentKeyContainer;
    thisKeyContainer['valueContainerParents'] = []
    thisKeyContainer['valueDatas'] = []
    thisKeyContainer['deleteControls'] = []
    
    var keyList = null;
    if (jQuery.isArray(myData[myKey])) { 
      keyList = myData[myKey];
    } else {
      keyList = [ myData[myKey] ];
    }  

    for (listIndex in keyList) {
     
      thisKeyContainer.valueContainerParents[listIndex] = johaBuilder.valueContainerParent(keyIndex, listIndex, this.fieldName, baseId);
      
      thisKeyContainer.valueDatas[listIndex] = johaBuilder.valueData(keyList[listIndex], listIndex, keyIndex, this.fieldName, baseId);
      //UGLY!!!
      thisKeyContainer.deleteControls[listIndex] = johaBuilder.deleteControls(listIndex, keyIndex, this.fieldName, baseId, thisKeyContainer.valueContainerParents[listIndex], thisKeyContainer.valueDatas[listIndex].text() );
    }
    keyContainers[myKey] = thisKeyContainer;

    keyIndex += 1;  
    
  }

    //combine elements into Dom (TODO: This can be DRYed up)

  var kvListContainer = johaBuilder.kvListContainer(this.fieldName, baseId);  
  var fieldLabel = johaBuilder.fieldLabel(this.fieldName, baseId, kvListContainer.attr('id'));  
  fieldContainer = fieldContainer.append(fieldLabel);
  
  for (myKey in keyContainers){
    var kvListItem = johaBuilder.kvListItem(this.fieldName, baseId);  
    var listContainer = johaBuilder.listContainer(this.fieldName, baseId);
    var thisKeyContainer = keyContainers[myKey];
    
    //Ugh the number of iterations is buried in the data ... there should be a better way.
    for (index=0;index<thisKeyContainer.valueContainerParents.length;index++){

      thisKeyContainer.valueContainerParents[index] = thisKeyContainer.valueContainerParents[index].append(thisKeyContainer.valueDatas[index]);
      thisKeyContainer.valueContainerParents[index] = thisKeyContainer.valueContainerParents[index].append(thisKeyContainer.deleteControls[index]);
      listContainer = listContainer.append(thisKeyContainer.valueContainerParents[index]); 
    }
    
    //append key data to field   
    kvListItem = kvListItem.append(thisKeyContainer.keyContainer);
    //list container for this key completed
    kvListItem = kvListItem.append(listContainer);
    kvListContainer = kvListContainer.append(kvListItem);
  }

  fieldContainer.append(kvListContainer);
  
  var currentDomObj = this.parentDom.append(fieldContainer);

  this.domObj = currentDomObj;
  
}

function domFieldFactory(dataType, fieldData, johaId){
  
  var domObj = null;
  
  if (dataType == "static_ops") {
    /* figure this out */
  } else if (dataType == "replace_ops") {
    domObj = new BuildReplaceDom( fieldData, johaId);
  } else if (dataType == "list_ops") {
    domObj = new BuildListDom( fieldData, johaId);
  } else if (dataType == "key_list_ops") {
    domObj = new BuildKvlistDom( fieldData, johaId );
  }
  if (domObj == null) {
    return "" ;
  } else {
  return domObj;
  }
}

function domNodeFactory(nodeData, dataDef){
  JOHA_ID = "joha_node";
  
  var domStack = [];
  var nodeDomObj = null;
/*
var SPECIAL_TREATMENT = {"id": edit_id_elements,
                         "label": edit_label_elements,
                         "links": edit_link_elements,
                         "attached_files": edit_file_elements}

var EDIT_OPS_MAP = {"static_ops": edit_static_elements,
                    "replace_ops": edit_replace_elements,
                    "list_ops": edit_list_elements,
                    "key_list_ops": edit_keylist_elements}
*/

  //make a copy
  var nodeCopy = jQuery.extend({}, nodeData);

  var nodeKeys = get_keys(nodeCopy);
  console.log('NOde Keys: ' + nodeKeys);
  
  //if (array_contains_all(nodeKeys, REQUIRED_DATA)) { /* ok */ } else {
  //alert("Not all Required Data Elements are present in Node ID: " + nodeCopy.id + "Keys:" + nodeKeys) };
 
/* 
  for (key in SPECIAL_TREATMENT) {
    if (nodeCopy[key]){
      SPECIAL_TREATMENT[key](nodeCopy[key]);
      delete nodeCopy[key];  // we've handled it so let's not worry about it anymore
    }
  }
*/
  
  for (key in nodeCopy) { 
    //if our data defintion exists for that key, use the appropriate function for displaying it
    if (dataDef[key]) {
      var fieldData = {}
      fieldData[key] = nodeCopy[key];
      //var edit_ops_var = {}
      //edit_ops_var[key] = nodeCopy[key]
      //EDIT_OPS_MAP[(JOHA_DATA_DEF[key])](edit_ops_var);
      domStack.push( domFieldFactory(dataDef[key], fieldData, JOHA_ID) );
      delete nodeCopy[key];
    }
  }
  
  
  nodeDomObj = new BuildNodeEditDom(JOHA_ID, nodeData.id, domStack);
  return nodeDomObj;
}

/*
var TEST_DATA = {id: "ba",
                 label: "Label_ba",
                 attached_files: ["simple_text_file1.txt"],
                 attachment_doc_id: "joha_test_user:CouchrestEnv::GlueEnv:ba_attachments",
                 children: [],
                 links: {'http://www.google.com': "google",
                         'http://www.yahoo.com': "yahoo2" },
                 notes: [],
                 parents: ["b", "ab"],
                 update_log: ["import from bufs format"],
                 description: "from: joha_test_user",
                }

             
var TEST_DATA_DEF= {id: "static_ops",
                   label: "replace_ops",
                   description: "replace_ops",
                   links: "key_list_ops",
                   parents:"list_ops",
                   notes: "list_ops",
                   history: "list_ops",
                   //no operations are performed on user data
                   user_data: "static_ops",
                   }            
*/
/*             
$(document).ready(function() {

// HERE IT IS, ALL THE ABOVE CAN BE MOVED TO LIBRARY HOPEFULLY??  
  var nodeDom = domNodeFactory(TEST_DATA, TEST_DATA_DEF);
  jQuery('body').append(nodeDom.domObj);

  //Get Data
    jQuery("<div />", {
    "id":"b1-b1",
    css: { clear: "left" },
     html: "Results: <br/>" + elItero(jQuery('.joha_data')) //data('node_info').key,
  }).appendTo(jQuery('body'));
  
});
*/
//format to html functions

/*
function elItero(els) {
  retHtml = ""
  els.each(function(i){
    retHtml += $(this).html() + ": " + $(this).data('node_info').key + "<br />";
  });
  return retHtml;
}
*/