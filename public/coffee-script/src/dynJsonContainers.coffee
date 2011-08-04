#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
root = exports ? this
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

#  Note to self2 - this library currently contains
#  Links and File Containers, that are not constructed
#  via the Factory


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


#Makes the specific JSON containers
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
    containerClass = containerFromSimpleType[type]
    objContainer = new containerClass(value)
    return objContainer #if objContainer

  container = containerFromValue(value)
  return container

#The base container that most other containers
#can inherit from
class ContainerBase
  constructor: (@value) ->
    nothing yet

#The base container for holding values
class ValueContainerBase extends ContainerBase

  constructor: (@value) ->
    #super(@value)
    #@currentValue() is the public API
    #@curValue is used for calculating the correct @currentValue
    #more specifically:
    # @currentValue reflects the result when user edits are applied 
    # @curVal reflects the current internal value ignoring user edits
    #@currentValue shows what the resut would look like when 'saved'
    #@curVal doesn't change until edits are 'saved'
    @curValue = @value
    @origValue = @value
    idBinder = IdBinder.get()
    @domId = idBinder.assignId(@)
    @selDomId = '#' + @domId
    delArgs = @makeDelArgs()
    @delBtn = new DeleteButtonBase(delArgs)
    @updateClass = root.johaEditClass["update"]
    @deleteClass = root.johaEditClass["delete"]
    @createClass = root.johaEditClass["create"]
    @recalcTrigger = root.johaChangeTrigger

  jsonType: ->
    typeof @value

  appendDelBtn: (contDom) =>
    delBtn = @delBtn.get()
    contDom.append delBtn
    contDom

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

class BasicValueContainer extends ValueContainerBase
  constructor: (@value) ->
    @containerType = 'basic-vc'
    super @value
    @valId = @domId + '-val'
    @editValId = @domId + '-edit'
    @deleteClass = root.johaEditClass["delete"]
    #@recalcTrigger = root.johaEditClass["changed"]

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

  makeDelArgs: =>
    targetId = @domId
    delFn = (targetId) =>
      targetDom = $('#'+targetId)
      targetDom.toggleClass @deleteClass
      #targetDom.change()
      targetDom.trigger(@recalcTrigger)
    args = {
           targetId: targetId
           delFn: delFn
           }

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
    #updateClass = root.johaEditClass["update"]
    if jsonVal is @origValue
      contDom.removeClass @updateClass
    else
      contDom.addClass @updateClass

    return @curValue  #return value not currently used
    

  view: ->
    #Value
    inTag = 'span'
    inVal = @curValue
    inHtml = wrapHtml(inTag, inVal)
    #Outer Div Wrapper
    outerTag = 'div'
    outerHtml = wrapHtml(outerTag)
    div = $(outerHtml)
    div.attr("id", @domId)
    valDom = $( inHtml )
    valDom.attr("id", @valId)
    div.append valDom
    #edit field for value
    editTag = 'input'
    editType = "type='text'"
    editHtml = wrapHtml(editTag,'',editType)
    edit = $(editHtml)
    attrs = { id:@editValId, value:@curValue }
    edit.attr(attrs)
    #hide the editing element initially
    edit.hide()
      
    contClass = @containerType
    div.addClass contClass
    div.append edit
    div = @appendDelBtn div 

    #controls
    #val is the Value Element jQueried
    valDom.addClass 'clickable-label'
    valDom.click =>
      edit.toggle()
      edit.focus() if valDom.is ":visible"


    edit.change =>
      alert @recalcTrigger
      div.trigger(@recalcTrigger)
      edit.hide()

    #let external entities trigger updates
    recalcFn = (event) =>
      console.log "Recalc", event.target.id, event
      @updateContAfterEdit( event.target.id )
     
    div.bind(@recalcTrigger, recalcFn) 

    #return dom 
    return div
    
class ArrayValueContainer extends ValueContainerBase
  constructor: (@value) ->
    @containerType = 'array-vc'
    @itemClass = 'joha-array-item'
    #we know @value is an array
    @children = for val in @value
      valueContainerFactory(val)
    super @value


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
    #TODO: Determine if this is the right way to update things
    #I'm guessing no.
    console.log 'AVC', newChildDom
    newChildDom.trigger(me.recalcTrigger)
    #newChildDom.change()

  makeDelArgs: =>
    targetId = @domId
    delFn = (targetId) =>
      targetDom = $('#'+targetId)
      targetDom.toggleClass @deleteClass 
      #targetDom.change()
      targetDom.trigger(@recalcTrigger)
    args = {
           targetId: targetId
           delFn: delFn
           }

  view: =>
    tag = 'div'
    val = 'Arrays'
    avHtml = wrapHtml(tag, val)
    av = $(avHtml)
    av.attr("id", @domId)
    av.addClass @containerType
    for child in @children
      childDom = child.view()
      childDom.addClass @itemClass
      av.append childDom
      null
    av = @appendDelBtn av
    
    addNew = new ArrayDataEntryForm(this, addNewItem)
    av.append addNew.get()
    av

  currentValue: =>
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      cv = for child in @children
        child.currentValue()
    retVal

class KeyValue extends ValueContainerBase
  constructor: (@key, @val) ->
    super()
    @containerType = 'keyvalue-vc'
    #keyContainer should always be basic type (string)
    @keyContainer = valueContainerFactory(@key)
    @valContainer = valueContainerFactory(@val)
    idBinder = IdBinder.get()
    @domId = idBinder.assignId(@)
    #@domId = @domId #+ "-cont"
    @selDomId = '#' + @domId
    delArgs = @makeDelArgs()
    @delBtn = new DeleteButtonBase(delArgs)

  view: =>
    #Set up jQuery objects
    kvtag = 'div'
    kvlabel = 'Key-Value'
    kvHtml = wrapHtml( kvtag, kvlabel )
    kv = $(kvHtml)
    ktag = 'div'
    klabel = 'Key'
    kHtml = wrapHtml( ktag, klabel)
    k = $(kHtml)
    vtag = 'div'
    vlabel = 'Value'
    vHtml = wrapHtml( vtag, vlabel)
    v = $(vHtml)
    #manipulate Dom structure
    kv.attr("id", @domId)
    kv.addClass @containerType
    kv.append(k)
    k.append(@keyContainer.view())
    kv.append(v)
    v.append(@valContainer.view())
    @appendDelBtn kv
    kv

  currentValue: =>
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      kvVal = {}
      kvVal[@keyContainer.currentValue()] = @valContainer.currentValue()
      kvVal
    retVal

  makeDelArgs: =>
    targetId = @domId
    delFn = (targetId) =>
      targetDom = $('#'+targetId)
      targetDom.toggleClass @deleteClass
      targetDom.trigger(@recalcTrigger)
      #targetDom.change()
    args = {
           targetId: targetId
           delFn: delFn
           }

        
class ObjectValueContainer extends ValueContainerBase
  constructor: (@objValue) ->
    @containerType = 'object-vc'
    @itemClass = 'joha-object-item'
    #we know @objValue is an object
    @kvChildren = for own key, val of @objValue
      kv = {}
      kv[key] = val
      new KeyValue(key, val)
    super @objValue


  addNewItem = (me, newObj) =>
    newKey = newObj["key"]
    newVal = newObj["val"]
    newKeyStr = String newKey
    newJsonVal = softParseJSON newVal
    #newCleanObj = {}
    #newCleanObj["key"] = newKeyStr
    #newCleanObj["val"] = newJsonVal
    newChild = new KeyValue(newKeyStr, newJsonVal)
    console.log "Obj Cont", me
    console.log "Obj Add New", newChild
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
    #newChildDom.change()

  view: =>
    tag = 'div'
    val = 'Object'
    objHtml = wrapHtml(tag, val)
    obj = $(objHtml)
    obj.attr("id", @domId)
    obj.addClass @containerType
    #running for side effect
    for kvChild in @kvChildren
      kvChildDom = kvChild.view()
      kvChildDom.addClass @itemClass
      obj.append kvChildDom
      null
    @appendDelBtn obj

    addNew = new ObjectDataEntryForm(this, addNewItem)
    obj.append addNew.get()
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
 
  makeDelArgs: =>
    targetId = @domId
    delFn = (targetId) =>
      targetDom = $('#'+targetId)
      targetDom.toggleClass @deleteClass
      targetDom.trigger(@recalcTrigger)
      #targetDom.change()
    args = {
           targetId: targetId
           delFn: delFn
           }

#ToDo:Provide option to force @value to be a certain type
#ToDo:Provide option that prevents adding/deleting, and one for read only (no edits allowed) 
class RootValueContainer
  constructor: (@value, options) ->
    options or= {}
    @containerType = 'root-vc'
    #ToDo: Use extend to set overwrite default options
    @valueContainer = valueContainerFactory(@value)
    @origValue = @valueContainer.origValue

  view: ->
    @valueContainer.view()

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

#ToDo Add to specs
class LinksContainer
  constructor: (@links, options) ->
    idBinder = IdBinder.get()
    @domId = idBinder.assignId(@)
    #@domId = @domId #+ "-cont"
    @selDomId = '#' + @domId
    @linksClassName = 'joha-urllinks'
    @linkClassName = 'joha-link'

  domShowHide: (domList) ->
    for own dom, state of domList
      switch state
        when "show"
          dom.show()
        when "hide"
          dom.hide()
        when "toggle"
          dom.toggle()

  view: ->
    #if class is 'joha-link-edit-active' the edit view is shown
    #else the normal view is shown
    
    linkViewClass = 'link-view'
    #linkEditClass = 'link-edit'
    dom = $('<div />')
    dom.attr("id", @domId)
    dom.addClass @linksClassName

    #domLinkView = $('<div />')
    #domLinkView.addClass linkViewClass
    #@linkViewAppend(domLinkView, @links)
    linksViewDom = @linksView(@links)
    linksEditDom = @linksEdit(@links)
    if dom.hasClass 'joha-link-edit-active'
      linksViewDom.hide()
      linksEditDom.show()
    else
      linksViewDom.show()
      linksEditDom.hide()

    dom.append linksViewDom
    dom.append linksEditDom
    
    editFn = (targetId) =>
      console.log 'edit fn', targetId, $('#'+targetId)
      targetDom = $('#'+targetId)
      targetDom.toggleClass('joha-link-edit-active')
      targetDom.trigger(johaChangeTrigger) 
      #targetDom.change()

    editBtnArgs = {targetId: @domId , editFn: editFn}
    editBtn = new EditButtonBase(editBtnArgs)
    dom.append editBtn.get()

    #dom.change =>
    toggleViewOrEditFn = =>
      if dom.hasClass 'joha-link-edit-active'
        dom.find('.link-view').hide()
        dom.find('.link-edit').show()
      else
        dom.find('.link-view').show()
        dom.find('.link-edit').hide()

    dom.bind(johaChangeTrigger, toggleViewOrEditFn)


  linkViewDom: (url, label) ->
    attrs = "href='" + url + "'"
    linkHtml = wrapHtml('a', label, attrs)
    linkDom = $(linkHtml)
    linkDom.addClass 'joha-link-item'
    linkDom

  linksView:  (links) ->
    linksViewOuterHtml = wrapHtml('div')
    linksViewOuterDom = $(linksViewOuterHtml)
    linksViewOuterDom.addClass 'link-view'
    #for own url, label of links
    #  linkViewDom = @linkViewDom(url, label)
    #  linksViewOuterDom.append linkViewDom
    #  null
    objCont = new ObjectValueContainer(links)
    linksViewOuterDom.append objCont.view()
    linksViewOuterDom

  linkEditDom: (url, label) ->
    objHtml = wrapHtml('div')
    urlHtml = wrapHtml('span', url)
    labelHtml = wrapHtml('span', label)
    urlCont = new BasicValueContainer(url)
    labelCont = new BasicValueContainer(label)
    _kv = {}
    _kv[url] = label
    #objCont = new ObjectValueContainer(_kv)
    objDom = $(objHtml)
    urlDom = urlCont.view() #(urlHtml)
    labelDom = labelCont.view() # $(labelHtml)
    objDom.append urlDom
    objDom.append labelDom
    #objDom.append objCont.view()
    

  linksEdit: (links) ->
    linksEditDom  = $('<div />')
    linksEditDom.addClass 'link-edit'
    for own url, label of links
      linkEditDom = @linkEditDom(url, label)
      linksEditDom.append linkEditDom
      null
    linksEditDom


  _curVal: ->
    undefined

  currentValue: => 
    calcVal = @_curVal()
    calcVal || @links
    

root.RootValueContainer = RootValueContainer
root.FilesContainer = FilesContainer
root.LinksContainer = LinksContainer
root.johaChangeTrigger = johaChangeTrigger

