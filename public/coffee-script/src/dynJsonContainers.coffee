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
DeleteButtonBase = johaComp.DeleteButtonBase
ArrayDataEntryForm = johaComp.ArrayDataEntryForm
ObjectDataEntryForm = johaComp.ObjectDataEntryForm
softParseJSON = require('jsonHelper').softParseJSON


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
class ValueContainerBase

  constructor: (@value) ->
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
    @contId = @domId + "-cont"
    @selContId = '#' + @contId
    delArgs = @makeDelArgs()
    @delBtn = new DeleteButtonBase(delArgs)

  jsonType: ->
    typeof @value

  appendDelBtn: (contDom) =>
    delBtn = @delBtn.get()
    contDom.append delBtn
    contDom

  makeDelArgs: =>
    #Default
    targetId = @contId
    delFn = (targetId) =>
      alert 'No container specific delete fn created'
      #targetDom = $('#'+targetId)
      #targetDom.toggleClass 'joha-delete'
      #targetDom.change()
    args = {
           targetID: targetId
           delFn: delFn
           }

class BasicValueContainer extends ValueContainerBase
  constructor: (@value) ->
    @containerType = 'basic-vc'
    super @value

  currentValue: =>
    #IMPORTANT
    #the currentValue function should return values
    #that reflect the current state of user editing
    #HOWEVER
    #@curVal matches the current dom Values,
    #and returns items marked for deletion
    #console.log 'basevalcont this', @, @domId
    retVal = if $(@selContId).hasClass 'joha-delete'
      null
    else
      @curValue  #IMPORTANT: Note that @curValue does not reflect user editing
    retVal

  makeDelArgs: =>
    targetId = @contId
    delFn = (targetId) =>
      targetDom = $('#'+targetId)
      targetDom.toggleClass 'joha-delete'
      targetDom.change()
    args = {
           targetId: targetId
           delFn: delFn
           }

  view: ->
    #Value
    inTag = 'span'
    inVal = @curValue
    inHtml = wrapHtml(inTag, inVal)
    #Outer Div Wrapper
    outerTag = 'div'
    outerHtml = wrapHtml(outerTag)
    div = $(outerHtml)
    div.attr("id", @contId)
    val = $( inHtml )
    div.append val
    #edit field for value
    editTag = 'input'
    editType = "type='text'"
    editHtml = wrapHtml(editTag,'',editType)
    edit = $(editHtml)
    attrs = { id:@domId, value:@curValue }
    edit.attr(attrs)
    #hide the editing element initially
    edit.hide()
      
    contClass = @containerType
    div.addClass contClass
    #Removed edit button, instead click on value.
    #Did this because of possible confusion with the delete button
    ##edit button should show/hide edit field
    ##change class of the edit button to differentiate between showing/hiding?
    #editBtn = johaEditBtn("")
    div.append edit
    div = @appendDelBtn div 

    #controls
    #Val is the Value Element
    val.addClass 'clickable-label'
    val.click =>
      edit.toggle()
      edit.focus() if val.is ":visible"

    edit.change =>
      newVal = $('#' + @domId).val()
      val.text(newVal)
      @curValue = newVal
      thisContDom = $(@selContId)
      jcurVal = softParseJSON @curValue
      jorigVal = @origValue
      if jcurVal is jorigVal
        thisContDom.removeClass 'joha-update'
      else
        thisContDom.addClass 'joha-update'
      edit.hide()
    #return dom 
    return div
    
class ArrayValueContainer extends ValueContainerBase
  constructor: (@value) ->
    @containerType = 'array-vc'
    #we know @value is an array
    @children = for val in @value
      valueContainerFactory(val)
    super @value

  addNewItem = (me, newVal) =>
    newJsonVal = softParseJSON newVal
    newChild = new RootValueContainer(newJsonVal)
    me.children.push newChild
    #Add new child to Dom
    thisDom = $(me.selContId)
    #append to end of array items
    lastArrayItemDom = thisDom.find('.joha-array-item').last()
    lastArrayItemDom.after( newChild.view() )
    newChildDom = $(newChild.valueContainer.selContId)
    newChildDom.addClass 'joha-create'
    #TODO: Determine if this is the right way to update things
    #I'm guessing no.
    newChildDom.change()

  makeDelArgs: =>
    targetId = @contId
    delFn = (targetId) =>
      targetDom = $('#'+targetId)
      targetDom.toggleClass 'joha-delete'
      targetDom.change()
    args = {
           targetId: targetId
           delFn: delFn
           }

  view: =>
    tag = 'div'
    val = 'Arrays'
    avHtml = wrapHtml(tag, val)
    av = $(avHtml)
    av.attr("id", @contId)
    av.addClass @containerType
    for child in @children
      childDom = child.view()
      childDom.addClass 'joha-array-item'
      av.append childDom
      null
    av = @appendDelBtn av
    
    addNew = new ArrayDataEntryForm(this, addNewItem)
    av.append addNew.get()
    av

  currentValue: =>
    retVal = if $(@selContId).hasClass 'joha-delete'
      null
    else
      cv = for child in @children
        child.currentValue()
    retVal

class KeyValue extends ValueContainerBase
  constructor: (@key, @val) ->
    @containerType = 'keyvalue-vc'
    #keyContainer should always be basic type (string)
    @keyContainer = valueContainerFactory(@key)
    @valContainer = valueContainerFactory(@val)
    idBinder = IdBinder.get()
    @domId = idBinder.assignId(@)
    @contId = @domId + "-cont"
    @selContId = '#' + @contId
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
    kv.attr("id", @contId)
    kv.addClass @containerType
    kv.append(k)
    k.append(@keyContainer.view())
    kv.append(v)
    v.append(@valContainer.view())
    @appendDelBtn kv
    kv

  currentValue: =>
    retVal = if $(@selContId).hasClass 'joha-delete'
      null
    else
      kvVal = {}
      kvVal[@keyContainer.currentValue()] = @valContainer.currentValue()
      kvVal
    retVal

  makeDelArgs: =>
    targetId = @contId
    delFn = (targetId) =>
      targetDom = $('#'+targetId)
      targetDom.toggleClass 'joha-delete'
      targetDom.change()
    args = {
           targetId: targetId
           delFn: delFn
           }

        
class ObjectValueContainer extends ValueContainerBase
  constructor: (@objValue) ->
    @containerType = 'object-vc'
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
    thisDom = $(me.selContId)
    #append to end of obj items
    lastObjItemDom = thisDom.find('.joha-object-item').last()
    lastObjItemDom.after( newChild.view() )
    newChildDom = $(newChild.selContId)
    newChildDom.addClass 'joha-create'
    #TODO: Determine if this is the right way to update things
    #I'm guessing no.
    newChildDom.change()

  view: =>
    tag = 'div'
    val = 'Object'
    objHtml = wrapHtml(tag, val)
    obj = $(objHtml)
    obj.attr("id", @contId)
    obj.addClass @containerType
    #running for side effect
    for kvChild in @kvChildren
      kvChildDom = kvChild.view()
      kvChildDom.addClass 'joha-object-item'
      obj.append kvChildDom
      null
    @appendDelBtn obj

    addNew = new ObjectDataEntryForm(this, addNewItem)
    obj.append addNew.get()
    obj

  currentValue: =>
    retVal = if $(@selContId).hasClass 'joha-delete'
      null
    else
      _curVal = {}
      cv = for kvChild in @kvChildren
        extend _curVal, kvChild.currentValue()
      _curVal
    retVal
 
  makeDelArgs: =>
    targetId = @contId
    delFn = (targetId) =>
      targetDom = $('#'+targetId)
      targetDom.toggleClass 'joha-delete'
      targetDom.change()
    args = {
           targetId: targetId
           delFn: delFn
           }

 # #has ability to add new (currently just basic values though?)
 
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
    @linksClassName = 'joha-urllinks'
    @linkClassName = 'joha-link'

  view: ->
    linkViewClass = 'link-view'
    linkEditClass = 'link-edit'
    dom = $('<div />')
    dom.addClass @linksClassName

    domLinkView = $('<div />')
    domLinkView.addClass linkViewClass
    @linkViewAppend(domLinkView, @links)

    domLinkEdit = $('<div />')
    domLinkEdit.addClass linkEditClass
    @linkEditAppend(domLinkEdit, @links)
    
    dom.append domLinkView
    dom.append domLinkEdit
    dom

  linkViewAppend: (parentDom, links) ->
    linkViewSepEl = 'div'
    sepStart = '<' + linkViewSepEl + '>'
    sepEnd = '</' + linkViewSepEl + '>'
    for own url, label of links
      linkViewDom = $(sepStart + label + sepEnd)
      parentDom.append linkViewDom
      null

  linkEditAppend: (parentDom, links) ->
    linkEditSepEl = 'div'
    sepStart = '<' + linkEditSepEl + '>'
    sepEnd = '</' + linkEditSepEl + '>'
    for own url, label of links
      editHtml = '<span>' + url + '</span><span>' + label + '</span>'
      linkEditDom = $(sepStart + editHtml + sepEnd)
      parentDom.append linkEditDom
      null

  _curVal: ->
    undefined

  currentValue: => 
    calcVal = @_curVal()
    calcVal || @links
    

root.RootValueContainer = RootValueContainer
root.FilesContainer = FilesContainer
root.LinksContainer = LinksContainer

