/* joha_graph.js  copyright David Martin 2011 */
/* Description 
    Very flexible data visualization and editing tool that can accept user defined
    complex data structures and provide fine grained editing based on those structures.

    How it works
    Requires server-side interface (TODO: Define a specific API)
    For data visualization, the Javascript InfoVis Toolkit (http:\\thejit.org) is used.
    The server side interface enables interfaces to various data stores
      Currently using CouchDB for custom data, and Metafilter Music Charts for web data
      to evaluate this prototype, but others can easily be supported by the server side
      libraries (see https://github.com/forforf/tinkit and the examples included in it)
    The server-side also has a library for determining relationships between nodes/records.
      Currently a given record must have an array of ids of related records. However, rather
      than a parent record identifying its children, the record should identify its parents.
      An example of this would be a record using tags. The tags are in effect "parents" of the
      given record. (see https://github.com/forforf/kinkit)
    Finally the server-side has libraries for formatting the records into the specific format
    used by the Javascript InfoVis Toolkit (Jit).
      Jit requires tree-based (or for some visualizations, ajdacency-based) JSON data. See
      thejit.org for specific format details. Of particular import is that each node (which
      corresponds to a given data record) requires two fields, an ID and a Name field.
      The binding between the native data fields and the two required fields is done on the
      server-side as well (see https://github.com/joha_model).  The binding is not hardcoded,
      but has yet not been exposed to allow user defined bindings.  For example, if the user
      data had it's primary key defined as "GUID", a field called "title" that described that
      particular node, and had a field called "tags" that described the relationship of a 
      particular node to others (note that the "others" don't have to actually exist in the 
      recordset), then it would be straight forward to update the bindings for that data source
      such that the id required for JIT was bound to the GUID field, and the Jit name was bound
      to the title field, and the Jit structure was based on the data contained in the "tags"
      field. (TODO: Provide an API that allows end users to identify the bindings)
      
    Data Structure Requirements
    Required Data for Visualization
      id: A unique id identifying the node (i.e. record)
      name: A text label to apply to the node.
      data: Custom data, used by this to hold the complete node (i.e. record) data. This including
        the data fields bound to id and name
      children [or adjacencies]: The nodes that are related to the current node. Note that stubs
        (a node that only consists of an id and name) are created if there is relationship 
        information that does not map to any records in the record set.
        
    Required Data for Editing
      The user data is stored in the data field of the Jit node. The user data required:
      id: A unique id identifying the record (also used to identify the node)
      label: A short text description of the node. (TODO: Currently hard coded, make configurable)
      
    Predefined Fields for Editing
      These fields are not required, but if used, must follow a specific format and/or behavior.
      Users can populate these fields, but not change their structure or names.
      links: Example, URL links (but not restricted to those). Data must be of the format
        { <link location>: link name } for example {"http://www.google.com":"google"}
        TODO: Covert links from being bound to a field name to a new data type that can be bound 
        to any field name.
      attached_files: Holds any file attachments associated with that node. Because files can't
        be handled by normal JS constructs, attached files have unique constructs for editing
        (namely uploading files).
      
    Custom Fields of pre-defined data types
      Pre-Defined data types
        static_ops: Data in a field of this type cannot be changed
        replace_ops: Data in a field of this type can only be modified (i.e. just like a text box)
        list_ops: Array type data. New items can be added, items can be removed, and individual items
          can be modified.
        kv_list_ops: [Not fully tested yet] Data in lists with each list associated with a key. For
          example:  "food": ["banana", "apple"]   "drinks": ["beer", "water"]
          data in this type of field can have new keys added added. Example, adding "sports" as
          a key. Keys can be deleted (which also removes all data associated with that key), as well
          as modified (e.g. chaning "food" to "foods").
          Each key list acts like list_ops, and can have new members added, members removed,
          or individual member content edited.
        TODO: Add link_ops to the list (and maybe remove "ops")
        
      Custom Fields of custom user data
        Currently this can be done by assigning the field data as static_ops or replace_ops.
        The data would not have the fine grained editing control of the other fields.
        Advanced TODO: Ability for user to build their own fine grained editor for their data.
*/    
    
      
/* Header data */

var JohaNodeEditor = require('JohaNodeEditor').JohaNodeEditor;
var johaRG = require('JohaRGraph')
var makeJohaRGraph = johaRG.makeJohaRGraph;
var JohaGraph = johaRG.JohaGraph;


var $johaGraph = {};  //Global graph container
$j(document).ready(function() {
  //Server provided Constants
  JOHA_DATA_DEF = syncJax('/data_definition');

  //do this to ensure we can't clobber the constant JOHA_DATA_DEF
  $johaGraph.dataDef = function(){ return jQuery.extend(true, {}, JOHA_DATA_DEF); };
  
  //Temporary for Testing
  //johaGraph.dataDef()['user_data'] = "key_list_ops";
    
  initializeGraph();
  set_up_onClicks();
  setUpComboBox();
  
});


//-- Get neccessary server side initialization data
function syncJax(srcUrl) {
  var retVal = "";
  
  jQuery.ajax({
    url:srcUrl,
    success: function(retData){retVal = retData;}, async:false
  });
  
  console.log(retVal);
  return retVal
}

//-- Set up listeners (onclick, etc)

//including onChange
function set_up_onClicks() {

  $j('#rotate_test').click(function(){
    var theta = Math.PI/2;
    $johaGraph.myGraph.graph.eachNode(function(n) { 
      var p = n.getPos('current'); 
      p.theta += theta; 
      if (p.theta < 0) { 
        p.theta += Math.PI * 2; 
      } 
    }); 
   $johaGraph.myGraph.plot(); 
    });

  //Create Node
  $j('#create_node').click(function(){
    var nodeId = $j('#create_node_id').val();
    var nodeLabel = $j('#create_node_label').val();
    var nodeParents = $j('#create_node_parents').val();
    if (nodeId.length == 0) {
      alert("Node ID can't be empty");
      return "";
    }
    //ToDo: Validate nodeID unique?
    if (nodeLabel.length == 0) {
      alert("Node Label can't be empty");
      return "";
    }
    var node_data = {
      node_id: nodeId,
      node_label: nodeLabel,
      node_parents: nodeParents
    };
    jQuery.post("./create_node", node_data,
      function(data){
        //alert('create node post succeeded');
        var node = {};
        console.log(data);
        var graph = data.graph
        var node_data = data.node;
        newNodeCreated(data)
        //show_edit_node_form({data: node_data});
      }, "json");
      //data type goes here, i.e., ,"json"
    //);
  });

  //Delete Node click
  $j('#delete_node').click(function(){
    var node_id = $j('#current_node_id').text();
    var delMsg = 'Delete Node: ' + node_id;
    var confirmDelete = $j('<div />')
      .html(delMsg)
      .dialog({
        autoOpen: false,
        title: 'Delete Node',
        buttons: [
          {
            text: "Cancel",
            click: function() {$j(this).dialog("close"); }
          },
          { text: "Delete it all",
            click: function() {deleteNode(node_id); $j(this).dialog("close");}
          }
        ]
      });
      
    
      
    //open dialog
    confirmDelete.dialog('open');
  });
 
/* 
  //File Attachment Related
  $j('.show_add_attach_form').click(function(){
    $j('#add_attach_form').show();
    //$j('#fileupload').show();
  });
  
  $j('.hide_add_attach_form').click(function(){
    $j('#add_attach_form').hide();
    //$j('#fileupload').hide();
  });
  
  $j('.ready_attachment_button').click(function(){
    var filesToAdd = document.getElementById('add_attach_edit')
    //Attachment is uploaded when node data is saved
    readyAttachment(filesToAdd.files);
  });

  $j('.upload_attachment_button').click(function(){
    var filesToAdd = document.getElementById('add_attach_edit')
    //Attachment is uploaded when node data is saved
    uploadAttachments();
  });
  
  $j('.delete_attach_list').click(function(){
    var node_id = $j('#current_node_id').text();
    var fileAttachmentDeletes = $j('.file_attachment_name.joha_delete').map(function() {
     return $j(this).text();
    }).get()
        
    var deleteFileData = {
      "node_id": node_id,
      "del_files": fileAttachmentDeletes
    };
  
    
    jQuery.post("./delete_files", deleteFileData,
      function(data){
        //TODO: Synchronize the setting of base IDs
        $j('#file_attachment_list').children().remove();
        files_element_format(data, "joha-edit-filenames", $j('#file_attachment_list'));
      },
    "json");
  });
*/  
/*
  //Set up editing in place (JQuery plugin Jeditable)
  //-- wrap it in .live so that future elements can use it
  //changed 'click' to 'hover' so single click editing works
  $j('.edit').live('hover', function(event) {

    event.preventDefault();

    console.log("click event", event);

    //call the updateJeditElement function when an item is edited in place
    $j(this).editable( function(value, settings){
      var retVal = updateJeditElement(this, value, settings);
      console.log(retVal);
      return retVal
      }, {
      style: 'display: inline'
    });
    
  });
*/  
  //ToDo: I think regular old bind/click will work here
  //Collect updated data when user selects to save the node data
  $j('#save_node_data').click(function(event) {
  //$j('#save_node_data').live('click', function(event) {
    
    var all_edits = {};
    fieldValueData = $j('.joha_field_value_container').map(function(){ return $j(this).data();}).get();
    console.log('all field value containers data', fieldValueData);

    
    //This is fairly elegant (but belongs somewhere else to be called by here)
    //Reduce the user operations of add, update and delete to what makes sense
    //any adds and deletes together result in NOOP (add something only to delete it?)
    //update and delete is a delete
    //add and update is add (with updated info)
    
    //This probably breaks kvlists (but not links)
    //consider using a pseudo delete class to keep delete styling in case something
    //breaks between this event and the node resetting
    
    noop = $j('.joha_add.joha_delete');
    noop.removeClass('joha_add joha_delete joha_update');
    
    
    addUpdate = $j('.joha_add.joha_update');
    //jlog('Add Update Els', addUpdate);
    addUpdate.removeClass('joha_update');
 
    
    updateDelete = $j('.joha_update.joha_delete');
    updateDelete.removeClass('joha_update')
    //Done with filtering operations by updating classes ^^
    
    //fileAttachmentDeletes = $j('.file_attachment_name.joha_delete').map(function() {
    //  return $j(this).text();
    // }).get()
    
    
    all_edits['updates'] = filterJohaData('.joha_update');
    all_edits['adds']= filterJohaData('.joha_add');
    all_edits['deletes'] = filterJohaData('.joha_delete');
    //all_edits['file_deletes'] = fileAttachmentDeletes;
    
    var currentNodeId = $j('#current_node_id').text();
    saveObj = johaSaveDataFix(currentNodeId, all_edits);
    
    console.log("Save Clicked", all_edits);
    console.log("Save Obj", saveObj);

    //post to server for updating
    if (objSize(saveObj) > 0){
      jQuery.post("./node_data_update", saveObj,
        function(data){
          //jlog("returned graph data", data);
          //jlog("joha myGraph", johaGraph.myGraph);
          //alert("loading new JSON");
          //console.log(johaGraph.myGraph.toJSON());
          //johaGraph.myGraph.op.morph(data, {
          //  type: 'fade',
          //  duration: 1500 
          
          johaIndex(data);
          $johaGraph.myGraph.loadJSON(data); 
          $johaGraph.myGraph.refresh();
          actLikeNodeClicked(currentNodeId);
          //console.log(johaGraph.myGraph.toJSON());
        },
        "json");
    } 
    
    //revert data to default (by acting like the node is clicked)
    console.log("Save Clicked", "TODO: Revert updated data to unchanged after node is saved");
    
    
  });


  //Collect updated data when user selects to save the node data
  $j('#clear_node_edits').live('click', function(event) {
    //clear the edit classes then reset the node
    var editClasses = ['joha_add', 'joha_delete', 'joha_update'];
    for (i in editClasses){
      var editClass = editClasses[i];
      $j('.'+editClass).removeClass(editClass);
    }
    //reset node 
    var nodeId = $j('#current_node_id').text();
    actLikeNodeClicked(nodeId);
  });  
 
 /*
  //listen for clicks on delete buttons
  $j('.delete_controls').live('click', function(event) {
    event.preventDefault();
    
    delData = $j(this).data();

    console.log('delete clicked', delData );
    toggleDelete(delData.johaData__deleteContainerId);
  });
*/
/*
  // $j('#create_node').live('click', function(event) {
  //  nodeId = $j('#create_node_id').val();
  //  nodeLabel = $j('#create_node_label').val();
  //  nodeParents = $j('#create_node_parents').val();
  //  var initialNodeData = {id: nodeId, label: nodeLabel, parents: nodeParents};
  //  console.log(initialNodeData);
  // });
*/
}


function newNodeCreated(data){
  var nodeData = data.node;
  var graphData = data.graph;
  console.log(nodeData);
  //console.log(graphData);
  //TODO: See if there maybe an more elegant way of seeing if node is attached to graph
  //comparing root nodes??, leveraging server side information when node is created?
  var nodeId = nodeData.id;
  var parentsIds = nodeData.parents;
  //Do parents exist in graph?
  for (var i=0;i<parentsIds.length;i++) {
    var parentId = parentsIds[i];
    node_in_graph = $johaGraph.myGraph.graph.getNode(parentId);
    console.log(node_in_graph);
    console.log($johaGraph.myGraph.toJSON());
    var topNodeId = $johaGraph.myGraph.toJSON().id;
    console.log(topNodeId);
    
    if ( (node_in_graph) ) {
      johaIndex(graphData);
      $johaGraph.myGraph.loadJSON(graphData); 
      $johaGraph.myGraph.refresh();
      actLikeNodeClicked(nodeId);
    } else if (topNodeId===undefined) { 
      //topNodeId doesn't exist, redirect (i.e. a brand new graph)
      alert(topNodeId);
      window.location = "redirect_to_graphs";
    } else {  
        var msg = "The new node (" + nodeId + ") is not linked to this graph.  "
        msg += "You can stay on this graph, or go to the graph select screen to select the graph with the new node";
        var unlinkedNodeDialog = $j('<div />')
      .html(msg)
      .dialog({
        autoOpen: false,
        title: 'Unlink Node Created',
        buttons: [
          {
            text: "Stay",
            click: function() {$j(this).dialog("close"); }
          },
          { text: "Choose Graph",
            click: function() {window.location = "/redirect_to_graphs";}
          }
        ]
      });
      
    
      
    //open dialog
    unlinkedNodeDialog.dialog('open');
    }
  }
  
  //show_edit_node_form(nodeData);
}

function initializeGraph(){
  //blankGraph = rgraphInit(); //insert canvas into here if you can figure it out
  //blankGraph = makeJohaRGraph(Log); //ToDo: RGraph Log isn't working, fix it
  var blankJohaGraph = new JohaGraph();
  //blankGraph = blankJohaGraph.thisRGraph;
  var nodeSource = '/index_nodes';
  //the below assigns the node data to myGraph (via Ajax)
  insertNodesIntoGraph(blankJohaGraph, nodeSource);
  //setAuthToken('authtok_attach_form');  
}
    
//Element Manipulation functions
//--Showing/Hiding Edit Forms
function show_create_node_form(){
  $j('#edit-node-form').hide();
  $j('#descendant-info').hide();
  $j('#create-node-form').show();
  generateCreateNode();
}

function show_edit_node_form(node){
  $j('#create-node-form').hide();
  dynamicEditForm(node.data); 
  $j('#edit-node-form').show();
  $j('#descendant-info').show();
}

function toggle(divId) {
  jqId = '#' + divId
	var ele = $j(jqId)[0];
	if(ele.style.display != "none") {
    		ele.style.display = "none";
  } else {
    ele.style.display = "block";
  }
}

function toggleDelete(elId) {
  jqId = '#' + elId
	var ele = $j(jqId);
	if( ele.is('.delete_show') ) {
    ele.removeClass('delete_show');
  } else {
    ele.addClass('delete_show')
  }
}

//-- New node creation
function generateCreateNode(){
  //Add in suggestion for ID
  var current_node_id = $j('#current_node_id').text();
  
  var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  
  $j('#create_node_id').val(guid);
  
  //Add suggestoin for parents
  $j('#create_node_parents').val(current_node_id);
  $j('#current_node_id').text("");
  //NOT HERE BUT add listener for create button
  //update to the new node and edit function
}

//-- Delete Node
function deleteNode(nodeId){
  jQuery.post("./delete_node", {node_id: nodeId},
        function(data){
          alert("node deleted");
          console.log(data);
          if (data.lenth>0){
            johaIndex(data);
            $johaGraph.myGraph.loadJSON(data); 
            $johaGraph.myGraph.refresh();
          } else {
            window.location = "/redirect_to_graphs";
          }
        });
}
/*
//-- handle updating data
function updateJeditElement(el, value, settings){

  thisEl = $j(el);
  
  thisEl.data("johaData__UpdatedValue", value);

  thisEl.addClass('joha_update edit_text');
 
  return value;
}
*/
//-- file attachment handling
/*
function readyAttachment(filesToAdd){
  var joha = new Joha();
   $j('#pending_file_attachments').children().remove();
  var idx = $j('.joha-edit-files-pending').length;
  var divIdBase = "joha-edit-files-pending";
  console.log(filesToAdd);
  var pendingLabelId = "pending_files_label"
  var pendingFileSectionLabel = "<span id =\"" + pendingLabelId + "\">Pending Attachments</span>";
  
  var filesIdBase = divIdBase + "_";
  for (var i=0; i<filesToAdd.length; i++){
   var fileName = filesToAdd[i].fileName;
   if (fileName.length == 0) { continue; }
   
   var index = idx + i;
   var fileIdBase = filesIdBase + index;
    
    //for (var i in filenames){
      
    var fileWr = $j("<div />", {
      "id": fileIdBase + "_wr_" + index,
      "class": "pending_file_wrapper",
    });   
     var pendingFileEl = joha.buildSimpleElem.staticValueElement(fileName, fileIdBase);
     
     fileWr.append(pendingFileEl);
     //fileDelCtl = joha.buildSimpleElem.deleteControl(pendingFileEl, fileIdBase);
     
     var elId = "pending_delete";
     var elClass = "delete_controls";
     //TODO: This is duplicative but joha builder was not abstract enough
     var elHtml = "<img id=\"" + elId + "\" class=\"" + elClass + "\" src=\"./images/delete_normal.png\" alt=\"-\" />"
     var target = fileWr;
     //johaTgt and johaCtl are available with the event.data parameter by way of controlObj
      var eventActions = {'click': function(event){
        console.log("Pending deleteControl clicked, Target:", event.data.johaTgt);
        event.data.johaTgt.remove();
        if ($j('.pending_file_wrapper').length == 0) {
          $j('#pending_file_attachments').hide;
        }
      }};
     var delCtl = johaPats.controlObj(elHtml, target, eventActions);
     fileWr.append(delCtl);
     //});
     //pendingFileDiv.data({"johaData__fileData": filesToAdd[i]})
     
     $j('#pending_file_attachments').append(fileWr);
  }
};
*/

/*
function redirectSubmit(){
  $('add_attach_form').target = 'files_uploaded_iframe'; //return result goes to iframe
  $('add_attach_form').submit();
};
*/
  //
/*
function uploadAttachments(){  
    var node_id = $j('#current_node_id').text()
    $j("#node_id_input_edit").val(node_id);
    alert($j("#node_id_input_edit").val());
    redirectSubmit();
//  //Refreshes the list
    //with return value of Ajax (it's in the hidden iframe)

};
*/

/*
function downloadAttachment(nodeId, attName) {
  var downloadUrl = "/download/" + nodeId + "/" + attName
  window.location.href = downloadUrl;
}
*/

/*
//-- -- data structures 
var files_element_format = function(filenames, divIdBase, el){
  var joha = new Joha;
  
  if (filenames.length > 0 ){
    //create the DOM elements
    var filesIdBase = divIdBase + "_";
    for (var i in filenames){
      var fileIdBase = filesIdBase + i;
      var fileWr = $j("<div />", {
        "id": fileIdBase,
      });
      var filename = filenames[i];
      var fileLabel = joha.buildSimpleElem.staticValueElement(filename, fileIdBase);
      fileLabel.addClass('file_attachment_name');
      fileLabel.click(function() {
        var node_id = $j('#current_node_id').text();
        downloadAttachment(node_id, filename);
      });
      fileWr.append(fileLabel);
      var fileDelCtl = joha.buildSimpleElem.deleteControl(fileLabel, fileIdBase);
      fileWr.append(fileDelCtl);
      fileWr.appendTo(el);

    }
  } else {
    alert('zero length filenames passed');
  }
}
*/
/*

//move out of Global space at some point
var johaSpecialFunctions = {
  //-- Some data keys are special and get their own specific display function
  //TODO: Pass elements into functions
  edit_id_elements: function(id){
    var current_node_id = $j('#current_node_id').text();
    if (current_node_id == id) {} else {
      alert("Current Node Id: " + current_node_id + " BUT Node Data has id: " + id + ".");
    }
  },

  edit_label_elements: function(label){
    //Note that the DOM eleemnt for label already exists, we're just inserting data into it.
    //^^Bad we should pass it in or something
    customData = {
        "johaData__FieldName": "label",
        "johaData__NodeId": $j('#current_node_id').text(),
        "johaData__OriginalValue": $j('#joha-edit-label--').text(),
        "johaData__Type": "replace_ops",
        "johaData__UpdatedValue": node.name
    }
    $j('#joha-edit-label--').text(node.name);
    $j('#joha-edit-label--').data(customData);
    $j('#joha-edit-label--').addClass('joha_edit joha_field_value_container');
  },
  
  //TODO: Create file object with filename and file data (if needed)
  edit_file_elements: function(filenames){
    //simpler code, but best behavior to make sure selecting node multiple times creates multiple data?
    $j('#file_attachment_list').html("");
    files_element_format(filenames, "joha-edit-filenames", $j('#file_attachment_list') );

  },

  edit_link_elements: function(links){
      //TODO Refactor to eliminate the need to figure out element id just so we can delete it
      var baseId = JOHA_ID;
      var elId = baseId + "_links";
      $j(elId).remove();
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
      $j('#dn_link_data').append(myLinksEl);
    //simpler code, but best behavior to make sure selecting node multiple times creates multiple data?
//    $j('#joha-edit-links').remove();
//    link_elements_format(links, "joha-edit-links", $j('#dn_link_data') );

  },
}
*/
/*
var johaConfig = {
  
  specialTreatmentFields: {
    "id": johaSpecialFunctions.edit_id_elements,
    "label": johaSpecialFunctions.edit_label_elements,
    "links": johaSpecialFunctions.edit_link_elements,
    "attached_files": johaSpecialFunctions.edit_file_elements  
  },
}
*/
// -- Autocomplete helpers
var johaNodeData = {};

//indexes id with label data and iterate through children
function indexData(treeData, indexedSet){
  
  //indexedSet is an associative array, watch out for key dupes
  //is of the form { name1: id1, name2: id2, .... }
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
    console.log('Node Names', names);
		$j( "#node-finder-textbox" ).autocomplete({
			source: names
		});
    $j( "#node-finder-textbox" ).bind( "autocompleteselect", function(event, ui) {
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

/*
function figureOutDataOps(rawData, opType, op) {
  console.log('raw Data', rawData);
  console.log('opType', opType);
  console.log('op', op);
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
*/
/*
//-- Transform data collected from DOM to more suitable for server
//function johaMake
function johaSaveDataFix(nodeId, domSaveObj) {
  //var currentRoot = johaGraph.myGraph.json.data.id;
  var currentRoot = $j('#current_node_id').text();
  console.log(johaGraph.myGraph.json);
  alert('current root: ' + currentRoot);
  
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

      ////filter uneccessary operations
      //**var ops = get_keys(xformObj[fieldName]);
      //**console.log('Ops before filtering');
      //**console.log(ops);
      ////-- add + delete = NOOP
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
*/
function dynamicEditForm(nodeData){

  $j('.joha_edit').removeClass('joha_update joha_add joha_delete');
  
  //reset the label field
  $j('#joha-edit-label--').text("** Empty Node **");

  //create a clone of the node data because we are going to be changing it
  //but only for display reasons
  var nodeCopy = jQuery.extend(true, {}, nodeData);
  //Validation not implemented yet 
  //var nodeKeys = get_keys(nodeCopy);
  //if (array_contains_all(nodeKeys, REQUIRED_DATA)) {} else {
  //alert("Not all Required Data Elements are present in Node ID: " + nodeCopy.id + "Keys:" + nodeKeys) };
  
  
//  var specialTreatment = johaConfig.specialTreatmentFields;

  
  //TODO: pass the Dom locations as a parameter in the special functions rather than
  //having it hard coded in the function.
  $j('#dn_node_data').empty();
  $j('#dn_link_data').empty();
  //TODO: Make #dn_file_data dynamic?
  //$j('#dn_file_data').empty();
  
  var SHOW_EVEN_IF_NULL = [];//["user_data"];  // show this field in the form even if it doesn't exist in the data
  console.log('node copy', nodeCopy);
  //console.log('Special Treat', specialTreatment);
  //var joha_data_def = johaGraph.dataDef();
  //var someObj = domNodeFactory(nodeCopy, specialTreatment, joha_data_def, SHOW_EVEN_IF_NULL);
  var baseObj = new JohaNodeEditor(nodeCopy);
  var someObj = baseObj.view();
  $j('#dn_node_data').append(someObj);
  console.log('Dynamically creatted node data obj', someObj);
  
  
  //in dynform.js library
}

/*
function createNewField(newFieldName) {
  var newType = $joha_data_def()[newFieldName];
  
  var dataValue;
  if (newType === "static_ops" || newType === "replace_ops"){
    //alert('Text Based');
    //alert(newType);
    dataValue = " *new* ";
    createCommon(newFieldName, newType, dataValue);
  } else if (newType === "list_ops"){
    //alert('List Based')
    //alert(dataValue)
    dataValue = [];
    createCommon(newFieldName, newType, dataValue);
    
  //TODO: Fix so links is its own type
  } else if (newFieldName === "links"){
    createLinks();
    dataValue = [];
  } else {
    alert("something else -  " + newType + ":" + newFieldName);
    dataValue = {};
  }
}  
 */
 /*
function createCommon(newFieldName, newType, dataValue) {
  var fieldData = {};
  fieldData[newFieldName] = dataValue;

  
  if (newType) {
    //alert("Val/Type: " + newVal + " / " + newType);
    //TODO: DRY THIS UP to be identical (not copied) to creating from node data
    
    var johaBuilder = new Joha;
 
    
    var nodeId = $j("#current_node_id").text();
    //console.log($j('#dn_node_data_children'));
    var fieldIndex = $j('#dn_node_data_children').children().length;

    var fieldDom = domFieldFactory(newType, fieldData, JOHA_ID, johaBuilder, nodeId, fieldIndex)
    fieldDom.addClass('new_field');
    console.log("New Field Created");
    console.log(fieldDom);
    $j('#dn_node_data_children').append(fieldDom);
  } else {
    alert( "Choose a Type for " + newFieldName );
  }
  //setTimeout(function(){$j('#add_field_combobox').next().blur();},2);
}
*/
/*
function createLinks(){
  var elId = JOHA_ID + "_links";
  var myJoha = new Joha;
  var myLinksEl = myJoha.buildLinksList({}, elId, {})
  console.log(myLinksEl);
  $j('#dn_link_data').append(myLinksEl);
}
*/

/*
function get_current_node_attachment(filename){
  var currentNodeId = $j('#current_node_id').text();
  //alert("Current Node: " + currentNodeId + " Filename: " + filename + ".");
}
*/
    
//Graphing helpers and interactions
function insertNodesIntoGraph(aJohaGraph, nodeLoc){
  $johaGraph.johaObj = aJohaGraph;
  aGraph = aJohaGraph.thisRGraph;
  $j.get(nodeLoc,
    function(graph_data) {
      console.log(graph_data);
      johaIndex(graph_data);
      console.log(aGraph);
      aGraph.loadJSON(graph_data);
  
      aGraph.refresh();
      $johaGraph.myGraph = aGraph; //remember this is Asynchonous.  This won't be set right away.
    },
  "json");
  
}


function actLikeNodeClicked(node_id) {
  var visnode = $johaGraph.myGraph.graph.getNode(node_id);
  alert(visnode);
  $johaGraph.myGraph.onClick(visnode.id);
  $johaGraph.routeClickedNodeDataToElements(visnode);
}

//-- called when a node is clicked
function routeClickedNodeDataToElements(nodeStale) {
  //not sure why, but the node passed into the function
  //is stale, and new tree data isn't part of it
  //the below is to update the passed in node with updated
  //information
  //node = $jit.json.getSubtree($johaGraph.myGraph.json, nodeStale.id);  //elements to receive node data
  console.log('routing - stale node', nodeStale);
  node = $johaGraph.johaObj.freshNode(nodeStale)
  console.log('routing - fresh node', node);
  
  //Need this here for parents that are not nodes
  //TODO: investigate using $jit to avoid duplication
  $j('#current_node_id').text(node.id);
  

  //functions to distribute data to 
  show_edit_node_form(node);
  console.log("Routing CLicked Node", node);
  //TODO: Make this dynamic based on dataset
  add_descendant_data($j('#desc-nodes'), 'label');
  add_descendant_data($j('#desc-files'), 'attached_files');
  add_descendant_data($j('#desc-links'), 'links');
  //make_attachment_list(node.data.attached_files, attachmentListBox);
  //make_links_list(node.data.links, linksListBox);
  
  //Create dropdown box with the list of options determined by the edit node form
  
  //var contextEl = $j('#dn-node-data');
//  var select = $j('#add_field_combobox');
//  //console.log(contextEl)
//  updateComboBoxList(select, $joha_data_def());
//  select.combobox({
//    selected: function(event, ui) {

      //console.log(event);
      //console.log(ui);
//      createNewField(ui.item.text);
//    }
//  });
} 
// ToDo: Remove the function from global space in all cases
$johaGraph.routeClickedNodeDataToElements = routeClickedNodeDataToElements;

//-- finds all descendant data for a given node
function add_descendant_data(el, node_data_type){
  //var attach_name = el.previousSibling.innerHTML;
  //var node_id = $('node_id_edit_label').innerHTML;
  var node_id = $j('#current_node_id').text();
  //alert(node_id);
  //using jQuery
  el.load('/desc_data', {'node_id': node_id, 'node_data_type':node_data_type });
  //TODO: Do the binding to functions here, not at the server
//  new Ajax.Updater(el, '/desc_data', {'node_id': node_id, 'node_data_type':node_data_type });
//    parameters: {'node_id': node_id, 'node_data_type':node_data_type }
// });
}


// ToDo: Remove as the JohaRGraph module does this now
////Main Graph Functions
////--core grapher
//function rgraphInit(){
//  var rgraph = makeJohaRGraph(Log)
//  return rgraph;
//}

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



 
 function setUpComboBox() {}
 
  (function( $ ) {
      $.widget( "ui.combobox", {
        _create: function() {
          var self = this,
            select = this.element.hide(),
            selected = select.children( ":selected" ),
            value = selected.val() ? selected.text() : "";
          var input = this.input = $( "<input>" )
            .insertAfter( select )
            .val( value )
            .autocomplete({
              delay: 0,
              minLength: 0,
              source: function( request, response ) {
                var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
                response( select.children( "option" ).map(function() {
                  var text = $( this ).text();
                  if ( this.value && ( !request.term || matcher.test(text) ) )
                    return {
                      label: text.replace(
                        new RegExp(
                          "(?![^&;]+;)(?!<[^<>]*)(" +
                          $.ui.autocomplete.escapeRegex(request.term) +
                          ")(?![^<>]*>)(?![^&;]+;)", "gi"
                        ), "<strong>$1</strong>" ),
                      value: text,
                      option: this
                    };
                }) );
              },
              select: function( event, ui ) {
                ui.item.option.selected = true;
                self._trigger( "selected", event, {
                  item: ui.item.option
                });
              },
              change: function( event, ui ) {
                if ( !ui.item ) {
                  var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
                    valid = false;
                  select.children( "option" ).each(function() {
                    if ( $( this ).text().match( matcher ) ) {
                      this.selected = valid = true;
                      return false;
                    }
                  });
                  if ( !valid ) {
                    // remove invalid value, as it didn't match anything
                    $( this ).val( "" );
                    select.val( "" );
                    input.data( "autocomplete" ).term = "";
                    return false;
                  }
                }
              }
            })
            .addClass( "ui-widget ui-widget-content ui-corner-left" );

          input.data( "autocomplete" )._renderItem = function( ul, item ) {
            return $( "<li></li>" )
              .data( "item.autocomplete", item )
              .append( "<a>" + item.label + "</a>" )
              .appendTo( ul );
          };

          this.button = $( "<button type='button'>&nbsp;</button>" )
            .attr( "tabIndex", -1 )
            .attr( "title", "Show All Items" )
            .insertAfter( input )
            .button({
              icons: {
                primary: "ui-icon-triangle-1-s"
              },
              text: false
            })
            .removeClass( "ui-corner-all" )
            .addClass( "ui-corner-right ui-button-icon" )
            .click(function() {
              // close if already visible
              if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
                input.autocomplete( "close" );
                return;
              }

              // work around a bug (likely same cause as #5265)
              $( this ).blur();

              // pass empty string as value to search for, displaying all results
              input.autocomplete( "search", "" );
              input.focus();
            });
        },

        destroy: function() {
          this.input.remove();
          this.button.remove();
          this.element.show();
          $.Widget.prototype.destroy.call( this );
        }
      });
    })( jQuery );
 //}

// $j(function() {
//		$j( "#add_field_combobox" ).combobox();
//		$j( "#toggle" ).click(function() {
//			$j( "#add_field_combobox" ).toggle();
//		});
//	});

