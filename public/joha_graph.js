/* Header data */

// Write something here about initialization or getting ready, something something
$(document).ready(function() {
  //Constants
  JOHA_DATA_DEF = syncJax('/data_definition');
  
  //Temporary for Testing
  JOHA_DATA_DEF['user_data'] = "key_list_ops";
  

  initializeGraph();
  set_up_onClicks();
  
  //New DynForm Tests
  

  //var bldr = new JohaSimpleBldr;

  /*
  var myTest = {
    ev: 'click',
    action: function(event) {
      jlog("Target", event.data.johaTgt);
      event.data.johaTgt.css("color","red");
    },
  };
  
  var myEvAction = CompBldr.eventActions(myTest.ev, myTest.action);
  */
  //dc = jQuery("<p id=\"oof\">Del Ctl</p>");
  //
  /*
  dt = jQuery("<p id=\"footyfoo\">Del Me</p>");
  jQuery('body').prepend(dt);
  */
  
  //this works (not anymore)
  //var myCtlObj = ElemBldr.controlObj('#node_id_tracker', '#main-header-text', myEvAction);
  //this works too
  //var myCtl = bldr.deleteControl(dt, "footyfoo");
  //jQuery('body').prepend(jQuery(myCtl));
  //this works too
  //johaPats.editInPlaceControl(dc);
  //johaPats.editInPlaceControl(dt);
  //this works too
  //var myEditTxt = bldr.editValueElement("Click to Edit Text", "feefee", {foo: "bar"});
  //console.log(jQuery(myEditTxt).data());
  //jQuery('body').prepend(jQuery(myEditTxt));
  
  //var myListBldr = new JohaListBldr;
  //var myjoha = new Joha;
  //var bldr = myjoha.buildSimpleElem;
  //var mytestTxt = bldr.editValueElement("TEST Text", "fddeefee", {foo: "bar"});
  //var myListBldr = myjoha.buildListItem;
  //var myListItem = myjoha.buildListItem("List Item", "feefeelist", {foolist: "barlist"} );
  //var myListItem2 = myjoha.buildListItem("List Item2", "feefeelist2", {foolist2: "barlist2"} );
  //var myListItem = myListBldr.listItemObj("List Item", "feefeelist", {foolist: "barlist"} );
  //var myListItem = JohaListBldr().listItem("List Item", "feefeelist", {foolist: "barlist"} );
  //console.log(mytestTxt.data());
  
  //var myList = myjoha.buildList(["item1", "item2"], "fee", {} );

  //jQuery('body').prepend(jQuery(myList));
  //jQuery('body').prepend(jQuery(myListItem));
  //jQuery('body').prepend(jQuery(myListItem2));
  
  //var myKvlist = myjoha.buildKvlistItem("MyKey0", ["a", "b"],0,"feede", {} );
  //jQuery('body').prepend(jQuery(myKvlist));
  
  //var myKvlistObj = {"http:\\blah":["blah"],
  //                   foo: ["bar","baz"],
  //                   foofoo: ["barbar", "bazbaz"]
  //                  };
  //var myKvlistEl = myjoha.buildKvlist(myKvlistObj, "kvl", {foo: "bar"});
  //console.log(myKvlistEl);
  //jQuery('body').prepend(jQuery(myKvlistEl));

});

//Initialization Functions  TODO: Change to function form (lowercase underscore)
//-- Get neccessary server side initialization data
function syncJax(srcUrl) {
  retVal = "";
  
  jQuery.ajax({
    url:srcUrl,
    success: function(retData){retVal = retData;}, async:false
  });
  
  console.log(retVal);
  return retVal
}

//-- Set up listeners (onclick, etc)

function set_up_onClicks() {



  //Set up editing in place (JQuery plugin Jeditable)
  //-- wrap it in .live so that future elements can use it

  //changed 'click' to 'hover' so single click editing works
  jQuery('.edit').live('hover', function(event) {

    event.preventDefault();

    jlog("click event", event);

    //call the updateJeditElement function when an item is edited in place
    jQuery(this).editable( function(value, settings){
      var retVal = updateJeditElement(this, value, settings);
      console.log(retVal);
      return retVal
      }, {
      style: 'display: inline'
    });
    
  });
  
  //Collect updated data when user selects to save the node data
  jQuery('#save_node_data').live('click', function(event) {
    var all_edits = {};
    fieldValueData = jQuery('.joha_field_value_container').map(function(){ return jQuery(this).data();}).get();
    jlog('all field value containers data', fieldValueData);

    var joha_updates = jQuery('.joha_update');
    
    all_edits['updates'] = filterJohaData('.joha_update');
    all_edits['adds']= filterJohaData('.joha_add');
    all_edits['deletes'] = filterJohaData('.joha_delete');
    
    jlog("Save Clicked", all_edits);
    //revert data to default (by acting like the node is clicked)
    jlog("Save Clicked", "TODO: Revert updated data to unchanged after node is saved");

   
  });


  //Collect updated data when user selects to save the node data
  jQuery('#clear_node_edits').live('click', function(event) {
    //clear the edit classes then reset the node
    var editClasses = ['joha_add', 'joha_delete', 'joha_update'];
    for (i in editClasses){
      var editClass = editClasses[i];
      jQuery('.'+editClass).removeClass(editClass);
    }
    //reset node 
    var nodeId = jQuery('#current_node_id').text();
    actLikeNodeClicked(nodeId);
  });  
 
  //listen for clicks on delete buttons
  jQuery('.delete_controls').live('click', function(event) {
    event.preventDefault();
    
    delData = jQuery(this).data();

    jlog('delete clicked', delData );
    toggleDelete(delData.johaData__deleteContainerId);
  });

  jQuery('#create_node').live('click', function(event) {
    nodeId = jQuery('#create_node_id').val();
    nodeLabel = jQuery('#create_node_label').val();
    nodeParents = jQuery('#create_node_parents').val();
    var initialNodeData = {id: nodeId, label: nodeLabel, parents: nodeParents};
    console.log(initialNodeData);
  });
}

function initializeGraph(){
  blankGraph = rgraphInit(); //insert canvas into here if you can figure it out
   
  var nodeSource = '/index_nodes';
  //the below assigns the graph to myGraph (via Ajax)
  insertNodesIntoGraph(blankGraph, nodeSource);
  //setAuthToken('authtok_attach_form');  
}
    
//Element Manipulation functions
//--Showing/Hiding Edit Forms
function show_create_node_form(){
  jQuery('#edit-node-form').hide();
  jQuery('#create-node-form').show();
}

function show_edit_node_form(node){
  jQuery('#create-node-form').hide();
  dynamicEditForm(node.data); 
  jQuery('#edit-node-form').show();
}

function toggle(divId) {
  jqId = '#' + divId
	var ele = jQuery(jqId)[0];
	if(ele.style.display != "none") {
    		ele.style.display = "none";
  } else {
    ele.style.display = "block";
  }
}

function toggleDelete(elId) {
  jqId = '#' + elId
	var ele = jQuery(jqId);
	if( ele.is('.delete_show') ) {
    ele.removeClass('delete_show');
  } else {
    ele.addClass('delete_show')
  }
}

//Dynamic element creation based on data structure
//-- get current node
//TODO: Refactor to use this method?
//function get_current_node() {
//  alert("called get current node");
//  return jQuery('#current_node_id').text();
//}

//////function add_new_key_element(el, value) {

    //Todo: Fix dynform so that the baseID isn't hidden
//////    var baseId = 'joha_node';
/* ////// 
    var elemToUpdate = thisEl.parent();

    //TODO: This is very brittle as it relies on the dom structure staying constant
    var prevElem = jQuery(el).prev('.value_outer').children('.value_field');
    jlog('El Previous Sibling', prevElem);
    var elemData = {};
    if (prevElem.length != 0) {
      elemData = prevElem.data();
    } else {
      elemData['johaData__ListIndex'] = -1;  //will be incremented to 0
      //TODO: More ugliness to fix
      thisLabel = thisEl.closest('.field_container').children('.field_label').first()
      elemData['johaData__Type'] = thisLabel.data('johaData__Type');
      elemData['johaData__FieldName'] = thisLabel.data('johaData__FieldName');
      
      //Need to fix so that works with Keys :(
      elemData['johaData__Key'] = "";
      elemData['johaData__KeyIndex'] = "";
    
    }
    //jlog('El Previous Sibling Value', lastValueElem.text() );
 *////// /   
 /*//////   var keyIndex = jQuery('.key_field').length;
    var thisLabel = thisEl.closest('.field_container').children('.field_label').first()
    var fieldName = thisLabel.data('johaData__FieldName');
    var newElem = {};
    //newElem.value = value;
    newElem.keyName = value; //elemData['johaData__Key'];
    newElem.keyIndex = keyIndex ;//elemData['johaData__KeyIndex'];
    //newElem.index = parseInt(elemData['johaData__ListIndex']) + 1;
    
    //TODO Derive this rather than hardcoding it
    newElem.dataType = "key_list_ops"; //elemData['johaData__Type'];
    newElem.fieldName = fieldName; //elemData['johaData__FieldName'];
    

    jlog('New Key Elem Data', newElem  );
    //create new element
    //var bindData = { 'johaData__Type': newElem.dataType,
    //                 'johaData__ListIndex': newElem.index,
    //               };
    var johaBuilder = new JohaElems();
    var addKey = johaBuilder.keyContainer(value, keyIndex, fieldName, baseId);
    addKey.addClass('joha_add_jg');
    //= new JohaValueContainerDom(value, newElem.index, newElem.keyIndex, newElem.keyName, newElem.fieldName, baseId, bindData);
    //addNewVal.valueElem.data('johaData__NewValue', value);
    //addNewVal.valueElem.addClass('joha_add_jg');
    //var addNewValDom = addNewVal.domObj
    
    var kvListItem = johaBuilder.kvListItem(fieldName, baseId);
    
    thisKvlist = jQuery(thisEl).closest('.kvlist_container');
    thisKvlist.append(addKey);
    thisKvlist.append(kvListItem);
    
    //var addNewKey = johaBuilder.addNewKey(fieldName);
    
    var listContainer = johaBuilder.listContainer(fieldName, baseId);
    //jlog('Where is the DIV', jQuery().closest('.kvlist_container'));
    kvListItem.append(listContainer);
    
    kvListItem.append(thisEl);

    var addNewValue = johaBuilder.addNewValue(fieldName, "");
    listContainer.append(addNewValue);
}
*/ ///////
/*//////
function add_new_element(el, value) {

    //Todo: Fix dynform so that the baseID isn't hidden
    var baseId = 'joha_node';
  
    var elemToUpdate = thisEl.parent();

    //TODO: This is very brittle as it relies on the dom structure staying constant
    var prevElem = jQuery(el).prev('.value_outer').children('.value_field');
    jlog('El Previous Sibling', prevElem);
    var elemData = {};
    if (prevElem.length != 0) {
      elemData = prevElem.data();
    } else {
      elemData['johaData__ListIndex'] = -1;  //will be incremented to 0
      //TODO: More ugliness to fix
      var thisLabel = thisEl.closest('.field_container').children('.field_label').first()
      elemData['johaData__Type'] = thisLabel.data('johaData__Type');
      elemData['johaData__FieldName'] = thisLabel.data('johaData__FieldName');
      
      //Need to fix so that works with Keys :(
      elemData['johaData__Key'] = "";
      elemData['johaData__KeyIndex'] = "";
    
    }
    //jlog('El Previous Sibling Value', lastValueElem.text() );
    
    var newElem = {}
    newElem.value = value;
    newElem.keyName = elemData['johaData__Key'];
    newElem.keyIndex = elemData['johaData__KeyIndex'];
    newElem.index = parseInt(elemData['johaData__ListIndex']) + 1;
    newElem.dataType = elemData['johaData__Type'];
    newElem.fieldName = elemData['johaData__FieldName'];
    

    jlog('New Elem Data', newElem  );
    //create new element
    var bindData = { 'johaData__Type': newElem.dataType,
                     'johaData__ListIndex': newElem.index,
                   };
                   
    var addNewVal = new JohaValueContainerDom(value, newElem.index, newElem.keyIndex, newElem.keyName, newElem.fieldName, baseId, bindData);
    addNewVal.valueElem.data('johaData__NewValue', value);
    addNewVal.valueElem.addClass('joha_add_jg');
    var addNewValDom = addNewVal.domObj

    
    
    thisEl.before(addNewValDom);
}
*///////

//-- handle updating data
function updateJeditElement(el, value, settings){

  //is Jeditable overkill with this approach?
   
  //////console.log(el.innerHTML );   
  thisEl = jQuery(el);
  //////var elId = thisEl.attr('id');
  //console.log(origValue);

  /*//////if ( thisEl.is('.joha_add_jg')) {
    if ( isKey ) {
      add_new_key_element(el, value);
    } else {
      add_new_element(el, value);
    }
  } else { //data value edit
  *//////
  thisEl.data("johaData__UpdatedValue", value);
  //thisEl.data("johaData__OriginalValue", origValue);
  thisEl.addClass('joha_update');
  //////}
 
 
  return value;
}


//////function add_new_format(parentContainer, value) {
  //make value container
  //insert in before ?
//////}



//-- -- data structures 
var file_elements_format = function(filenames, divIdBase, el){
  if (filenames.length > 0 ){
    //create the DOM elements
    for (i in filenames){
      jQuery("<div />", {
        "id": divIdBase + "--" + i,
        text: filenames[i],
        click: function(){get_current_node_attachment(filenames[i])}
      }).appendTo(el);
    }
  } else {
    alert('zero length filenames passed');
  }
}

// Note that the mapping of the keys to an index value could be quite brittle
// It requires the consumer of the #id to have exactly the same data
// A better approach would be to use a map to convert the iterator back into the proper
// key (where to put this?)

/*
var link_elements_format = function(links, divIdBase, el){
  var linkHtml = "";
  var urlKeys = get_keys(links);
  if (urlKeys) {
    /* ok */
/*
  } else {
    alert("Cant find URL Keys");
  }     
  for (url in links){
    var indivLabels = links[url];
    var urlIndex = obj_key_position(links, url);
    if (urlIndex >= 0) {
      if (indivLabels instanceof Array){
        /* ok */
/*        
        } else {
        indivLabels = [indivLabels]; //make array
      }
      for (i in indivLabels){ 
       console.log(divIdBase);
       var divIdLabel = divIdBase + "-" + urlIndex + "-" + i;
       linkHtml += "<a id=\"" + divIdLabel + "\" href=\"" + url + "\">" + indivLabels[i] + "</a></br>"
       //make bigger html
      }
    } else {
      alert("Cant find url in array of links keys");
    }
  }
  
  //Build Dom Element
  jQuery("<div />", {
    "id": divIdBase,
    html: linkHtml
  }).appendTo(el);
}
*/

//move out of Global space at some point
var johaSpecialFunctions = {
  //-- Some data keys are special and get their own specific display function
  //TODO: Pass elements into functions
  edit_id_elements: function(id){
    var current_node_id = jQuery('#current_node_id').text();
    if (current_node_id == id) {} else {
      alert("Current Node Id: " + current_node_id + " BUT Node Data has id: " + id + ".");
    }
  },

  edit_label_elements: function(label){
    //Note that the DOM eleemnt for label already exists, we're just inserting data into it.
    //^^Bad we should pass it in or something
    //I'm cryin 
    jQuery('#joha-edit-label--').text(node.name);
    jQuery('#joha-edit-label--').addClass('joha_edit');
  },
  
  //TODO: Create file object with filename and file data (if needed)
  edit_file_elements: function(filenames){
    //simpler code, but best behavior to make sure selecting node multiple times creates multiple data?
    jQuery('#edit_file_elements').remove();
    file_elements_format(filenames, "joha-edit-filenames", jQuery('#dn_file_data') );

  },

  edit_link_elements: function(links){
      //TODO Refactor to eliminate the need to figure out element id just so we can delete it
      var baseId = "joha_node";
      var elId = baseId + "_links";
      jQuery(elId).remove();
      var myJoha = new Joha;
      
      var customData = {};
      var myLinksEl = myJoha.buildLinksList(links, elId, customData)
      //var link_elements_format = new BuildKvlistDom({"links": links}, baseId);
      jQuery('#dn_link_data').append(myLinksEl);
    //simpler code, but best behavior to make sure selecting node multiple times creates multiple data?
//    jQuery('#joha-edit-links').remove();
//    link_elements_format(links, "joha-edit-links", jQuery('#dn_link_data') );

  },
}

var johaConfig = {
  
  specialTreatmentFields: {
    "id": johaSpecialFunctions.edit_id_elements,
    "label": johaSpecialFunctions.edit_label_elements,
    "links": johaSpecialFunctions.edit_link_elements,
    "attached_files": johaSpecialFunctions.edit_file_elements  
  },
}

var johaNodeData = {};

//indexes id with label data and iterate through children
function indexData(treeData, indexedSet){
  //indexedSet is an associative array, watch out for key dupes
  var currentIndexedSet = indexedSet || {};
  currentIndexedSet[treeData.name] = treeData.id;
  var children = treeData.children;
  if (children && children.length > 0) {
    for (var i in children) {
      child = children[i];
      indexData(child, currentIndexedSet);
    }
  }
  return currentIndexedSet;
}

function setFinder() {
		var nodes = johaNodeData;
    var names = get_keys(nodes);
    jlog('Node Names', names);
		jQuery( "#node-finder-textbox" ).autocomplete({
			source: names
		});
    jQuery( "#node-finder-textbox" ).bind( "autocompleteselect", function(event, ui) {
      foundNodeName = ui.item.value;
      foundNodeId = nodes[foundNodeName];
      actLikeNodeClicked(foundNodeId);
    });
};

function johaIndex(graphData){
  johaNodeData = indexData(graphData);
  setFinder();
  return johaNodeData;
}

function dynamicEditForm(nodeData){

  jQuery('.joha_edit').removeClass('joha_update joha_add joha_delete');
  
  //reset the label field
  jQuery('#joha-edit-label--').text("** Empty Node **");

  //create a clone of the node data because we are going to be changing it
  //but only for display reasons
  var nodeCopy = jQuery.extend({}, nodeData);
  
  //Validation not implemented yet 
  //var nodeKeys = get_keys(nodeCopy);
  //if (array_contains_all(nodeKeys, REQUIRED_DATA)) {} else {
  //alert("Not all Required Data Elements are present in Node ID: " + nodeCopy.id + "Keys:" + nodeKeys) };
  
  
  var specialTreatment = johaConfig.specialTreatmentFields;
  
  //TODO: pass the Dom locations as a parameter in the special functions rather than
  //having it hard coded in the function.
  jQuery('#dn_node_data').empty();
  jQuery('#dn_link_data').empty();
  jQuery('#dn_file_data').empty();
  
  var SHOW_EVEN_IF_NULL = [];//["user_data"];  // show this field in the form even if it doesn't exist in the data
  var someObj = domNodeFactory(nodeCopy, specialTreatment, JOHA_DATA_DEF, SHOW_EVEN_IF_NULL);
  jQuery('#dn_node_data').append(someObj);
  jlog('domObj', someObj);
  
  
  //in dynform.js library
  
  
}

//functions dealing with attached files
function get_current_node_attachment(filename){
  var currentNodeId = jQuery('#current_node_id').text();
  alert("Current Node: " + currentNodeId + " Filename: " + filename + ".");
}
    
//Graphing helpers and interactions
function insertNodesIntoGraph(aGraph, nodeLoc){

  jQuery.get(nodeLoc,
    function(graph_data) {
      jlog('indexed data', johaIndex(graph_data));
      aGraph.loadJSON(graph_data);
      aGraph.refresh();
      myGraph = aGraph; //remember this is Asynchonous.  This won't be set right away.
    },
  "json");
}

//TODO: Refactor this so it is no longer assigned by a view
// that is pulled with the /desc_data ajax query.
//Change so that only data is exchanged with server, so that any bindings
//can be done locally
function actLikeNodeClicked(node_id) {
  var visnode = myGraph.graph.getNode(node_id);
  myGraph.onClick(visnode.id);
  routeClickedNodeDataToElements(visnode);
}

//-- called when a node is clicked
function routeClickedNodeDataToElements(nodeStale) {
  //not sure why, but the node passed into the function
  //is stale, and new tree data isn't part of it
  //the below is to update the passed in node with updated
  //information
  node = $jit.json.getSubtree(myGraph.json, nodeStale.id);  //elements to receive node data

  //Need this here for parents that are not nodes
  jQuery('#current_node_id').text(node.id);
  

  //functions to distribute data to 
  show_edit_node_form(node);
  console.log(node);
  //TODO: Make this dynamic based on dataset
  add_descendant_data(jQuery('#desc-nodes'), 'label');
  add_descendant_data(jQuery('#desc-files'), 'attached_files');
  add_descendant_data(jQuery('#desc-links'), 'links');
  //make_attachment_list(node.data.attached_files, attachmentListBox);
  //make_links_list(node.data.links, linksListBox);
} 
//-- finds all descendant data for a given node
function add_descendant_data(el, node_data_type){
  //var attach_name = el.previousSibling.innerHTML;
  //var node_id = $('node_id_edit_label').innerHTML;
  var node_id = jQuery('#current_node_id').text();
  //alert(node_id);
  //using jQuery
  el.load('/desc_data', {'node_id': node_id, 'node_data_type':node_data_type });
  //TODO: Do the binding to functions here, not at the server
//  new Ajax.Updater(el, '/desc_data', {'node_id': node_id, 'node_data_type':node_data_type });
//    parameters: {'node_id': node_id, 'node_data_type':node_data_type }
// });
}


//Main Graph Functions
//--core grapher
function rgraphInit(){

    var rgraph = new $jit.RGraph({
        //Where to append the visualization
        injectInto: 'infovis',
        levelDistance: 100,
        width: 900,
        height: 700,
        //Optional: create a background canvas that plots
        //concentric circles.
        background: {
            numberOfCircles: 100,  //default - doesn't change node placement
            levelDistance: 100,  //default - doesn't change node placement
          CanvasStyles: {
            strokeStyle: '#555'
          }
        },

        //Add navigation capabilities:
        //zooming by scrolling and panning.
        Navigation: {
          enable: true,
          panning: true,
          zooming: 10
        },
        //Set Node and Edge styles.
        Node: {
            color: '#ddeeff'
        },
        
        Edge: {
          color: '#C17878',
          lineWidth:1.5
        },
        
        Events: {  
          enable: true,  
          onClick: function(node, eventInfo, e) {  
            if(node==false){
              show_create_node_form(); }
            else {
              //myGraph.onClick(node.id);
            };
          }   
        },  

        onBeforeCompute: function(node){
            Log.write("centering " + node.name + "...");
            //Add the relation list in the right column.
            //This list is taken from the data property of each JSON node.
            //I don't remember what a relation list was.  My coop into the borged files and links
            //$jit.id('inner-details').innerHTML = "Node Info: " + node.data.description;
        },
        
        onAfterCompute: function(){
            Log.write("done");
        },
        //Add the name of the node in the correponding label
        //and a click handler to move the graph.
        //This method is called once, on label creation.

        onCreateLabel: function(domElement, node){
            domElement.innerHTML = node.name;
            domElement.onclick = function() {
                rgraph.onClick(node.id);
                routeClickedNodeDataToElements(node);
            }
        },
        //Change some label dom properties.
        //This method is called each time a label is plotted.
        onPlaceLabel: function(domElement, node){
            var style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';

            if (node._depth <= 1) {
                style.fontSize = "0.8em";
                style.color = "#ccc";
            
            } else if(node._depth == 2){
                style.fontSize = "0.7em";
                style.color = "#494949";
            
            } else {
                style.display = 'none';
            }

            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
        }
    });
    return rgraph;
}

//-- Grahper Log

//JIT Graph Function (writes current status to the log element
var Log = {
    elem: false,
    write: function(text){
        if (!this.elem)
            this.elem = document.getElementById('log');
        this.elem.innerHTML = text;
        this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
    }
};