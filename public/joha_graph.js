/* Header data */


var johaGraph = {};  //Global graph container
// Write something here about initialization or getting ready, something something
$(document).ready(function() {
  //Constants
  JOHA_DATA_DEF = syncJax('/data_definition');
  
  //Temporary for Testing
  JOHA_DATA_DEF['user_data'] = "key_list_ops";
    
 
  initializeGraph();
  set_up_onClicks();
  


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

  //File Attachment Related
  jQuery('.show_add_attach_form').click(function(){
    jQuery('#add_attach_form').show();
    //jQuery('#fileupload').show();
  });
  
  jQuery('.hide_add_attach_form').click(function(){
    jQuery('#add_attach_form').hide();
    //jQuery('#fileupload').hide();
  });
  
  jQuery('.ready_attachment_button').click(function(){
    var filesToAdd = document.getElementById('add_attach_edit')
    //Attachment is uploaded when node data is saved
    readyAttachment(filesToAdd.files);
  });

  jQuery('.upload_attachment_button').click(function(){
    var filesToAdd = document.getElementById('add_attach_edit')
    //Attachment is uploaded when node data is saved
    uploadAttachments();
  });
  
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
  
  //ToDo: I think regular old bind/click will work here
  //Collect updated data when user selects to save the node data
  jQuery('#save_node_data').live('click', function(event) {
    var all_edits = {};
    fieldValueData = jQuery('.joha_field_value_container').map(function(){ return jQuery(this).data();}).get();
    jlog('all field value containers data', fieldValueData);

    
    //This is fairly elegant (but belongs somewhere else to be called by here)
    //Reduce the user operations of add, update and delete to what makes sense
    //any adds and deletes together result in NOOP (add something only to delete it?)
    //update and delete is a delete
    //add and update is add (with updated info)
    
    //This probably breaks kvlists (but not links)
    //consider using a pseudo delete class to keep delete styling in case something
    //breaks between this event and the node resetting
    
    noop = jQuery('.joha_add.joha_delete');
    noop.removeClass('joha_add joha_delete joha_update');
    
    
    addUpdate = jQuery('.joha_add.joha_update');
    //jlog('Add Update Els', addUpdate);
    addUpdate.removeClass('joha_update');
 
    
    updateDelete = jQuery('.joha_update.joha_delete');
    updateDelete.removeClass('joha_update')
    //Done with filtering operations by updating classes ^^
    
    all_edits['updates'] = filterJohaData('.joha_update');
    all_edits['adds']= filterJohaData('.joha_add');
    all_edits['deletes'] = filterJohaData('.joha_delete');
    
    var currentNodeId = jQuery('#current_node_id').text();
    saveObj = johaSaveDataFix(currentNodeId, all_edits);
    
    jlog("Save Clicked", all_edits);
    jlog("Save Obj", saveObj);

    //post to server for updating
    if (objSize(saveObj) > 0){
      jQuery.post("./node_data_update", saveObj,
      function(data){
        jlog("returned graph data", data);
        jlog("joha myGraph", johaGraph.myGraph);
        alert("loading new JSON");
        //console.log(johaGraph.myGraph.toJSON());
        //johaGraph.myGraph.op.morph(data, {
        //  type: 'fade',
        //  duration: 1500 
        //});
        
        //jlog('indexed new data', johaIndex(data));
        johaGraph.myGraph.loadJSON(data); 
        johaGraph.myGraph.refresh();
        console.log(johaGraph.myGraph.toJSON());
      },
      "json");
    } 
    
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


//-- handle updating data
function updateJeditElement(el, value, settings){

  thisEl = jQuery(el);
  
  thisEl.data("johaData__UpdatedValue", value);

  thisEl.addClass('joha_update');
 
  return value;
}

//-- file attachment handling

function readyAttachment(filesToAdd){
   jQuery('#pending_file_attachments').children().remove();
  var idx = jQuery('.joha-edit-files-pending').length;
  var divIdBase = "joha-edit-files-pending";
  console.log(filesToAdd);
  for (var i=0; i<filesToAdd.length; i++){
   var fileName = filesToAdd[i].fileName;
   index = idx + i;
   pendingFileDiv = jQuery("<div />", {
        "id": divIdBase + "--" + index,
        "class": "joha-edit-files-pending",
        text: fileName,
        data: {"johaData__fileData": filesToAdd[i]},
   });
   jQuery('#pending_file_attachments').append(pendingFileDiv);
  }
};


function redirectSubmit(){
  $('add_attach_form').target = 'files_uploaded_iframe'; //return result goes to iframe
  $('add_attach_form').submit();
};
  //
function uploadAttachments(){  
    var node_id = jQuery('#current_node_id').text()
    jQuery("#node_id_input_edit").val(node_id);
    alert(jQuery("#node_id_input_edit").val());
    redirectSubmit();
//  //Refreshes the list
    //with return value of Ajax (it's in the hidden iframe)

};


//-- -- data structures 
var file_elements_format = function(filenames, divIdBase, el){
  if (filenames.length > 0 ){
    //create the DOM elements
    for (var i in filenames){
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
    customData = {
        "johaData__FieldName": "label",
        "johaData__NodeId": jQuery('#current_node_id').text(),
        "johaData__OriginalValue": jQuery('#joha-edit-label--').text(),
        "johaData__Type": "replace_ops",
        "johaData__UpdatedValue": node.name
    }
    jQuery('#joha-edit-label--').text(node.name);
    jQuery('#joha-edit-label--').data(customData);
    jQuery('#joha-edit-label--').addClass('joha_edit joha_field_value_container');
  },
  
  //TODO: Create file object with filename and file data (if needed)
  edit_file_elements: function(filenames){
    //simpler code, but best behavior to make sure selecting node multiple times creates multiple data?
    jQuery('#file_attachment_list').html("");
    file_elements_format(filenames, "joha-edit-filenames", jQuery('#file_attachment_list') );

  },

  edit_link_elements: function(links){
      //TODO Refactor to eliminate the need to figure out element id just so we can delete it
      var baseId = "joha_node";
      var elId = baseId + "_links";
      jQuery(elId).remove();
      var myJoha = new Joha;
      
      var customData = {};
      
      //Another UGLY Hack to prevent arrays from screwing things up
      //I'm not sure why Arrays are passed in to begin with
      for (var key in links) {
        if (!key){
          return "";
        }
      }
      
      
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

// -- Autocomplete helpers
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

function figureOutDataOps(rawData, opType, op) {
  //server operations:
  // for values: add, subtract, replace
  // for keys: subtact_key, add_key
  
  //raw Data keys
  //johaData__KeyName  
  //johaData__dataValues
  // or
  //johaData__OriginalValue
  //johaData__UpdatedValue
  // also indexes are available
  
  var srvrCmdMap = {
    'updates': 'replace',
    'adds': 'add',
    'deletes': 'subtract',
  }
  
  var srvrCmd = srvrCmdMap[op];
  
  //is it a key or value item
  var keyOps = ['kvlist_ops', 'link_ops'];
  var serverSubCommand = {};
  
  var origVal = rawData["johaData__OriginalValue"];
  var keyName = rawData["johaData__KeyName"];
  var newVal = rawData["johaData__UpdatedValue"];
  var keyItem = rawData["johaData__KeyItem"];

  console.log(keyItem);
  console.log(keyName);
  console.log(newVal);
  console.log(keyItem);
  
  if (!keyItem){
    
    serverSubCommand[srvrCmd] =  {  "orig_val": origVal,
                              "new_val": newVal
                            }
                       
                       
  } else if (keyItem && keyItem == "value"){
    //alert("key-value");
    var keyOrigValue = {};
    keyOrigValue[keyName] = origVal;
    var keyNewValue = {};
    keyNewValue[keyName] = newVal;
    
    serverSubCommand[srvrCmd] =  {  "orig_val": keyOrigValue,
                                "new_val": keyNewValue
                              }

  } else if (keyItem && keyItem =="key"){
    //alert("key only");
    var srvrKeyCmd = srvrCmd + "_key";
    var origKeyValue = rawData["johaData__OriginalValue"];
    var newKeyValue = rawData["johaData__UpdatedValue"];
    serverSubCommand[srvrKeyCmd] =  { "orig_val": origKeyValue,
                                      "new_val": newKeyValue
                            }

  }
  console.log("SERVER COMMAND");
  console.log(serverSubCommand);
  return serverSubCommand;  
}

//-- Transform data collected from DOM to more suitable for server
//function johaMake
function johaSaveDataFix(nodeId, domSaveObj) {

  
  //TODO: This approach could use some re-architecting
  //determines where to send the data to format
  //based on data type
 
  //transfrom from node - operation - nodedata format to
  //  node - fieldName - operation - operation data
  // and filtering out unnecessary operations (like add + delete)
  var saveObj = {}
  var xformObj = {}

  
  for (var op in domSaveObj){
    //work on particular operation (add, update, delete) data
    var opObj = domSaveObj[op];
    for (var i in opObj){
      //parse particular user operation
      var fieldName = null;
      var operation = op;
      var rawOpData = {};
      var dataType = null;
      
      johaData = opObj[i];
      for (var johaKey in johaData) {
      //work on the data provided for the operation on that particular field
        if (johaKey == "johaData__NodeId"){
          if (nodeId != johaData[johaKey]){
            alert('Node Id mismatch between Edit Data and Current Node');
          }
        } else if(johaKey == "johaData__FieldName") {
          fieldName = johaData[johaKey];
        } else if(johaKey == "johaData__Type") {
          dataType = johaData[johaKey];
        } else {
          rawOpData[johaKey] = johaData[johaKey];
        }
      }
      xformObj[fieldName] = xformObj[fieldName] || {};
      var tmpOpObj = {};
      tmpOpObj[op] = rawOpData;
      xformObj[fieldName]["rawData"] = xformObj[fieldName]["rawData"] || []
      xformObj[fieldName]["rawData"].push(tmpOpObj);
      xformObj[fieldName]["op_type"] = dataType;

      //**//filter uneccessary operations
      //**var ops = get_keys(xformObj[fieldName]);
      //**console.log('Ops before filtering');
      //**console.log(ops);
      //**//-- add + delete = NOOP
      //**if (array_contains(ops, "adds") && array_contains(ops, "deletes")){
      //**  xformObj[fieldName] = {};
      //**}
      
      //-- any delete takes precedence
      
      //console.log('Ops after filtering');
      //var ops = get_keys(xformObj[fieldName]);
      //console.log(ops);
    }
    //We've now parsed a particul user operations
    console.log('User Operation: ' + op);
    console.log(xformObj);
  }
  //gather field value related data
  for (var fieldObj in xformObj){
    var opList = []
    var opType = xformObj[fieldObj]["op_type"];

    var fieldRawData = xformObj[fieldObj];
    
    for (var i in fieldRawData["rawData"]) {
      dataByOp = fieldRawData["rawData"][i];
      for (var op in dataByOp){
        var tmpData = {};
        var rawData = dataByOp[op];
        var serverSubCmd = figureOutDataOps(rawData, opType, op);
        //jlog("Server Sub Cmd", serverSubCmd);
        //var opSrvrData = {};
        //opSrvrData[fieldName] = serverSubCmd;
        //tmpData["serverOps"] = opSrvrData;
        //tmpData["op"] = op;
        opList.push(serverSubCmd);
      }
      
    }
    //delete xformObj[fieldObj]["rawData"];
    xformObj[fieldObj]["op_list"] = opList;    
  }
  if (objSize(xformObj) > 0){
    saveObj[nodeId] = xformObj;
    return saveObj;
  } else {
    return {}
  }
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
      console.log(graph_data);
      aGraph.loadJSON(graph_data);
  
      aGraph.refresh();
      johaGraph.myGraph = aGraph; //remember this is Asynchonous.  This won't be set right away.
    },
  "json");
  
}

//TODO: Refactor this so it is no longer assigned by a view
// that is pulled with the /desc_data ajax query.
//Change so that only data is exchanged with server, so that any bindings
//can be done locally
function actLikeNodeClicked(node_id) {
  var visnode = johaGraph.myGraph.graph.getNode(node_id);
  johaGraph.myGraph.onClick(visnode.id);
  routeClickedNodeDataToElements(visnode);
}

//-- called when a node is clicked
function routeClickedNodeDataToElements(nodeStale) {
  //not sure why, but the node passed into the function
  //is stale, and new tree data isn't part of it
  //the below is to update the passed in node with updated
  //information
  node = $jit.json.getSubtree(johaGraph.myGraph.json, nodeStale.id);  //elements to receive node data

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