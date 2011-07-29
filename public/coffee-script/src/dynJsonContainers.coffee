#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
root = exports ? this

#Libraries
#Libraries are in stitch/coffeescripts
IdBinder = require('IdTrackerSingleton').IdBinder
forf = require('forf')
getType = forf.getType
extend = forf.extend
johaComp = require('johaComponents')
DeleteButtonBase = johaComp.DeleteButtonBase
softParseJSON = require('jsonHelper').softParseJSON

valueContainerFactory = (value) ->

  containerFromSimpleType = {
    '[object Null]':  BasicValueContainer #(value, 'basic')
    '[object String]':BasicValueContainer #(value, 'basic')
    '[object Number]': BasicValueContainer #(value, 'basic')
    '[object Boolean]': BasicValueContainer #(value, 'basic')
    '[object Array]': ArrayValueContainer #(value, 'array')
    '[object Object]': ObjectValueContainer #(value, 'object')
    }
  
  containerFromValue = (value) ->
    type = getType(value)
    containerClass = containerFromSimpleType[type]
    objContainer = new containerClass(value)
    return objContainer #if objContainer

  container = containerFromValue(value)
  return container   

class ValueContainerBase
  constructor: (@value) ->
    #@currentValue() is the public API
    #@curValue is used for calculating the correct @currentValue
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
    console.log 'appendDelBtn', this
    delBtn = @delBtn.get()
    contDom.append delBtn
    contDom

  makeDelArgs: =>
    alert 'subclasses should make the arguments for the delete function'
    #Default
    targetId = @contId
    delFn = (targetId) =>
      alert 'default delete fn clicked'
      targetDom = $('#'+targetId)
      targetDom.toggleClass 'joha-delete'
      targetDom.change()
    args = {
           targetID: targetId
           delFn: delFn
           }

class BasicValueContainer extends ValueContainerBase
  constructor: (@value) ->
    @containerType = 'basic-vc'
    super @value
    #delFn = (targetId) =>
    #  targetDom = $('#'+targetId)
    #  targetDom.toggleClass 'joha-delete'
    #  targetDom.change()
    #@delBtn = new DeleteButtonBase(@contId, delFn)

  #modify: (newVal) ->
    #@curValue = newVal

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
    divHtml = "<div />"
    div = $(divHtml)
    div.attr("id", @contId)
    valHtml = "<span>" + @curValue + "</span>"
    val = $(valHtml)
    div.append val
    editHtml = "<input type'text' id='" + @domId + "' value='" + @curValue + "'/>"
    edit = $(editHtml)
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
#    delBtn = @delBtn.get()
    #console.log 'delBtn', delBtn
    #ToDo: The joha-delete classis set by the delete button class
    #The class should be set explictly (from here probably)
#    div.append delBtn
    div = @appendDelBtn div 

    #controls
    #Val is the Value Element
    val.addClass 'clickable-label'
    val.click =>
      edit.toggle()
      edit.focus() if val.is ":visible"

    edit.change =>
      #console.log 'CCB', @currentValue()
      newVal = $('#' + @domId).val()
      #@modify(newVal)
      #console.log 'CCB', @currentValue()
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

  makeDelArgs: =>
    console.log 'avc makdDelArs', this
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
    av = $('<div>Arrays</div>')
    av.attr("id", @contId)
    av.addClass @containerType
    for child in @children
      av.append child.view()
      null
    av = @appendDelBtn av
    av

  currentValue: =>
    retVal = if $(@selContId).hasClass 'joha-delete'
      null
    else
      cv = for child in @children
        child.currentValue()
    retVal
    
 #has ability to add new (currently just basic values though?)

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

  makeDelArgs: =>
    console.log 'kvvc makdDelArs', this
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
    kv = $('<div>Key-Value</div>')
    kv.attr("id", @contId)
    kv.addClass @containerType
    k = $('<div>Key</div>')
    kv.append(k)
    k.append(@keyContainer.view())
    v = $('<div>Val</div>')
    kv.append(v)
    v.append(@valContainer.view())
    @appendDelBtn kv

  currentValue: =>
    retVal = if $(@selContId).hasClass 'joha-delete'
      null
    else
      kvVal = {}
      kvVal[@keyContainer.currentValue()] = @valContainer.currentValue()
      kvVal
    retVal
        
class ObjectValueContainer extends ValueContainerBase
  constructor: (@objValue) ->
    @containerType = 'object-vc'
    #we know @objValue is an object
    @kvChildren = for own key, val of @objValue
      kv = {}
      kv[key] = val
      new KeyValue(key, val)
    super @objValue

  view: =>
    obj = $('<div>Object</div>')
    obj.addClass @containerType
    #running for side effect
    for kvChild in @kvChildren
      obj.append(kvChild.view())
      null
    obj
 

  currentValue: =>
    _curVal = {}
    cv = for kvChild in @kvChildren
      extend _curVal, kvChild.currentValue()

    return _curVal
    
 # #has ability to add new (currently just basic values though?)
 
class RootValueContainer
  constructor: (@value, options) ->
    options or= {}
    @containerType = 'root-vc'
    #ToDo: Use extend to set overwrite default options
    @valueContainer = valueContainerFactory(@value)
    @origValue = @valueContainer.origValue

  view: ->
    console.log 'root view value', @currentValue()
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

