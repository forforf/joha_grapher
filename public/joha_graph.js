

// Something about initialization or getting ready, something something
$(document).ready(function() {
  //Constants
  JOHA_DATA_DEF = syncJax('/data_definition');

  initializePage();
  
});

//Initialization Functions  TODO: Change to function form (lowercase underscore)
function syncJax(srcUrl) {
  retVal = "";
  
  jQuery.ajax({
    url:srcUrl,
    success: function(retData){retVal = retData;}, async:false
  });
  
  return retVal
}

//Generic Helper functions
function get_keys(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}  

function array_contains(a, obj) {
  var i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}

function array_contains_all(a, subset){
  var retVal = true;
  for (var i in subset){
    var obj = subset[i]
    if ( array_contains(a, obj) ){} else { retVal = false;};
  }
  return retVal
}

function initializePage(){
  blankGraph = rgraphInit(); //insert canvas into here if you can figure it out
   
  var nodeSource = '/index_nodes';
  //the below assigns the graph to myGraph (via Ajax)
  insertNodesIntoGraph(blankGraph, nodeSource);
  // - remove? - jQuery('node_id_input_edit').value = " ";
  //setAuthToken('authtok_attach_form');  
}
    
//Element Manipulation functions
function show_create_node_form(){
  jQuery('#edit-node-form').hide();
  jQuery('#create-node-form').show();
}

function show_edit_node_form(node){
  jQuery('#create-node-form').hide();
  dynamic_edit_form(node.data);
  jQuery('#edit-node-form').show();
}

function toggle(divId) {
  jqId = '#' + divId
	var ele = jQuery(jqId)[0];
	if(ele.style.display != "none") {
    		ele.style.display = "none";
  	}
  else { ele.style.display = "block";
  }
}

//Dynamic element creation based on data structure
function dynamic_edit_form(nodeData){

  //Define the functions that will display based on node data keys
  
  //-- Some data keys are special and get their own specific display function
  var edit_id_elements = function(id){
    //Note that the DOM eleemnt for id already exists, we're just inserting data into it.
    jQuery('#current_node_id').text(id);
  }

  var edit_label_elements = function(label){
    //Note that the DOM eleemnt for id already exists, we're just inserting data into it.
    jQuery('#node_id_edit_label').text(node.name);
  }
  
  //TODO: Create file object with filename and file data (if needed)
  var edit_file_elements = function(filenames){
    //simpler code, but best behavior to make sure selecting node multiple times creates multiple data?
    jQuery('#edit_file_elements').remove();
    if (filenames.length > 0 ){
      //create the DOM elements
      for (i in filenames){
        jQuery("<div />", {
          "id":"edit_file_elements_" + i,
          text: filenames[i],
          click: function(){alert(filenames[i])}
        }).appendTo( jQuery('#edit-node-data') );
      }
      
    //alert("Attached filename: " + filename + " in special html");
    } else {
      alert('zero length filenames passed');
    }
  }

  //-- Other data keys can fall into some generic categories for display functions
  var edit_static_elements = function(staticVar){
    alert("Static Var: " + staticVar + " handled statically");
  }

  var edit_replace_elements = function(replaceVar){
    alert("Replace Var: " + replaceVar + " will be replacable");
  }

  var edit_list_elements = function(listVar){
    alert("List Var: " + listVar + " will be listable");
  }

  var edit_keylist_elements = function(keyListVar){
    alert("Key List Var: " + keyListVar + " will be keyable and listable");
  }
  
  //-- We may have node data that has no defined treatment
  //-- in this approach we still allow editing of that data, but because
  //-- we don't know the structure, we defer to the user to make sure it's
  //-- the data form is correct (i.e. braces for maps, brackets for arrays, quotes for embedded strings, etc)
  var edit_no_data_def = edit_replace_elements;
  
  //these keys are required to be present in the node data
  var REQUIRED_DATA = ["id", "label"]  //may be able to refactor label out in the future
  
  //these keys will get special treatment for displaying their structue
  var SPECIAL_TREATMENT = {"id": edit_id_elements,
                           "label": edit_label_elements,
                           "attached_files": edit_file_elements}
  
  //-- operations are defined as part of data defn, this binds data structure (data defn)
  //-- to specific js operations for displaying that structure
  var EDIT_OPS_MAP = {"static_ops": edit_static_elements,
                   "replace_ops": edit_replace_elements,
                   "list_ops": edit_list_elements,
                   "key_list_ops": edit_keylist_elements}
                   
  //main algorithm
  //-- create a clone of the node data because we are going to be changing it
  //-- but only for display reasons
  var nodeCopy = jQuery.extend({}, nodeData);
  
  var nodeKeys = get_keys(nodeCopy);
  
  if (array_contains_all(nodeKeys, REQUIRED_DATA)) { /* ok */ } else {
  alert("Not all Required Data Elements are present in Node Data") };
  
  for (key in SPECIAL_TREATMENT) {
    // - remove - alert(key);
    SPECIAL_TREATMENT[key](nodeCopy[key]);
    delete nodeCopy[key];  // we've handled it so let's not worry about it anymore
  }
  
  alert(get_keys(nodeCopy));
}
    
//Graphing helpers and interactions
function insertNodesIntoGraph(aGraph, nodeLoc){

  jQuery.get(nodeLoc,
    function(graph_data) {
      aGraph.loadJSON(graph_data);
      aGraph.refresh();
      myGraph = aGraph; //remember this is Asynchonous.  This won't be set right away.
    },
  "json");
}

//-- called when a node is clicked
function routeClickedNodeDataToElements(nodeStale) {
  //not sure why, but the node passed into the function
  //is stale, and new tree data isn't part of it
  //the below is to update the passed in node with updated
  //information
  node = $jit.json.getSubtree(myGraph.json, nodeStale.id);  //elements to receive node data
  //var parentCatEditBox = $('related_tags_edit');
  // - remove - var nodeIdBox = jQuery('#node_id_edit');
  // - remove  - var nodeIdBoxLabel = $('node_id_edit_label');
  //var attachmentListBox = $('attachment_list');
  //var linksListBox = $('links_list');
  //distribute node data
  //parentCatEditBox.value = node.data.parents;
  // - remove - nodeIdBox.innerHTML = node.id;
  //assign current working node id
  // - remove?- jQuery('#current_node_id').text(node.id);
  // - remove - alert($('#node_id_edit').value);
  // - remove - alert(jQuery('#current_node_id').html());
  // - remove - nodeIdBoxLabel.innerHTML = node.name;
  // - remove - jQuery('#node_id_edit_label').text(node.name);
  //functions to distribute data to 
  show_edit_node_form(node);
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
  //using jQuery
  el.load('/desc_data', {'node_id': node_id, 'node_data_type':node_data_type });
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