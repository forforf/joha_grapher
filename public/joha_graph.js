

// Something about initialization or getting ready, something something
$(document).ready(function() {
  //Constants
  JOHA_DATA_DEF = syncJax('/data_definition');

  initializeGraph();
  
  //Set up editing in place (JQuery plugin Jeditable)
  //-- wrap it in .live so that future elements can use it
  jQuery('.edit').live('click', function(event) {
    
    event.preventDefault();
    var nodeField = map_dom_to_node_data(this.id); // 'this' is the element being edited.

    //jQuery('.edit').editable('node_data_update', {   /call URL
    jQuery('.edit').editable( function(value, settings){return update_form_data(this, value, settings)}, {
      //submitdata: function(oldValue, settings) {
      //  //var nodeField = map_dom_to_node_data(this.id); // 'this' is the element being edited.
      //  var nodeId = jQuery('#current_node_id').text();
      //  //alert(dynValue);
      //  return {node_id: nodeId, node_field: nodeField, orig_val: oldValue}; 
      //},
      style: 'display: inline'
    });
   
    //jId = '#' + this.id ;
    //jQuery(jId).removeClass('edit_orig').addClass('edit_updated');
  });
   
  
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
  dynamic_edit_form(node.data);
  test_size = jQuery('.edit_updated').length;
  alert(test_size);  
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
//-- get current node
//TODO: Refactor to use this method?
//function get_current_node() {
//  alert("called get current node");
//  return jQuery('#current_node_id').text();
//}

//-- handle updating data
function update_form_data(el, value, settings){
  //is Jeditable overkill with this approach?
  //jId = '#' + el.id ;
  //alert(jId);
  jQuery(el).removeClass('edit_orig').addClass('edit_updated');
  var test_size = 0
  test_size = jQuery('.edit_updated').length;
  alert(test_size);
  return value;
}

//-- common look and feel 
var file_elements_format = function(filenames, divIdLabel, el){
  if (filenames.length > 0 ){
    //create the DOM elements
    for (i in filenames){
      jQuery("<div />", {
        "id":divIdLabel + i,
        text: filenames[i],
        click: function(){get_current_node_attachment(filenames[i])}
      }).appendTo(el);
    }
  } else {
    alert('zero length filenames passed');
  }
}

var link_elements_format = function(links, divIdLabel, el){
  var linkHtml = ""
  for (url in links){
    var indivLabels = links[url]
    if (indivLabels instanceof Array){
      /* ok */
      } else {
      indivLabels = [indivLabels] //make array
    }
    for (i in indivLabels){ 
     linkHtml += "<a href=\"" + url + "\">" + indivLabels[i] + "</a></br>"
     //make bigger html
    }
  }
  
  //Build Dom Element
  jQuery("<div />", {
    "id": divIdLabel,
    html: linkHtml
  }).appendTo(el);
}

//needs testing
var static_elements_format = function(staticKey, staticVal, divIdLabel, el){
  jQuery("<div />", {
    "id":divIdLabel,
    html: "<h1> " + staticKey + " " + staticVal + "  </h1>",
   }).appendTo(el);
}

var replace_elements_format = function(replaceKey, replaceVal, divIdLabel, el){
  var span_id = divIdLabel + "_span";
  jQuery("<div />", {
    "id": divIdLabel,
    html: "<span class=\"replace_key\">" + replaceKey + "</span>: <span id=" + span_id + " class=\"edit\">" + replaceVal + "</span>",
   }).appendTo(el);
}

var list_elements_format = function(listKey, listData, divIdLabel, el){
  var listHtml = "<ul>List of " + listKey
  for( i in listData){
    listHtml += "\n <li><span class=\"edit\">" + listData[i] + "</span></li>\n"
  }
  listHtml += "<li><span class=\"list_add_new\">Add New</li></ul>"
  jQuery("<div />", {
    "id": divIdLabel,
    html: listHtml,
   }).appendTo(el);
}

var key_list_elements_format = function(keyList, divIdLabel, el){
  console.log('key list format needs to be done');
  /*for( mainKey in keyList ){
      var divIdKeyLabel = divIdLabel + "_" + mainKey
      var listData = keyList[mainKey]
      var listHtml = "<ul>Key List of " + mainKey
      for(  listKey in listData){
        listHtml = "<li><ul>List of " + listKey
        for (i in listData[listKey] ){
          listHtml += "\n <li>" + listData[listKey][i] + "</li>\n"
        }
        listHtml += "</ul></li>"
      }
      listHtml += "</ul"
      jQuery("<div />", {
        "id": divIdKeyLabel,
        html: listHtml,
      }).appendTo(el);
  }*/
}

//-- creation
//-- TODO: Create an object to hold the data and functions
function map_dom_to_node_data(dom_id) {
  var map = { 'node_id_edit_label': 'label' };
  return map[dom_id]
}

function dynamic_edit_form(nodeData){
  //reset style to unedited
  jQuery('.edit').removeClass('edit_updated').addClass('edit_orig');

  //Define the functions that will display based on node data keys
  
  //-- Some data keys are special and get their own specific display function
  var edit_id_elements = function(id){
    var current_node_id = jQuery('#current_node_id').text();
      if (current_node_id == id) { /* ok */} else {
        alert("Current Node Id: " + current_node_id + " BUT Node Data has id: " + id + ".");
      }
    }

  var edit_label_elements = function(label){
    //Note that the DOM eleemnt for label already exists, we're just inserting data into it.
    jQuery('#node_id_edit_label').text(node.name);
  }
  
  //TODO: Create file object with filename and file data (if needed)
  var edit_file_elements = function(filenames){
    //simpler code, but best behavior to make sure selecting node multiple times creates multiple data?
    jQuery('#edit_file_elements').remove();
    file_elements_format(filenames, "edit_file_elements_", jQuery('#dn_file_data') );
  }

    var edit_link_elements = function(links){
    //simpler code, but best behavior to make sure selecting node multiple times creates multiple data?
    jQuery('#edit_link_elements').remove();
    link_elements_format(links, "edit_link_elements", jQuery('#dn_link_data') );
  }
  
  //-- Other data keys can fall into some generic categories for display functions
  //-- Static Needs TESTING
  var edit_static_elements = function(staticVar){
    alert("Static Var: " + staticVar.key + " handled statically");
  }

  var edit_replace_elements = function(replaceVar){
    replaceKey = get_keys(replaceVar)[0];
    replaceData = replaceVar[replaceKey];
    var divIdLabel = "edit_" + replaceKey
    replace_elements_format(replaceKey, replaceData, divIdLabel, jQuery('#dn_node_data'));
  }

  var edit_list_elements = function(listVar){
    //alert(get_keys(listVar));
    listKey = get_keys(listVar)[0]
    listItems = listVar[listKey]
    var divIdLabel = "list_" + listKey
    list_elements_format(listKey, listItems, divIdLabel, jQuery('#dn_node_data'));
  }

  var edit_keylist_elements = function(keyListVar){
    var divIdLabel = "edit_keylist_"
    key_list_elements_format(keyListVar, divIdLabel, jQuery('#dn_node_data'));
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
                           "links": edit_link_elements,
                           "attached_files": edit_file_elements}
  
  //-- operations are defined as part of data defn, this binds data structure (data defn)
  //-- to specific js operations for displaying that structure
  var EDIT_OPS_MAP = {"static_ops": edit_static_elements,
                   "replace_ops": edit_replace_elements,
                   "list_ops": edit_list_elements,
                   "key_list_ops": edit_keylist_elements}
                   
  //main algorithm
  //-- remove any existing data in the dynamic divs
  jQuery('#dn_node_data').empty();
  jQuery('#dn_link_data').empty();
  jQuery('#dn_file_data').empty();
  //-- create a clone of the node data because we are going to be changing it
  //-- but only for display reasons
  var nodeCopy = jQuery.extend({}, nodeData);
  
  var nodeKeys = get_keys(nodeCopy);
  
  //if (array_contains_all(nodeKeys, REQUIRED_DATA)) { /* ok */ } else {
  //alert("Not all Required Data Elements are present in Node ID: " + nodeCopy.id + "Keys:" + nodeKeys) };
  
  for (key in SPECIAL_TREATMENT) {
    // - remove - alert(key);
    if (nodeCopy[key]){
      SPECIAL_TREATMENT[key](nodeCopy[key]);
      delete nodeCopy[key];  // we've handled it so let's not worry about it anymore
    }
  }
  
  for (key in nodeCopy) { 
    //if our data defintion exists for that key, use the appropriate function for displaying it
    if (JOHA_DATA_DEF[key]) {
      var edit_ops_var = {}
      edit_ops_var[key] = nodeCopy[key]
      EDIT_OPS_MAP[(JOHA_DATA_DEF[key])](edit_ops_var);
      delete nodeCopy[key];
    }
  }
  
  //alert(get_keys(nodeCopy));
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
  
  //Need this here for parents that are not nodes
  jQuery('#current_node_id').text(node.id);
  
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
  //alert(node_id);
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