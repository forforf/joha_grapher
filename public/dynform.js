/*  Compatible with JEditable. Editable elements have a class of edit */
// Requires JQuery and joha_helpers.js

/*Class to hold Element Constructors, used as a mixin
  Data Organization:
    node: Holds all data of interest. Has a unique id field.
    field: The names of the data held by the node.  Example, "id" holds the node id value, "label" holds the node name, "links" holds the node's links
    
  Element Types:  JohaElems.<element type>(<args>) to call
    fieldContainer:       Container for field related data
    fieldLabel:           Holds the field name.
    keyContainer:         For field data that has keys, holds the key name TODO: If it holds data, don't call it a container
    listContainer:        For field data that is an array, holds the array items
    kvListIemt:           For field data that has keys, it is an item of the data belonging to a particular key
    kvListContainer:      Similar to listContainer, but holds a set of kvListItems
    valueContainerParent  Holds the fundamental value data and associated controls
    staticData:           Holds static (unchangable) data
    valueData:            Holds the fundamental value (editable with JEditable)
    deleteControls:       Holds the control for deleting data
  
  Builder Types:
    BuildNodeEditDom:         Main container, it holds on the editing doms.
    BuildNodeFieldContainer:  Not called?
    BuildReplaceDom:          Builds an editing container for simple key-value data (the value is editable by replacing it with the new data)
    BuildListDom:             Builds an editing container for key-array data (each element of the array is editable)
    BuildKvlistDom:           Builds an editing container for key-{subkey:list, subkey:list} type data. Subkeys and lists are each editable.
   
   Dom Constructors:
     domFieldFactory:   Inspects specified field data to determine its data structure and invokes the appropriate builder
     domNodeFactory:    Main entry point. Invokes domFieldFactory for each field in turn and then assembles them into the main container (BuildNodeEditDom)      
     
   Custom Data Stored in Element holding the Value:
    johaData__Type:         Type of data structure, can be static_ops, replace_ops, list_ops, or key_list_ops.
    johaData__FieldName:    The field name associated with the value
    johaData__OrigValue:    The value assined to the element at the time of element creation
    johaData__UpdatedValue: Used to track when the data has changed (set by user using JEditable typically )
    johaData__ListIndex:    Identifies which list item the value element is.
    johaData__Key:          Identifies which key is associated with value element for key: {subkey: list ...} type of data
*/  
/* Note on Element #id naming convention for dynamically created joha elements (to ensure uniqueness)
      format: #joha-[dom namespace identifier]-[node data field name]-[id for data key(if exist)]-[data iteration id (if exists)
      example: #joha-edit-label--
      example: #joha-edit-links-0-0  (first key and first element within that key)
      example: #joha-edit-links-1-3  (second key and 3 element within that key)
      example: #joha-edit-parents--2  (third element in parents node field)
   
*/

var JohaElems = function() {}; //abstract-like class
JohaElems.prototype = {
  fieldContainer: function(fieldName, baseId) {
    var fc = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_container",
      class: "field_container",
    });
    return fc;
  },
  
  fieldLabel: function(fieldName, dataType, baseId, labelId) {
    var myId = baseId + "_" + fieldName + "_label";
    var myClass = "field_label " + dataType;
    var fl = jQuery("<label for=\"" + labelId + "\" id=\"" + myId + "\" class=\"" + myClass + "\">" + fieldName + ":</label>");
    fl.data('johaData__Type', dataType);
    fl.data('johaData__FieldName', fieldName);
    return fl;
  },
   
  listContainer: function(fieldName, baseId) {
    var lc = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_list_container",
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
      id: baseId + "_" + fieldName + "_kvlist_container",
      class: "kvlist_container",
    })
    return kvlc;
  },  
  
  valueContainerParent: function(valIndex, keyIndex, fieldName, baseId) {
    var vcp = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_" + keyIndex + "_value_container_" + valIndex,
      class: "value_outer",
    })
    return vcp;
  },
  
  keyContainer: function(keyName, keyIndex, fieldName, baseId) {
    var kc = jQuery("<div />", {
      id: baseId + "_" + fieldName + "_" + keyIndex + "_container",
      class: "edit key_field",
      text: keyName,
    })
    return kc;
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
      id: baseId + "_" + fieldName + "_value_data_" + valIndex,
      class: "edit joha_node_field value_field",
      data: {"johaData__FieldName": fieldName,
             "johaData__OrigValue": valData,
            },
      text: valData,
    });
    //vd.data("johaFieldName", fieldName);
    return vd;
  },
  
  deleteControls: function(valIndex, keyIndex, keyName, fieldName, baseId, delContainer, delValue) {
    var elId = baseId + "_" + fieldName +"_" + keyIndex + "_delete_controls_" + valIndex;
    var elClass = "delete_controls";
    var elHtml = "<img id=\"" + elId + "\" class=\"" + elClass + "\" src=\"./images/delete_normal.png\" alt=\"-\" />"
    var dc = jQuery(elHtml);
    dc.data('johaData__deleteContainerId', delContainer.attr('id'));
    dc.data('johaData__fieldName', fieldName);
    dc.data('johaData__keyName', keyName);
    dc.data('johaData__deleteValue', delValue);
    return dc;
  },
  
  //addNewContainer: function() {
  //  var anc = jQuery("<div>/>");
  //  return anc;
  //},
  
  addNewValue: function(fieldName, keyName) {
    var anv = jQuery("<div />", {
      class: "edit add_new add_new_value",
      data: {"johaData__AddNewField": fieldName,
             "johaData__AddNewKey": keyName
            },
      text: "Add New",
    });
    return anv;
  },
  
  addNewKey: function(fieldName) {
    var anv = jQuery("<div />", {
      class: "edit add_new add_new_key",
      data: {"johaData__AddNewField": fieldName,
            },
      text: "Add New Key",
    });
    return anv;
  },  
};

var JohaValueContainerDom = function(valData, valIndex, keyIndex, keyName, fieldName, baseId, bindData) {
  var johaBuilder = new JohaElems();
  var valueContainerParent = johaBuilder.valueContainerParent(valIndex, keyIndex, fieldName, baseId);
  var valueData = johaBuilder.valueData( valData , valIndex, keyIndex, fieldName, baseId);
  valueData.data(bindData);
  var deleteControls = johaBuilder.deleteControls(valIndex, keyIndex, keyName, fieldName, baseId, valueContainerParent, valueData.text());
  this.topId = valueContainerParent.attr('id')
  this.valueElem = valueData;
  
  valueContainerParent = valueContainerParent.append(valueData);
  valueContainerParent = valueContainerParent.append(deleteControls);
  this.domObj = valueContainerParent;
}

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
  var bindData = {'johaData__Type': 'replace_ops'};
  var valContainerDom = new JohaValueContainerDom(fieldData[this.fieldName], "", "", "", this.fieldName, baseId, bindData);
  // - remove - var valueContainerParent = johaBuilder.valueContainerParent("","", this.fieldName, baseId);
  // - remove - var valueData = johaBuilder.valueData( fieldData[this.fieldName] , "", "", this.fieldName, baseId);
  // - remove - valueData.data("johaData__Type", "replace_ops");
  // - remove - var deleteControls = johaBuilder.deleteControls("","", "", this.fieldName, baseId, valueContainerParent, valueData.text());
  jlog("BuildReplaceDom - valueContainerDom#id", valContainerDom.topId);
  var fieldLabel = johaBuilder.fieldLabel(this.fieldName, 'replace_ops', baseId, valContainerDom.topId);
    
  //combine elements into Dom (TODO: This can be DRYed up)
  //-- Add Node Field Obj
  fieldContainer = fieldContainer.append(fieldLabel);
  // -- Add Node Data Obj
  // - remove - valueContainerParent = valueContainerParent.append(valueData);
  // - remove - valueContainerParent = valueContainerParent.append(deleteControls);
  // -- Complete Node Container
  fieldContainer = fieldContainer.append(valContainerDom.domObj);
  
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
  
  var valContainerDoms = []
  //var valueDatas = []
  var deleteControls = []
  
 
  for (index in myData) { 
    var bindData = { 'johaData__Type': 'list_ops',
                     'johaData__ListIndex': index,
                   };
    valContainerDoms[index] = new JohaValueContainerDom(myData[index], index, "", "", this.fieldName, baseId, bindData);
    //valueContainerParents[index] = johaBuilder.valueContainerParent(index, "", this.fieldName, baseId);
    //valueDatas[index] = johaBuilder.valueData(myData[index], index, "", this.fieldName, baseId);
    //valueDatas[index].data("johaData__Type", "list_ops");
    //valueDatas[index].data("johaData__ListIndex", index);
    //deleteControls[index] = johaBuilder.deleteControls(index, "", "", this.fieldName, baseId, valueContainerParents[index], valueDatas[index].text() );
  }
  var fieldLabel = johaBuilder.fieldLabel(this.fieldName, 'list_ops', baseId, listContainer.attr('id'));  
  
  fieldContainer = fieldContainer.append(fieldLabel);
  
  for (index in myData) {
    //valueContainerParents[index] = valueContainerParents[index].append(valueDatas[index]);
    //valueContainerParents[index] = valueContainerParents[index].append(deleteControls[index]);
    listContainer = listContainer.append(valContainerDoms[index].domObj);   
  }

  //Append the Add New 
  var addNewValue = johaBuilder.addNewValue(this.fieldName, "");
  listContainer = listContainer.append(addNewValue);
  
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
    thisKeyContainer['valContainerDoms'] = []
    thisKeyContainer['valueDatas'] = []
    thisKeyContainer['deleteControls'] = []
    
    var keyList = null;
    if (jQuery.isArray(myData[myKey])) { 
      keyList = myData[myKey];
    } else {
      keyList = [ myData[myKey] ];
    }  

    for (listIndex in keyList) {
      var bindData = {'johaData__Type': 'key_list_ops',
                      'johaData__ListIndex': listIndex,
                      'johaData__Key': myKey,
                     }
      //valContainerDoms[index] = new JohaValueContainerDom(myData[index], index, "", "", this.fieldName, baseId, "list_ops");
      thisKeyContainer.valContainerDoms[listIndex] = new JohaValueContainerDom(keyList[listIndex], listIndex, keyIndex, this.fieldName, baseId, bindData);
      //johaBuilder.valueContainerParent(listIndex, keyIndex, this.fieldName, baseId);
      //thisKeyContainer.valueDatas[listIndex] = johaBuilder.valueData(keyList[listIndex], listIndex, keyIndex, this.fieldName, baseId);
      
      //NEEDS TESTING!!!!
      //thisKeyContainer.valueDatas[listIndex].data("johaData__Type", "key_list_ops");
      //thisKeyContainer.valueDatas[listIndex].data("johaData__ListIndex", listIndex);
      //thisKeyContainer.valueDatas[listIndex].data("johaData__Key", myKey);
      //UGLY!!!
      //thisKeyContainer.deleteControls[listIndex] = johaBuilder.deleteControls(listIndex, keyIndex, myKey, this.fieldName, baseId, thisKeyContainer.valueContainerParents[listIndex], thisKeyContainer.valueDatas[listIndex].text() );
    }
    keyContainers[myKey] = thisKeyContainer;

    keyIndex += 1;  
    
  }

    //combine elements into Dom (TODO: This can be DRYed up)

  var kvListContainer = johaBuilder.kvListContainer(this.fieldName, baseId);  
  var fieldLabel = johaBuilder.fieldLabel(this.fieldName, 'key_list_ops', baseId, kvListContainer.attr('id'));  
  fieldContainer = fieldContainer.append(fieldLabel);
  
  for (myKey in keyContainers){
    var kvListItem = johaBuilder.kvListItem(this.fieldName, baseId);  
    var listContainer = johaBuilder.listContainer(this.fieldName, baseId);
    var thisKeyContainer = keyContainers[myKey];
    
    //Ugh the number of iterations is buried in the data ... there should be a better way.
    for (index=0;index<thisKeyContainer.valueContainerDoms.length;index++){
      //valContainerDoms[index] = new JohaValueContainerDom(myData[index], index, "", "", this.fieldName, baseId, "list_ops");
      //thisKeyContainer.valueContainerParents[index] = thisKeyContainer.valueContainerParents[index].append(thisKeyContainer.valueDatas[index]);
      //thisKeyContainer.valueContainerParents[index] = thisKeyContainer.valueContainerParents[index].append(thisKeyContainer.deleteControls[index]);
      listContainer = listContainer.append(thisKeyContainer.valContainerDoms[index].domObj); 
    }
    
    //append key data to field   
    kvListItem = kvListItem.append(thisKeyContainer.keyContainer);
    //list container for this key completed
    kvListItem = kvListItem.append(listContainer);
    kvListContainer = kvListContainer.append(kvListItem);
  }

  var addNewKey = johaBuilder.addNewKey(this.fieldName);
  kvListContainer = kvListContainer.append(addNewKey);
  
  fieldContainer.append(kvListContainer);
  
  var currentDomObj = this.parentDom.append(fieldContainer);

  this.domObj = currentDomObj;
  
}

function domFieldFactory(dataType, fieldData, johaId){
  
  var domObj = null;
  
  if (dataType == "static_ops") {
    /* figure out how to display static data */
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

function domNodeFactory(nodeData, dataDef, reqDataToShow){

  //TODO, refactor to be passed in
  JOHA_ID = "joha_node";
  
  var domStack = [];
  var nodeDomObj = null;

  //make a copy so we don't munge user data
  var nodeCopy = jQuery.extend({}, nodeData);

  var nodeKeys = get_keys(nodeCopy);

  
  for (key in nodeCopy) { 
    //if our data defintion exists for that key, use the appropriate function for displaying it
    if (dataDef[key] ) {
      var fieldData = {};
      fieldData[key] = nodeCopy[key];
      domStack.push( domFieldFactory(dataDef[key], fieldData, JOHA_ID) );
      delete nodeCopy[key];
      array_remove_item(reqDataToShow, key);
    }
  }
  
  //TODO: This screws up the display ordering (required shows will show last regardless) Refactor to preserve
  // display order
  for (i in reqDataToShow) {
    var key = reqDataToShow[i];
    var dataType = dataDef[key];
    var fieldData = {};
    fieldData[key] = "";
    domStack.push( domFieldFactory(dataDef[key], fieldData, JOHA_ID) );
  }
  
  nodeDomObj = new BuildNodeEditDom(JOHA_ID, nodeData.id, domStack);
  return nodeDomObj;
}

