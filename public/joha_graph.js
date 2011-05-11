

// Something about initialization or getting ready, something something
$(document).ready(function() {
  JOHA_DATA_DEF = syncJax('/data_definition');
  initializePage();
  
});

//Initialization Functions
function syncJax(srcUrl) {
  retVal = "";
  
  jQuery.ajax({
    url:srcUrl,
    success: function(retData){retVal = retData;}, async:false
  });
  
  return retVal
}  

function initializePage(){
  blankGraph = rgraphInit(); //insert canvas into here if you can figure it out
   
  var nodeSource = '/index_nodes';
  //the below assigns the graph to myGraph (via Ajax)
  insertNodesIntoGraph(blankGraph, nodeSource);
  jQuery('node_id_input_edit').value = " ";
  //setAuthToken('authtok_attach_form');  
}
    
//Element Manipulation functions
function show_create_node_form(){
  jQuery('#edit-node-form').hide();
  jQuery('#create-node-form').show();
}

function show_edit_node_form(nodeId){
  jQuery('#node_id_input_edit').text(nodeId);
  jQuery('#create-node-form').hide();
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
  jQuery('#current_node_id').text(node.id);
  // - remove - alert($('#node_id_edit').value);
  // - remove - alert(jQuery('#current_node_id').html());
  // - remove - nodeIdBoxLabel.innerHTML = node.name;
  jQuery('#node_id_edit_label').text(node.name);
  //functions to distribute data to 
  show_edit_node_form(node.id);
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