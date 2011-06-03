/*  Compatible with JEditable. Editable elements have a class of edit */
// Requires JQuery and joha_helpers.js

/*Class to hold Element Constructors, used as a mixin
  Definitions:
    node: Holds all data of interest. Has a unique id field.
    node key: The names of the data held by the node.  Example, "id" holds the node id value, "label" holds the node name, "links" holds the node's links

  Name for this?:
  
    eventActions: eventType       (onClick, onChange, etc)
                  eventActions    (function(s) that will trigger on the event type)
                                
  JohaPatterns - Repeatable patterns that are reused often
    controlObj: controlEl
                targetEl
                eventActions
                
                
                
  JohaBuilder - Build specific Dom Elements
    deleteControl: 
    
   
  Element Types:  JohaElems.<element type>(<args>) to call
    Main Container
      nodeContainer:         Main conatainer and is a container for the entire node, holds all node fields (aka keys) and(related data)
    
    Generic Constructors (correct term?)
      dataContainerBase:     Common container for holding and abstracting all subordinate data
      listContainerBase:     Common container for holding a list of individual items
      itemContainerBase:     Common container for holding aggregate information about listed items
      editContainerBase:     Common container constructor for holding user editable string content and controls.
      labelBase:             Common container constructor for holding editable labels
      controlsBase:          Common container constructor for holding editing controls
      deleteControlsBase:    Controls deletion of associated elementens (applicable only for fields, lists and key-lists)
      addControlBase:        Controls the addition of new data (applicable for fields, lists and key-lists)
       
      
    Concrete Containers Common to All Fields (aka node keys)
      nItemContainer        < itemContainerBase   Container for each field and all its associated doms and data
      niControls            < controlsBase        Container for holding collection controls (just adding right now)
      niAddControl          < addControlBase      Adds a new node key (field) (to be completed)
      niKeyContainer        < editContainerBase   Holds the node key labels and controls
      nikLabel              < labelBase           Holds the node key label (i.e key name or most often field name)
      nikKeyControls        < controlsBase        Holds the controls for editing the node key label
      nikDeleteControl      < deleteControlsBase  Deletes the node Key (and all associated Data)
      niDataContainer       < dataContainerBase   Provides a common interface to the custom doms 
      
      
     Specific Containers that go under the niDataContainer
      static_ops - Static data that can't be changed by the user (Not currently used, but may be used for data like Node ID in the future)
      
      replace_ops - String data that is editable by the user, deletion requires deleting the associated node key.
        replnidLabelContainer   < editContainerBase   Holds the string value and controls associated with the node key.
        repnlidlValue           < labelBase           Holds the string value for that node key
        replnidlValueControls   < controlsBase        Holds the controls for the replnidlValue element (may be empty)
 
      list_ops - List data (array) of items associated with a given node key
        listnidListContainer    < listContainerBase   Holds a list of items associated with a given node key
        listnidListControls     < controlsBase        Holds controls for operating on the collection (just adding right now)
        listnidAddControl       < addControlBase      Provides the ability to add new entries to the list.
        listnidLabelContainer   < editContainerBase   Holds each item
        listnidValue            < labelBase           Holds the string value for that list item
        listnidlLabelControls   < controlsBase        Holds the controls for the listnidlValue element
        listnidDeleteControl    < deleteControlsBase  Provides the ability to delete items from the list
        
        
       key_list_ops - Associative array of lists
         kylsnidListContainer      < listContainerBase   Holds the list of keys (with their lists)
         kylsnidItemContainer      < itemContainerBase   Holds the key-value pairs
         kylsnidAddKeyControl      < addControlBase      Provides the ability to add new keys to the list.
         kylsnidKeyLabel           < labelBase           Holds the individual key label
         kylsnidKeyContainer       < editContainerBase   Holds the individual Keys and associated controls
         kylsnidKeyLabelControls   < controlsBase        Holds the controls for editing keys
         kylsnidKeyDeleteControl   < deleteControlsBase  Provides the ability to delete items from the list
         kylsnidListContainer      < listContainerBase    Holds the list of values associated with a give key (common itemContainer)
         kylsnidAddValueControl    < addControlBase      Provides the ability to add new entries to the list.
         kylsnidLabelContainer     < editContainerBase   Holds each item
         kylsnidValue              < labelBase           Holds the string value for that list item
         kylsnidlValueControls     < controlsBase    Holds the controls for the listnidlValue element
         kylsnidLabelDeleteControl < deleteControlsBase  Provides the ability to delete items from the list
         
  Builders are required when there are inter-element dependencies, but those dependencies are contained

  Abstract Builders
    BuildEditableContainerDom:    Framework for the Dom of an editable container
    BuildListContainerDom:        Framework for building a list container (requires BuildEdiatableContainerDom)
    BuildKeyListContainerDom:     Framework for building a key-list container (require BuildListContainerDom)
    
  Common Builders
    BuildNodeKeyContainerDom:     Builds the common structure of the Dom (requires specific data type DOM to complete)
    
  SpecificBuilders
    BuildJohaStaticDataDom:           (static_ops) Not implemented?
    BuildJohaValueDom:                (replace_ops) Just Arguments to BuildEditableContainerDom?
    BuildJohaListDom:                 (list_ops) Just Arguments to BuildListContainerDom ?
    BuildJohaKeyListDom               (key_list_ops) Just Arguments to BuildKeyListContainerDom?
    BuildJohaLinksDom                  (key_list_ops) Leverage BuildKeyList or List or others?
    BuildJohaFilesDom                  (key_list_ops or list_ops) Leverage above?
    
  
   Factories (these automatically use the builders to manufacture the appropriate doms)
   Dom Constructors:
     domFieldFactory:   Inspects specified field data to determine its data structure and invokes the appropriate builder
     domNodeFactory:    Main entry point. Invokes domFieldFactory for each field in turn and then assembles them into the main container (BuildNodeEditDom)      
     
     
   
   Data collection on Save
   All necessary data is pushed down to the editable nodes. Field Names, Key Names. Updates have both original and new values.
   Additionally the DomId and collection function for the element that will collect the data (the niDataContainer element) is provided to the elements as well
   Finally when changes occur the changed elements will update their classes appropriately:
    Elements with changed data will have a class assigned of .joha_update
    Elements with new data will have a class assigned of .joha_add
    Elements with deleted data will have a class assigned of .joha_delete
   On Save 
    Each changed element uses the function of the DomId provided to it, so that those elements will process and aggregate the data accordingly.
    Then each niDataContainer processing element will provide it's node key's data, and the entire node's updates, additions and deletions can
    then be ajaxed to the web server for processing.
   Reasons for this approach
    Elegant Undo prior to Save
    Future ability to rewind changes on a per node, per update basis.
      That is a give node could be rewound independent of other nodes (or a set of nodes, or the entire node base)
      More research is needed to evaluate this feature, but it "feels" like the right approach.   
*/

//Add note about joha_edit class (ids all editable containers)
/* Refactoring to have only a single Joha object in the global namespace */
/* newbie at this so we'll see how it works */

function Patterns() {

  var self = this;
  
  //eventActions function action parameter is an object with johaCtl and johaTgt parameters
  //accessible in functions as event.data.johaCtl and event.data.johaTgt
  //Leverage jQuery's live method
  this.controlObj = function(controlElement, targetElement, eventActions, opts){
      
    var jctl = makejQueryObj(controlElement);
    var jtgt = makejQueryObj(targetElement);
   
    //this is different than $().live since here the events can be mapped to separate functions
    //$().live maps multiple events to the same function    
    for (ev in eventActions){

      actionObj = {
                    johaTgt: jtgt,
                    johaCtl: jctl,
                  };
              
      
      //NOTE: The control must have an id due to some limitations with .live
      jctlId = jQuery(controlElement).attr('id');
      jQuery("#"+jctlId).live(ev, actionObj, eventActions[ev]);
      
    }
    //removing jctl will remove attached event as well (yay! for jQuery!)
    return jctl //return jQuery-ized element for direct jQuery actions (allows things to be more concise)
  };
  
  //this will cause the target to add edit toits class (is this used?)
  this.editInPlaceControl = function(target, editClass){
    //Uses jEditable
    editClass = editClass || 'edit';
    target = makejQueryObj(target);
    target.addClass(editClass);
  };
  
  //This will take an element that can hold text, add text, store any data associated with that text (i.e. metadata)
  //and apply any functions needed (textEl and objData) are required.
  this.textContentObj = function( textEl, textVal, objData, applyFunctions){
    //TODO Try and have the data stored by jQuery as one of the applyFunctions
    textEl = makejQueryObj(textEl);
    textEl.text(textVal);
    for (i in applyFunctions) {
      applyFunctions[i](textEl, objData);
    }
  return textEl;
  };
}

function Joha(){

  var johaSelf = this;
  
  var PatternsObj = function Patterns() {
    
    this.testing = "1,2,3,4";
    
    this.fn_testing = function() { return this.testing };
  
    //eventActions function action parameter is an object with johaCtl and johaTgt parameters
    //accessible in functions as event.data.johaCtl and event.data.johaTgt
    //Leverage jQuery's live method
    this.controlObj = function(controlElement, targetElement, eventActions, opts){
   
      var jctl = makejQueryObj(controlElement);
      var jtgt = makejQueryObj(targetElement);
     
      //this is different than $().live since here the events can be mapped to separate functions
      //$().live maps multiple events to the same function    
      for (ev in eventActions){

        actionObj = {
                      johaTgt: jtgt,
                      johaCtl: jctl,
                    };
                
        
        //NOTE: The control must have an id due to some limitations with .live
        jctlId = jQuery(controlElement).attr('id');
        jQuery("#"+jctlId).live(ev, actionObj, eventActions[ev]);
        
      }
      //removing jctl will remove attached event as well (yay! for jQuery!)
      return jctl //return jQuery-ized element for direct jQuery actions (allows things to be more concise)
    };
    
    //this will cause the target to add edit toits class (is this used?)
    this.editInPlaceControl = function(target, editClass){
      //Uses jEditable
      editClass = editClass || 'edit';
      target = makejQueryObj(target);
      target.addClass(editClass);
    };
    
    //This will take an element that can hold text, add text, store any data associated with that text (i.e. metadata)
    //and apply any functions needed (textEl and objData) are required.
    this.textContentObj = function( textEl, textVal, objData, applyFunctions){
      //TODO Try and have the data stored by jQuery as one of the applyFunctions
      textEl = makejQueryObj(textEl);
      textEl.text(textVal);
      for (i in applyFunctions) {
        applyFunctions[i](textEl, objData);
      }
    return textEl;
    };
  };

  this.patterns = new PatternsObj;

  var BuildSimpleElem = function Builder() {
  
      this.addItemControl = function(target, parentId, clickAction){
      
        var newObj = makejQueryObj(newObj);
        var elId = parentId + "_additemctrl";
        var elClass = "add_item_control";
        var elHtml = "<img id=\"" + elId + "\" class=\"" + elClass + "\" src=\"./images/add_normal.png\" alt=\"-\" />"
        
        //johaTgt and johaCtl are available with the event.data parameter by way of controlObj
        var eventActions = {'click': function(event){
            jlog("addItemControl clicked, Target:", event.data.johaTgt);
            var tgt = event.data.johaTgt;
            clickAction(tgt);
            //tgt.append(newObj);
          },
        };
      
        var addItemCtl = johaPats.controlObj(elHtml, target, eventActions);
        return addItemCtl[0];
      };
      
      
      //TODO: DRY this up with the above
      this.addKvlistItemControl = function(target, parentId, clickAction){
      
        var newObj = makejQueryObj(newObj);
        var elId = parentId + "_addkvlistitemctrl";
        var elClass = "add_kvlistitem_control";
        var elHtml = "<img id=\"" + elId + "\" class=\"" + elClass + "\" src=\"./images/add_record.jpg\" alt=\"-\" />"
        
        //johaTgt and johaCtl are available with the event.data parameter by way of controlObj
        var eventActions = {'click': function(event){
            jlog("addKvlistItemControl clicked, Target:", event.data.johaTgt);
            var tgt = event.data.johaTgt;
            //tgt.addClass('joha_add');
            clickAction(tgt);
            //tgt.append(newObj);
          },
        };
      
        var addItemCtl = johaPats.controlObj(elHtml, target, eventActions);
        return addItemCtl[0];
      };
      
      //TODO: DRY this up with the above 
      this.addLinksListItemControl = function(target, parentId, clickAction){
      
        var newObj = makejQueryObj(newObj);
        var elId = parentId + "_addlinkslistitemctrl";
        var elClass = "add_linkslistitem_control";
        var elHtml = "<img id=\"" + elId + "\" class=\"" + elClass + "\" src=\"./images/add_record.jpg\" alt=\"-\" />"
        
        //johaTgt and johaCtl are available with the event.data parameter by way of controlObj
        var eventActions = {'click': function(event){
            jlog("addLinksListItemControl clicked, Target:", event.data.johaTgt);
            var tgt = event.data.johaTgt;
            //tgt.addClass('joha_add');
            clickAction(tgt);
            //tgt.append(newObj);
          },
        };
      
        var addItemCtl = johaPats.controlObj(elHtml, target, eventActions);
        return addItemCtl[0];
      };      
    
    this.staticValueElement = function(textValue, parentId){
      var elId = parentId + "_static";
      var elClass = "static_text";
      var elHtml = "<span id=\"" + elId + "\" class=\"" + elClass + "\"/span>";
      var statValEl = johaPats.textContentObj(elHtml, textValue);
      return statValEl;
    };

    this.deleteControl = function(target, parentId){
      
      var elId = parentId + "_delctrl";
      var elClass = "delete_controls";
      var elHtml = "<img id=\"" + elId + "\" class=\"" + elClass + "\" src=\"./images/delete_normal.png\" alt=\"-\" />"
      
      //johaTgt and johaCtl are available with the event.data parameter by way of controlObj
      var eventActions = {'click': function(event){
          jlog("deleteControl clicked, Target:", event.data.johaTgt);
          event.data.johaTgt.toggleClass('joha_delete');
        },
      };
      
      var delCtl = johaPats.controlObj(elHtml, target, eventActions);
      return delCtl[0];
    };

    this.deleteKeyControl = function(target, parentId){
      
      var elId = parentId + "_delkeyctrl";
      var elClass = "delete_key_controls";
      var elHtml = "<img id=\"" + elId + "\" class=\"" + elClass + "\" src=\"./images/delete_key.png\" alt=\"-\" />"
      
      //johaTgt and johaCtl are available with the event.data parameter by way of controlObj
      var eventActions = {'click': function(event){
          jlog("deleteKeyControl clicked, Target:", event.data.johaTgt);
          event.data.johaTgt.toggleClass('joha_delete');
        },
      };
      
      var delCtl = johaPats.controlObj(elHtml, target, eventActions);
      return delCtl[0];
    };
    
    this.staticValueElement = function(textValue, parentId){
      var elId = parentId + "_static";
      var elClass = "static_text";
      var elHtml = "<span id=\"" + elId + "\" class=\"" + elClass + "\"/span>";
      var statValEl = johaPats.textContentObj(elHtml, textValue);
      return statValEl;
    };
  
    this.editValueElement = function(textValue, parentId, valData){
      var elId = parentId + '_edit_value';
      var elClass = "edit edit_text joha_edit";
      var elHtml = "<span id=\"" + elId + "\" class=\"" + elClass + "\"/span>";
      //Could make editable via passing a custom function, but instead adding in the class to the html
      //var makeEditable = function(el, valData){ jQuery(el).addClass('edit') };
      //makeEditable function would be added to the functions passed to the element pattern
      
      var empty = {}
      var origValData = {}    
      origValData['johaData__OriginalValue'] = textValue;
      var newValData = jQuery.extend(empty, valData, origValData)
      var addValDataFn = function(el, valData){ jQuery(el).data(valData) };
      var editValEl = johaPats.textContentObj(elHtml, textValue, newValData, [addValDataFn]);
      return editValEl;
    };
    
  }
  
  this.buildSimpleElem = new BuildSimpleElem;
  
  this.buildListItem = function(listItemValue, index, parentId, valData){
  
    var bldr = johaSelf.buildSimpleElem;
        
    listItemId = parentId + "_" + index + "_li";
    var listItemElem = bldr.editValueElement(listItemValue, listItemId, valData);
    
    var delId = parentId + "_" + index + "_delCtrl";
    var delCtrl = bldr.deleteControl(listItemElem, delId)
    
    var wrId = parentId + "_" + index + "_listItemWrapper";
    var wrClass = "list_item_wrapper";    
    var wrHtml = "<li id=\"" + wrId + "\" class=\"" + wrClass + "\"</li>";
    var wrEl = jQuery(wrHtml);
    wrEl.append(listItemElem);
    wrEl.append(delCtrl);
    
    return wrEl;
  };
  
  this.buildList = function(listItemValues, parentId, listData) {
    var listId = parentId + "_list";
    var listClass = "list";
    var listHtml = "<ul id=\"" + listId + "\" class=\"" + listClass + "\"></ul>"
    var listEl = jQuery(listHtml);
    
    var empty = {}
    var thisListData = {}    
    //thisListData['johaData__?'] = "?";
    var newListData = jQuery.extend(empty, listData, thisListData)
    
    for (i in listItemValues) {
      newListData['johaData__ItemIndex'] = i;
      li = this.buildListItem(listItemValues[i], i, listId, newListData );
      listEl.append(li);
    }
    
    
 
    //Set up control for adding new items to the list
    var bldr = johaSelf.buildSimpleElem;
    //create the function to execute when add control is clicked
    //Note that the target (first paramenter of addItemControl) is passed
    //as a parameter to this function
    var addOnClick = function(tgt) {
      tgtChildren = listEl.children('li');
      jlog('Children of list', tgtChildren);
      newListItem = johaSelf.buildListItem("?", tgtChildren.length, listId, newListData);
      newListItem.children('.edit_text').addClass('joha_add');
      jlog('add click new list item', newListItem);
      if ( tgtChildren.length > 0 ) {
        tgtChildren.last().after(newListItem);
      } else {
        listEl.append(newListItem);
      }
    }
    var addCtl = bldr.addItemControl(listEl, listId, addOnClick);

    listEl.append(addCtl);  
    return listEl;
  };

  this.buildKey = function(keyValue, parentId, elData) {
    keyId = parentId + "_key";
    keyEl = this.buildSimpleElem.editValueElement(keyValue, keyId, elData);
    return keyEl;
  };
  
  this.buildKvlistItem = function(keyValue, dataValues, kIndex, parentId, kvItemData) {
    var kvliId = parentId + "_" + kIndex + "_kvitem"; 
    var kvliClass = "kvlist_item joha_edit";
    
    var keyEl = this.buildKey(keyValue, kvliId, kvItemData);
    var kList = this.buildList(dataValues, kvliId, {} );
  
    var kvliHtml = "<div id=\"" + kvliId + "\"class=\"" + kvliClass + "\"></div>"
    var wrKvli = jQuery(kvliHtml);
    
    var kvDelCtrl = this.buildSimpleElem.deleteKeyControl(wrKvli, kvliId);
    
    wrKvli = wrKvli.append(kvDelCtrl);
    wrKvli = wrKvli.append(keyEl);
    wrKvli = wrKvli.append(kList);
     
    //Temp
    wrKvli.append(jQuery("<div />").addClass('clearfix'));
    
    return wrKvli;
  };
  
  
  this.buildKvlist = function(klistObj, parentId, kvListData){
    var kvlistId = parentId + "_kvlist";
    var kvlistClass = "kvlist";
    
    var kvlistHtml = "<div id=\"" + kvlistId + "\"class=\"" + kvlistClass + "\"></div>"
    var kvlistEl = jQuery(kvlistHtml);
    
    var i = 0;
    for (key in klistObj){
      var kvliEl = this.buildKvlistItem(key, klistObj[key], i, kvlistId, kvListData );
      kvlistEl.append(kvliEl);
      i += 1;
    }
    

    //Set up control for adding new KeyLists
    var bldr = johaSelf.buildSimpleElem;
    //create the function to execute when add control is clicked
    //Note that the target (first paramenter of addItemControl) is passed
    //as a parameter to this function
    var addOnClick = function(tgt) {
      tgtChildren = tgt.children('.kvlist_item');
      var newKvlistItem = johaSelf.buildKvlistItem("key?", ["?"], tgtChildren.length, kvlistId, kvListData);

      newKvlistItem.addClass('joha_add');
      tgtChildren.last().after(newKvlistItem);
    }
    var addCtl = bldr.addKvlistItemControl(kvlistEl, kvlistId, addOnClick)
    kvlistEl.append(addCtl);
    
    
   return kvlistEl;
  };
  
  this.buildLinksListItem = function(linkURL, linkName, kIndex, parentId, linksListItemData) {
    var linksListItemId = parentId + "_" + kIndex + "_linkitem"; 
    var linksListItemClass = "links_list_item joha_edit";
    
    //**var dataValues = [linkName];
    
    //passing data down the chain
    var empty = {};
    var linkItemData = {}; 
    linkItemData['johaData__KeyName'] = linkURL;
    linkItemData['johaData__dataValues'] = linkName;//**dataValues; 
    var keyData = {};
    keyData['johaData__KeyItem'] = "key";
    var listKeyData = jQuery.extend(empty, linksListItemData, linkItemData, keyData);
    
    //TODO Add to kvlist
    
    
    var keyEl = this.buildKey(linkURL, linksListItemId, listKeyData);
  
    //**var linksList = this.buildList(dataValues, linksListItemId, listData );

    var empty = {};    
    var keyValData = {};
    keyValData['johaData__KeyItem'] = "value";
    var listValData = jQuery.extend(empty, linksListItemData, linkItemData, keyValData);

    linkItem = this.buildSimpleElem.editValueElement(linkName, linksListItemId, listValData);
  
    var linksListHtml = "<div id=\"" + linksListItemId + "\"class=\"" + linksListItemClass + "\"></div>"
    var wrLinksListItem = jQuery(linksListHtml);
    
    var linksListDelCtrl = this.buildSimpleElem.deleteKeyControl(wrLinksListItem, linksListItemId);
    
    wrLinksListItem.append(linksListDelCtrl);
    wrLinksListItem.append(keyEl);
    //**wrLinksListItem.append(linksList);
    wrLinksListItem.append(linkItem);
    
    wrLinksListItem.data(keyData);
    

     
    //Temp
    wrLinksListItem.append(jQuery("<div />").addClass('clearfix'));
    
    return wrLinksListItem;
  };  

  this.buildLinksList = function(linksListObj, parentId, linksListData){
    //var linksFieldValueContainer = this.buildFieldValueElem("", linksListData);
    var empty = {};
    var customData = {}
    customData['johaData__Type'] = 'link_ops';  //links is just made up right here
    customData['johaData__NodeId'] = jQuery("#current_node_id").text();
    customData['johaData__FieldIndex'] = 'links';
    
    var linkFieldName = "Links";
    customData['johaData__FieldName'] = linkFieldName;
    
    var linksListData = jQuery.extend(empty, customData, linksListData)
    
    var linksListId = parentId + "_links_list";
    var linksListClass = "links_list";
    
    var linksListHtml = "<div id=\"" + linksListId + "\"class=\"" + linksListClass + "\"></div>"
    var linksListEl = jQuery(linksListHtml);
    var linkFieldNameEl = this.buildFieldNameElem(linkFieldName);
    linksListEl.append(linkFieldNameEl);
    
    var linksFieldValueContainer = this.buildFieldValueElem("", linksListData);
    var i = 0;
    for (key in linksListObj){
      var linksListItemEl = this.buildLinksListItem(key, linksListObj[key], i, linksListId, linksListData );
      linksFieldValueContainer.append(linksListItemEl);
      i += 1;
    }
  
    //Set up control for adding new Link Lists
    var bldr = johaSelf.buildSimpleElem;
    //create the function to execute when add control is clicked
    //Note that the target (first paramenter of addItemControl) is passed
    //as a parameter to this function
    var addOnClick = function(tgt) {
      tgtChildren = tgt.children('.links_list_item');
      var newLinksListItem = johaSelf.buildLinksListItem("URL?", "link?", tgtChildren.length, linksListId, linksListData);
      newLinksListItem.addClass('joha_add');
      newLinksListItem.data(linksListData);  //A bit of a hack to get data into the container
      tgtChildren.last().after(newLinksListItem);
    }
    var addCtl = bldr.addLinksListItemControl(linksFieldValueContainer, linksListId, addOnClick)
    linksFieldValueContainer.append(addCtl);
  
    linksListEl.append(linksFieldValueContainer);  
    //linksFieldValueContainer.append(linksListEl);
   return linksListEl;
  };
  
  this.buildFieldValueElem = function(fieldValues, customData) {
  
    var dataType = customData['johaData__Type'];
    var nodeId = customData['johaData__NodeId'];
    var fieldIndex = customData['johaData__FieldIndex'];
    
    var johaId = nodeId + "_" + fieldIndex;
    
    var fieldValueContainer = jQuery('<div />', {
      'class': "joha_field_value_container",
      'id': johaId + '_valuecontainer',
    });
    //fieldValueContainer.append(jQuery('<div> dummy field values </div>'));
    //return fieldValueContainer

    var domObj = null;
    if (dataType == "static_ops") {
      // figure out how to display static data 
      alert('static_ops not implemented yet');
    } else if (dataType == "replace_ops") {
      domObj = this.buildSimpleElem.editValueElement(fieldValues, johaId, customData);
      //jlog('Node Label', jQuery('#joha-edit-label--').data() )
    } else if (dataType == "list_ops") {
      //domObj = new BuildListDom( fieldData, johaId);
      domObj = this.buildList(fieldValues, johaId, customData);
      //domObj = new BuildListDom(fieldData, johaId, johaBuilder, nodeId)
    } else if (dataType == "key_list_ops") {
      //Not Tested!!
      domObj = this.buildKvlist(fieldValues, johaId, customData);
      //domObj = new BuildKvlistDom( fieldData, johaId );
    } else {
      //returns empty container if we don't know how to build the container
      //the caller should then build the underlying container (i.e. Links List)
      domObj = jQuery("");

    }
    
    var retData = domObj.data();
    //add container level data
    var empty = {};
    var containerData = jQuery.extend(empty, customData, retData);
    fieldValueContainer.data(containerData);
    return fieldValueContainer.append(domObj);
  };
  
  this.buildFieldNameElem = function(fieldName){
    var fieldNameEl = jQuery('<div />', {
      text: fieldName,
      'class': "joha_field_name",
    });
    return fieldNameEl;
  };
  
  this.buildFieldDataDom = function(fieldData, customData){
    var fieldName = get_keys(fieldData)[0];
    customData['johaData__FieldName'] = fieldName;
    var dummyFieldDataDom = jQuery('<div />');
    var dummyFieldValueEl = this.buildFieldValueElem(fieldData[fieldName], customData);
    var dummyFieldNameEl = this.buildFieldNameElem(fieldName);
    dummyFieldDataDom.append(dummyFieldNameEl);
    dummyFieldDataDom.append(dummyFieldValueEl);
    return dummyFieldDataDom;
  }
  
}
/*
var JohaX = (function() {
  var JohaX = function() {
    this.accessor = "got it";
  };
  
  JohaX.prototype.meth = function() {
    console.log('executing prototype method with accesor, and ... ' + this.accessor);
    return this;
  };
  
  return function() {
    var o = new JohaX();
    var f = function() {console.log("I am awesome"); };
    for (var k in o) {
      f[k] = o[k];
    }
    
    return f
  };
  
})();
*/


var JohaComponents = function() {};
JohaComponents.prototype = {
  eventActions: function(event, actions) { 
    var obj =  {};
    obj[event] = actions; //functions of the form function(event)
    //note that custom function parameters are passed in obj form and are
    //availabe at event.data.{custom obj}
    return obj
  }
}

//Common Patterns
//TODO: Learn what 'new function()' does
var johaPats = new function() {
  //Locally scoped
  var self = this;

  //Exposed
  
  this.testing = "Seems to be working ...";
  
  //eventActions function action parameter is an object with johaCtl and johaTgt parameters
  //accessible in functions as event.data.johaCtl and event.data.johaTgt
  //Leverage jQuery's live method
  this.controlObj = function(controlElement, targetElement, eventActions, opts){
  
    var jctl = makejQueryObj(controlElement);
    var jtgt = makejQueryObj(targetElement);
   
    //this is different than $().live since here the events can be mapped to separate functions
    //$().live maps multiple events to the same function    
    for (ev in eventActions){

      actionObj = {
                    johaTgt: jtgt,
                    johaCtl: jctl,
                  };
              
      
      //NOTE: The control must have an id due to some limitations with .live
      jctlId = jQuery(controlElement).attr('id');
      jQuery("#"+jctlId).live(ev, actionObj, eventActions[ev]);
      
    }
    //removing jctl will remove attached event as well (yay! for jQuery!)
    return jctl //return jQuery-ized element for direct jQuery actions (allows things to be more concise)
  };
  
  //this will cause the target to add edit toits class (is this used?)
  this.editInPlaceControl = function(target, editClass){
    //Uses jEditable
    editClass = editClass || 'edit';
    target = makejQueryObj(target);
    target.addClass(editClass);
  };
  
  //This will take an element that can hold text, add text, store any data associated with that text (i.e. metadata)
  //and apply any functions needed (textEl and objData) are required.
  this.textContentObj = function( textEl, textVal, objData, applyFunctions){
    //TODO Try and have the data stored by jQuery as one of the applyFunctions
    textEl = makejQueryObj(textEl);
    textEl.text(textVal);
    for (i in applyFunctions) {
      applyFunctions[i](textEl, objData);
    }
  return textEl;
  };
   
};
/*
var JohaSimpleBldr = function() {

  //Locally scoped
  var internalFunction = function() {
  };

  //Exposed
  //this.<something>
};
JohaSimpleBldr.prototype = {
  deleteControl: function(target, parentId){
    
    var elId = parentId + "_delctrl";
    var elClass = "delete_controls";
    var elHtml = "<img id=\"" + elId + "\" class=\"" + elClass + "\" src=\"./images/delete_normal.png\" alt=\"-\" />"
    
    //johaTgt and johaCtl are available with the event.data parameter by way of controlObj
    var eventActions = {'click': function(event){
        jlog("deleteControl clicked, Target:", event.data.johaTgt);
        event.data.johaTgt.toggleClass('joha_delete');
      },
    };
    
    var delCtl = johaPats.controlObj(elHtml, target, eventActions);
    return delCtl[0];
  },
  
  staticValueElement: function(textValue, parentId){
    var elId = parentId + "_static";
    var elClass = "static_text";
    var elHtml = "<span id=\"" + elId + "\" class=\"" + elClass + "\"/span>";
    var statValEl = johaPats.textContentObj(elHtml, textValue);
    return statValEl;
  },
  
  editValueElement: function(textValue, parentId, valData){
    var elId = parentId + '_edit_value';
    var elClass = "edit joha_value joha_edit";
    var elHtml = "<span id=\"" + elId + "\" class=\"" + elClass + "\"/span>";
    //Could make editable via passing a custom function, but instead adding in the class to the html
    //var makeEditable = function(el, valData){ jQuery(el).addClass('edit') };
    //makeEditable function would be added to the functions passed to the element pattern
    var addValData = function(el, valData){ jQuery(el).data(valData) };
    var editValEl = johaPats.textContentObj(elHtml, textValue, valData, [addValData]);
    return editValEl;
  },
}

//Builders that create shiny complex Dom elements ready to be put somewhere
var JohaListBldr = function() {

  //Locally scoped
  var internalFunction = function() {
  };

  


  //Exposed
  //this.<something>
};
JohaListBldr.prototype = {

  //Creates a single listItem with delete control
  //Note that listItemElem must have #id
  listItemObj: function(listItemValue, index, parentId, valData){
  
    var bldr = new JohaSimpleBldr;
        
    listItemId = parentId + "_" + index + "_li";
    var listItemElem = bldr.editValueElement(listItemValue, listItemId, valData);
    
    var delId = parentId + "_" + index + "_delCtrl";
    var delCtrl = bldr.deleteControl(listItemElem, delId)
    
    var wrId = parentId + "_" + index + "_listItemWrapper";
    var wrClass = "list_item_wrapper";    
    var wrHtml = "<li=\"" + wrId + "\" class=\"" + wrClass + "\"</li>";
    var wrEl = jQuery(wrHtml);
    wrEl.append(listItemElem);
    wrEl.append(delCtrl);
    
    return wrEl;
  },
};


var JohaElems = function() {};

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
      class: "kvlist_item joha_edit",
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
*/
/* Augment function. from: http://chamnapchhorn.blogspot.com/2009/05/javascript-mixins.html */
/* Used for mixing together two classes ... not used yet */
/*
function augment(receivingClass, givingClass) {
   for(methodName in givingClass.prototype) {
      if(!receivingClass.prototype[methodName]) {
         receivingClass.prototype[methodName] = givingClass.prototype[methodName];
      }
   }
}
*/
/* REMOVE 
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
*/
/*
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

//Working on this right now
function BuildListDom(fieldData, baseId, johaBuilder, nodeId) {

  //this.parentDom = jQuery("<div />", {
  //  id: baseId + "_list",
  //  class: "list",
  //});
  
  //ToDo Fix to ensure unique
  var parentId = nodeId + "_" + baseId;
  
  this.fieldName = get_keys(fieldData)[0];
  
  
  //var johaBuilder = new JohaElems();

  //var fieldContainer = johaBuilder.fieldContainer(this.fieldName, baseId);
  //var listContainer = johaBuilder.listContainer(this.fieldName, baseId);
  
  var listData = fieldData[this.fieldName]; //["a", "b", "c", "d"];
  listDomObj = johaBuilder.buildList(listData, parentId, {});
/*  
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
*/  
  //var currentDomObj = this.parentDom.append(fieldContainer);
/*  
  this.domObj = listDomObj;
  
}
*/
/*
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
*/
//fix the parameters
function domFieldFactory(dataType, fieldData, johaId, johaBuilder, nodeId, fieldIndex){

  var customData = {  "johaData__Type": dataType,
                      "johaData__NodeId": nodeId,
                      "johaData__FieldIndex": fieldIndex,
                   };
  
  var domObj = johaBuilder.buildFieldDataDom(fieldData, customData);
  
  
  return domObj;
}

function domNodeFactory(nodeData, specialTreatment, dataDef, reqDataToShow){

  //TODO, refactor to be passed in
  JOHA_ID = "joha_node";
  
  var domStack = [];
  var nodeDomObj = null;

  //make a copy so we don't munge user data
  //TODO: I think we've already done this
  var nodeCopy = jQuery.extend({}, nodeData);
  
  var nodeId = nodeCopy.id;

  for (key in specialTreatment) {
    if (nodeCopy[key]){
      specialTreatment[key](nodeCopy[key]);
      //delete nodeCopy[key];  // we've handled it so let's not worry about it anymore
    }
    delete nodeCopy[key];  //moved here to avoid the issue where node[key] = null; messing up stuff later.
  }
  
  var johaBuilder = new Joha;


  var fieldIndex = 0
  for (key in nodeCopy) { 
    //if our data defintion exists for that key, use the appropriate function for displaying it
    
    if (dataDef[key] ) {
      var fieldData = {};
      fieldData[key] = nodeCopy[key];
      var fieldDom = domFieldFactory(dataDef[key], fieldData, JOHA_ID, johaBuilder, nodeId, fieldIndex)
      //domStack.push( domFieldFactory(dataDef[key], fieldData, JOHA_ID, johaBuilder, nodeId) );
      domStack.push(fieldDom);
      delete nodeCopy[key];
      array_remove_item(reqDataToShow, key);
    }
    fieldIndex += 1;
  }
  
  //TODO: This screws up the display ordering (required shows will show last regardless) Refactor to preserve
  // display order
  //THis is Currently Broken!!!!!!!!!
  for (i in reqDataToShow) {
    var key = reqDataToShow[i];
    var dataType = dataDef[key];
    var fieldData = {};
    fieldData[key] = "";
    domStack.push( domFieldFactory(dataDef[key], fieldData, johaBuilder, JOHA_ID) );
  }
  
  nodeDomObj = jQuery('<div />');
  for (el in domStack) {
    nodeDomObj.append(domStack[el])
  }
  //nodeDomObj = //new BuildNodeEditDom(JOHA_ID, nodeData.id, domStack);
  jlog("final nodeDomObj", nodeDomObj);
  return nodeDomObj;
}

