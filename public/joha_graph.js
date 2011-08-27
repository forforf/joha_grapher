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
}

function newNodeCreated(data){
  var nodeData = data.node;
  var graphData = data.graph;
  console.log(nodeData);
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
  var blankJohaGraph = new JohaGraph();

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
 
  
  //TODO: pass the Dom locations as a parameter in the special functions rather than
  //having it hard coded in the function.
  $j('#dn_node_data').empty();
  $j('#dn_link_data').empty();
  //TODO: Make #dn_file_data dynamic?

  
  var SHOW_EVEN_IF_NULL = [];// show this field in the form even if it doesn't exist in the data
  console.log('node copy', nodeCopy);
  
  var baseObj = new JohaNodeEditor(nodeCopy);
  var someObj = baseObj.view();
  $j('#dn_node_data').append(someObj);
  console.log('Dynamically creatted node data obj', someObj);
  
}

function get_current_node_attachment(filename){
  var currentNodeId = $j('#current_node_id').text();
  //alert("Current Node: " + currentNodeId + " Filename: " + filename + ".");
}

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
  routeClickedNodeDataToElements(visnode);
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

} 

//-- finds all descendant data for a given node
function add_descendant_data(el, node_data_type){

  var node_id = $j('#current_node_id').text();

  //using jQuery
  el.load('/desc_data', {'node_id': node_id, 'node_data_type':node_data_type });
  //TODO: Do the binding to functions here, not at the server
//  new Ajax.Updater(el, '/desc_data', {'node_id': node_id, 'node_data_type':node_data_type });
//    parameters: {'node_id': node_id, 'node_data_type':node_data_type }
// });
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


