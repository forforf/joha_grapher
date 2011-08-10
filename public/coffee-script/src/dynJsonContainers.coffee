#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
root = exports ? this
$ = $ || window.$ || window.$j

#### Overview

# dynJsonContainers convets a JSON object into an editiable
# (jQuery) representation of that object in a browser
#
#     jsonVal = {akv: ['a', {x: 'X'}, ['aa', 'bb']]}
#     jsonObj = new RootValueContainer jsonVal
#     jsonDom = jsonObj.view()
#     $('body').append jsonDom
#
# Containers Types
#   BasicValueContainer -- Wrapper for string, boolean, number, and null
#   ArrayValueContainer -- Wrapper for arrays, contents can be any container type
#   ObjectValueContaier -- Wrapper for Objects, keys are strings (BasicValueContainer), values are any container type
#
# Referencing Containers and their contents by class property
#   BasicValueContainer class = 'basic-vc'
#   ArrayValueContainer class = 'array-vc'
#     Array contents can be of any type
#   ObjectValueContainer class = ' object-vc'
#     KeyValue pair Container class = 'keyvalue-vc'
#     Key Container class = 'basic-vc' (specifically a string)
#     Value contents can be of any type
#

#  Note to self - bundle external dependencies to make
#  an external, self-contained library


#Libraries
#Libraries are in stitch/coffeescripts
IdBinder = require('IdTrackerSingleton').IdBinder
forf = require('forf')
getType = forf.getType
extend = forf.extend
johaComp = require('johaComponents')
wrapHtml = johaComp.wrapHtml
EditButtonBase = johaComp.EditButtonBase
DeleteButtonBase = johaComp.DeleteButtonBase
ArrayDataEntryForm = johaComp.ArrayDataEntryForm
ObjectDataEntryForm = johaComp.ObjectDataEntryForm
softParseJSON = require('jsonHelper').softParseJSON

#Constants
johaEditClass = {
                 "update": "joha-update"
                 "delete": "joha-delete"
                 "create": "joha-create"
                }
johaChangeTrigger = "joha-recalculate"

root.johaEditClass = johaEditClass


#Makes containers based on JSON values
valueContainerFactory = (value) ->

  containerFromSimpleType = {
    '[object Null]':  BasicValueContainer
    '[object String]':BasicValueContainer
    '[object Number]': BasicValueContainer
    '[object Boolean]': BasicValueContainer
    '[object Array]': ArrayValueContainer
    '[object Object]': ObjectValueContainer
    }
  
  containerFromValue = (value) ->
    type = getType(value)
    console.log 'valueContainerFactory - type', type
    containerClass = containerFromSimpleType[type]
    objContainer = new containerClass(value)
    return objContainer #if objContainer

  container = containerFromValue(value)
  return container

#The base container that most other containers
#can inherit from
class ContainerBase
  constructor: (@value) ->
    idBinder = IdBinder.get()
    #assigns ID and this object can be referenced by
    #idBinder.getBoundById - or anywhere by IdBinder.get().getBoundById(domId)
    #ToDo: Evaluate code to see if this can be leveraged
    #I don't think its being used.
    @domId = idBinder.assignId(this)
    @curValue = @value
    @origValue = @value
    @selDomId = '#' + @domId
    @recalcTrigger = root.johaChangeTrigger
    @updateClass = root.johaEditClass["update"]
    @deleteClass = root.johaEditClass["delete"]
    @createClass = root.johaEditClass["create"]
    @commonMethods =
      setValId: (domId) ->
        domId + '-val'

      setEditValId: (domId) ->
        domId + '-edit'

      makeDelBtn: (domId, triggerName, deleteClass) ->
        delFn = (domId) =>
          targetDom = $('#'+domId)
          targetDom.toggleClass deleteClass
          targetDom.trigger(triggerName)
        args =
          targetId: domId
          delFn: delFn
        delBtnObj = new DeleteButtonBase(args)
        delBtn = delBtnObj.get()

class ValueContainerBase extends ContainerBase
  constructor: (@value) ->
    super(@value)
    #@currentValue() is the public API
    #@curValue is used for calculating the correct @currentValue
    #more specifically:
    # @currentValue reflects the result when user edits are applied 
    # @curVal reflects the current internal value ignoring user edits
    #@currentValue shows what the resut would look like when 'saved'
    #@curVal doesn't change until edits are 'saved'
    #@recalcTrigger = root.johaChangeTrigger
    valContBaseMethods =
      updateEditBoxVal: (contDom) ->
        domId = contDom.attr("id")
        valId = domId + '-val'
        editValId = domId + '-edit'
        editBoxValDom = $('#'+editValId)
        valDom = $('#'+valId)
        newVal = editBoxValDom.val()
        valDom.text(newVal)
        newVal

      updateContAfterEdit: (domId) =>
        contDom = $('#'+domId)
        @curValue = @updateEditBoxVal(contDom)
	
	
        #parses as a JSON string, but returns
        #original object if its not a valid JSON string
        #ToDo: What if we don't want to evaluate JSON?
        jsonVal = softParseJSON @curValue
        #Side Effect that updates the container's edit class
        if jsonVal is @origValue
          contDom.removeClass @updateClass
        else
          contDom.addClass @updateClass
        return @curValue  #return value not currently used

      basicView: (curValue, domId, valId, contClass) ->
        inTag = 'span'
        inVal = curValue || "--empty--" 
        inHtml = wrapHtml(inTag, inVal)
        #Outer Div Wrapper
        outerTag = 'div'
        outerHtml = wrapHtml(outerTag)
        div = $(outerHtml)
        div.attr("id", domId)
        valDom = $( inHtml )
        valDom.attr("id", valId)
        div.append valDom
        div.addClass contClass
        {div: div, val: valDom}

      editView: (curValue, editValId, contType) ->
        editTag = 'input'
        editType = "type='text'"
        editHtml = wrapHtml(editTag,'',editType)
        edit = $(editHtml)
        attrs = { id:editValId, value:curValue }
        edit.attr(attrs)
        #hide the editing element initially
        edit.hide()
        edit

      editControl: (elDom, editDom, elClass) ->
        elDom.addClass(elClass)
        elDom.click =>
          editDom.toggle()
          editDom.focus() if elDom.is ":visible"

      onTrigger: (triggerName, listener, eventFn) ->
        listener.bind(triggerName, eventFn)

      editChange: (editDom, domListener, triggerName) ->
        domListener.trigger(triggerName)
        editDom.hide()
    
    @commonMethods = extend(@commonMethods, valContBaseMethods)
    
  jsonType: ->
    typeof @value


  #ToDo: Remove this?
  makeDelArgs: =>
    #Default
    targetId = @domId
    delFn = (targetId) =>
      alert 'No container specific delete fn created'
      #targetDom = $('#'+targetId)
      #targetDom.toggleClass @deleteClass
      #targetDom.change()
    args = {
           targetID: targetId
           delFn: delFn
           }

class BasicValueContainerNoOp extends ValueContainerBase
  contructor: (@value) ->
    super(@value)
    alert("No Op Value Container Not Implemented Yet"

class BasicValueContainerNoDel extends ValueContainerBase
  constructor: (@value) ->
    super(@value)
    @valId = @commonMethods["setValId"](@domId)
    @editValId = @commonMethods["setEditValId"](@domId)

  currentValue: =>
    softParseJSON(@curValue)

  updateEditBoxVal: (contDom) ->
    @commonMethods["updateEditBoxVal"](contDom)

  updateContAfterEdit: (domId) =>
    @commonMethods["updateContAfterEdit"](domId)

  view: ->
    elDoms = @commonMethods["basicView"](@curValue,@domId,
                                         @valId,@containerType)
    div = elDoms["div"]
    valDom = elDoms["val"]
    edit = @commonMethods["editView"](@curValue, @editValId)
    div.append edit
    
    #controls
    @commonMethods["editControl"](valDom, edit, 'clickable-label')
    edit.change =>
      @commonMethods["editChange"](edit, div, @recalcTrigger)
    #ToDo: Move recalc Function to common methods?
    recalcFn = (event) =>
      @updateContAfterEdit( event.target.id )
    @commonMethods["onTrigger"](@recalcTrigger, div, recalcFn)
    return div

#Fully functional container (ToDo: Rename to make it clear)
class BasicValueContainer extends ValueContainerBase
  constructor: (@value) ->
    @containerType = 'basic-vc'
    console.log 'BVC constructor', @value
    super @value
    @valId = @commonMethods["setValId"](@domId)
    @editValId = @commonMethods["setEditValId"](@domId) 
    console.log 'BVC constructor - making DelBtn', @domId, @recalcTrigger, @deleteClass
    @delBtn = @commonMethods["makeDelBtn"](@domId, 
                                              @recalcTrigger,@deleteClass)
    console.log 'BVC constructor done'
    
  currentValue: =>
    #IMPORTANT
    #the currentValue function should return values
    #that reflect the current state of user editing
    #HOWEVER
    #@curVal matches the current dom Values,
    #and returns items marked for deletion
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      softParseJSON(@curValue)  #IMPORTANT: Note that @curValue does not reflect user editing
    retVal

  updateEditBoxVal: (contDom) =>
    @commonMethods["updateEditBoxVal"](contDom)

  updateContAfterEdit: (domId) =>
    @commonMethods["updateContAfterEdit"](domId)

  view: ->
    elDoms = @commonMethods["basicView"](@curValue,@domId,
                                         @valId, @containerType)
    div = elDoms["div"]
    valDom = elDoms["val"]
    div.append @delBtn
    #edit field for value
    edit = @commonMethods["editView"](@curValue, @editValId)
    div.append edit
    

    #controls
    @commonMethods["editControl"](valDom, edit, 'clickable-label')
    edit.change =>
      @commonMethods["editChange"](edit, div, @recalcTrigger)

    #let external entities trigger updates
    recalcFn = (event) =>
      @updateContAfterEdit( event.target.id )
     
    @commonMethods["onTrigger"](@recalcTrigger, div, recalcFn)
    #return dom 
    return div
 
class ArrayValueContainer extends ContainerBase
  constructor: (@value) ->
    @containerType = 'array-vc'
    @itemClass = 'joha-array-item'
    @newFormClass = 'joha-array-add'
    #we know @value is an array
    @children = for val in @value
      valueContainerFactory(val)
    super @value
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)


  addNewItem = (me, newVal) =>
    newJsonVal = softParseJSON newVal
    newChild = new RootValueContainer(newJsonVal)
    me.children.push newChild
    #Add new child to Dom
    thisDom = $(me.selDomId)
    #append to end of array items
    jItemClass = '.' + me.itemClass
    lastArrayItemDom = thisDom.find(jItemClass).last()
    lastArrayItemDom.after( newChild.view() )
    newChildDom = $(newChild.valueContainer.selDomId)
    newChildDom.addClass me.createClass
    newChildDom.trigger(me.recalcTrigger)

  view: =>
    tag = 'div'
    val = '' #value label
    avHtml = wrapHtml(tag, val)
    av = $(avHtml)
    av.attr("id", @domId)
    av.addClass @containerType
    for child in @children
      childDom = child.view()
      childDom.addClass @itemClass
      av.append childDom
      null
    #av = @appendDelBtn av
    av.append @delBtn

    addNew = new ArrayDataEntryForm(this, addNewItem)
    addNewForm = addNew.get()
    formId = @domId + '-addform'
    addNewForm.addClass @newFormClass
    addNewForm.attr('id', formId)
    addNewForm.hide()

    editFn = (targetId) =>
      formDom = $('#'+formId)
      formDom.toggle()
    
    editBtnArgs = {targetId: @domId , editFn: editFn}
    editBtn = new EditButtonBase(editBtnArgs)
    av.append editBtn.get()
    av.append addNewForm
    av

  currentValue: =>
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      cv = for child in @children
        child.currentValue()
    retVal

class KeyValueBase extends ContainerBase
  constructor: (@key, @val) ->
    super()
    kvBaseMethods = 
      basicView: (kvCont, keyCont, valCont) ->
        domId = kvCont.domId
        contType = kvCont.containerType
        kvLabel = kvCont.kvLabel 
        kLabel = kvCont.kLabel
        kClass = kvCont.kClass
        vLabel = kvCont.vLabel
        vClass = kvCont.vClass
        kvTag = 'div'
        kvHtml = wrapHtml( kvTag, kvLabel)
        kv = $(kvHtml)
        kTag = 'div'
        kHtml = wrapHtml( kTag, kLabel )
        k = $(kHtml)
        k.addClass kClass
        vTag = 'div'
        vHtml = wrapHtml(vTag, vLabel)
        v = $(vHtml)
        v.addClass vClass
        kv.attr("id", domId)
        kv.addClass(contType)
        kv.append k
        k.append keyCont.view()
        kv.append v
        v.append valCont.view()
        kv
      currentValue: (domId, kCont, vCont, deleteClass) ->
        retVal = if $('#'+domId).hasClass deleteClass
          null
        else
          kvVal = {}
          kvVal[kCont.currentValue()] = vCont.currentValue()
          kvVal
        retVal
    @commonMethods = extend(@commonMethods, kvBaseMethods)

class KeyValue extends KeyValueBase
  constructor: (@key, @val) ->
    super(@key, @val)
    @containerType = 'keyvalue-vc'
    #keyContainer should always be basic type (string)
    @keyContainer = valueContainerFactory(@key)
    @valContainer = valueContainerFactory(@val)
    @kvLabel = "" #Label for key-value wrapper
    @kLabel = ""
    @kClass = "keyvaluekey-vc"
    @vLabel = ""
    @vClass = "keyvaluevalue-vc"
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)

  view: =>
    kv = @commonMethods["basicView"](this, @keyContainer, @valContainer)
    kv.append @delBtn
    kv

  currentValue: =>
    @commonMethods["currentValue"](@domId, @keyContainer,
                                   @valContainer, @deleteClass)
class ObjectBase extends ContainerBase
  constructor: (@objValue) ->
    super @objValue
    objBaseMethods =
      basicObjView: (objCont) ->
        tag = 'div'
        label = objCont.objLabel
        objHtml = wrapHtml(tag, label)
        obj = $(objHtml)
        obj.attr("id", objCont.domId)
        obj.addClass objCont.containerType
        #running for side effect
        for child in objCont.kvChildren
          childDom = child.view()
          childDom.addClass objCont.itemClass
          obj.append childDom
          null
        obj

     @commonMethods = extend(@commonMethods, objBaseMethods)

class ObjectValueContainer extends ObjectBase
  constructor: (@objValue) ->
    @containerType = 'object-vc'
    @itemClass = 'joha-object-item'
    @newFormClass = 'joha-object-add'
    @objLabel = '' #label for object container
    #we know @objValue is an object
    @kvChildren = for own key, val of @objValue
      new KeyValue(key, val)
    super @objValue
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)


  addNewItem = (me, newObj) =>
    newKey = newObj["key"]
    newVal = newObj["val"]
    newKeyStr = String newKey
    newJsonVal = softParseJSON newVal
    newChild = new KeyValue(newKeyStr, newJsonVal)
    me.kvChildren.push newChild
    #Add new child to Dom
    thisDom = $(me.selDomId)
    #append to end of obj items
    jItemClass = '.' + me.itemClass
    lastObjItemDom = thisDom.find(jItemClass).last()
    lastObjItemDom.after( newChild.view() )
    newChildDom = $(newChild.selDomId)
    newChildDom.addClass me.createClass
    newChildDom.trigger(me.recalcTrigger)

  view: =>
    obj = @commonMethods["basicObjView"](this)
    obj.append @delBtn

    addNew = new ObjectDataEntryForm(this, addNewItem)
    addNewForm = addNew.get()
    formId = @domId + 'addfrom'
    addNewForm.addClass @newFormClass
    addNewForm.attr('id', formId)
    addNewForm.hide()

    editFn = (targetId) =>
      formDom = $('#'+formId)
      formDom.toggle()

    editBtnArgs = {targetId: @domId , editFn: editFn}
    editBtn = new EditButtonBase(editBtnArgs)

    obj.append editBtn.get()
    obj.append addNewForm
    obj

  currentValue: =>
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      _curVal = {}
      cv = for kvChild in @kvChildren
        extend _curVal, kvChild.currentValue()
      _curVal
    retVal

#ToDo:Provide option to force @value to be a certain type
#ToDo:Provide option that prevents adding/deleting, and one for read only (no edits allowed) 
class RootValueContainer
  constructor: (@value, options) ->
    console.log 'RVC constructor entered', @value
    options or= {}
    @containerType = 'root-vc'
    #ToDo: Use extend to set overwrite default options
    @valueContainer = valueContainerFactory(@value)
    @origValue = @valueContainer.origValue

  view: ->
    valCont = @valueContainer.view()
    valCont.addClass 'value-container'

  currentValue: =>
    @valueContainer.currentValue()

#ToDo: Add to specs
#Where to keep origValue?
#Should it be here or the parent container?
class FilesContainer
  constructor: (@files, options) ->
    @fileClassName = 'joha-filename'
    @filesClassName = 'joha-files'

  view: ->
    dom = $('<div />')
    fileSepEl = 'span'
    sepStart = '<' + fileSepEl + '>'
    sepEnd = '</' + fileSepEl + '>'
    @files.forEach (filename) ->
      fileDom = $(sepStart + filename + sepEnd)
      dom.append fileDom
      null
 
    dom.find(fileSepEl).addClass @fileClassName
    dom.addClass @filesClassName
    dom
   
  _curVal: ->
    undefined

  currentValue: =>
    calcVal = @_curVal()
    calcVal || @files

class LinksKeyValue extends KeyValueBase
  constructor: (@key, @val)->
    super(@key, @val)
    @containerType = 'linkskv-vc'
    @keyContainer = new BasicValueContainerNoDel(@key)
    @valContainer = new BasicValueContainerNoDel(@val)
    @kvLabel = "---"
    @kLabel = "Link URL"
    @vLabel = "Link Label"
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)
  
  view: =>
    linkskv = @commonMethods["basicView"](this, @keyContainer, @valContainer)
    linkskv.append @delBtn
 
  currentValue: =>
    console.log "LinksKeyValueConts", @keyContainer, @valContainer
    @commonMethods["currentValue"](@domId, @keyContainer,
                                   @valContainer, @deleteClass)

#ToDo Add to specs
class LinksContainer extends ObjectBase
  constructor: (links, options) ->
    @objValue = links
    @containerType = 'links-edit-vc'
    @itemClass = 'joha-links-item'
    @objLabel = "Links"
    @showEditClass = 'joha-link-edit-active'
    @viewClass = 'joha-link-view'
    @editClass = 'joha-link-edit'
    @linksChildren = for own key, val of @objValue
      new LinksKeyValue(key, val)
    @kvChildren = @linksChildren #ToDo: refactor to single name
    super @objValue
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)

  view: =>
    linksDomClass = 'joha-links'
    linksDom = $('<div />')
    linksDom.addClass  linksDomClass
    linkEditDom = @commonMethods["basicObjView"](this)
    linkViewDom = @linksView @currentValue() 
    linkEditDom.addClass @editClass
    linkViewDom.addClass @viewClass
 
    if linksDom.hasClass @showEditClass
      linkEditDom.show()
      linkViewDom.hide()
    else
      linkEditDom.hide()
      linkViewDom.show()

    linksDom.append linkEditDom
    linksDom.append linkViewDom

    editFn = (targetId) =>
      targetDom = $('.'+linksDomClass)
      targetDom.toggleClass @showEditClass
      targetDom.trigger(johaChangeTrigger) 

    editBtnArgs = {targetId: @domId , editFn: editFn}
    editBtn = new EditButtonBase(editBtnArgs)
    linksDom.append editBtn.get()

    #This function is relying on a lot of 'this'
    #magic. Is there a better way?
    toggleViewOrEditFn = (event) =>
      newLinks =  @linksView @currentValue()
      linksDom.find('.'+@viewClass).replaceWith newLinks
      if linksDom.hasClass @showEditClass
        linksDom.find('.'+@viewClass).hide()
        linksDom.find('.'+@editClass).show()
      else
        linksDom.find('.'+@viewClass).show()
        linksDom.find('.'+@editClass).hide()  

    linksDom.bind(johaChangeTrigger, toggleViewOrEditFn)

  linkViewDom: (url, label) ->
    attrs = "href='" + url + "'"
    linkHtml = wrapHtml('a', label, attrs)
    linkDom = $(linkHtml)
    linkDom.addClass @itemClass
    linkDom

  linksView:  (links) ->
    linksViewOuterHtml = wrapHtml('div','Links')
    linksViewOuterDom = $(linksViewOuterHtml)
    linksViewOuterDom.addClass @viewClass
    for own url, label of links
      linkViewDom = @linkViewDom(url, label)
      linksViewOuterDom.append linkViewDom
      null
    linksViewOuterDom

  linkEditDom: (url, label) ->
    objHtml = wrapHtml('div')
    urlHtml = wrapHtml('span', url)
    labelHtml = wrapHtml('span', label)
    urlCont = new BasicValueContainer(url)
    labelCont = new BasicValueContainer(label)
    _kv = {}
    _kv[url] = label
    objDom = $(objHtml)
    urlDom = urlCont.view() 
    labelDom = labelCont.view() 
    objDom.append urlDom
    objDom.append labelDom
    

  linksEdit: (links) ->
    linksEditDom  = $('<div />')
    #linksEditDom.addClass 'link-edit'
    for own url, label of links
      linkEditDom = @linkEditDom(url, label)
      linksEditDom.append linkEditDom
      null
    linksEditDom


  _curVal: ->
    undefined

  currentValue: => 
    _curVal = {}
    cv = for kvChild in @kvChildren
      extend _curVal, kvChild.currentValue()
    _curVal

root.RootValueContainer = RootValueContainer
root.BasicValueContainerNoDel = BasicValueContainerNoDel
root.FilesContainer = FilesContainer
root.LinksContainer = LinksContainer
root.johaChangeTrigger = johaChangeTrigger

