root = exports ? this
$ = $ || window.$ || window.$j

#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
dynJc = require 'dynJsonContainers'
RootValueContainer = dynJc.RootValueContainer
BasicValueContainerNoDel = dynJc.BasicValueContainerNoDel
FilesContainer =     dynJc.FilesContainer
LinksContainer =     dynJc.LinksContainer
johaEditClass  =     dynJc.johaEditClass
johaChangeTrigger =  dynJc.johaChangeTrigger
johaComp = require 'johaComponents'
wrapHtml = johaComp.wrapHtml
IdBinder = require('IdTrackerSingleton').IdBinder

#pass through
root.johaEditClass = johaEditClass
root.johaChangeTrigger = johaChangeTrigger

getType = require('forf').getType

class NodeField
  constructor: () ->
    idBinder = IdBinder.get()
    @fieldDomId = idBinder.assignId(this)
    @fieldClass = 'joha-field'
    @fieldNameClass = 'field-name'

class NodeJsonField extends NodeField
  constructor: (@fieldName, @fieldValue) ->
    super()
    @jsonClass = 'field-json'
    @labelClass = 'joha-label'
    @jsonContainer = new RootValueContainer @fieldValue
    @origValue = @jsonContainer.origValue
    labelHtml = '<span>' + @fieldName + '</span>'
    @labelName = $(labelHtml)
    #@labelName.addClass @className + '-label'
    @labelName.addClass @jsonClass
    @labelName.addClass @labelClass

  currentValue: =>
    @jsonContainer.currentValue()

  view: ->
    #ToDo: Requires the label wrapper around it (including className)
    label = @labelName
    cont = $('<div />')
    cont.attr("id", @fieldDomId)
    cont.addClass @fieldClass
    cont.addClass @jsonClass
    val = @jsonContainer.view()
    cont.append label
    cont.append val
    cont

class NodeIdField extends NodeField
  constructor: (@fieldName, @fieldValue) ->
    super()
    @idClass = 'field-id'
    #The value of the id must be a string
    @idFieldValue = String(@fieldValue)
    @origValue = @idFieldValue

  currentValue: -> 
    @idFieldValue  #Shouldn't ever change

  view: ->
    #temp
    nameHtml = '<span>' + @fieldName + '</span>'
    valueHtml = '<span>' + @idFieldValue + '</span>'
    html = '<div>'+ nameHtml + valueHtml + '</div>'
    idCont = $(html)
    idCont.addClass @fieldClass
    idCont.addClass @idClass
    

class NodeLabelField extends NodeField
  constructor: (@fieldName, @fieldValue) ->
    super()
    @labelClass = 'field-label'
    #The value of the label must be a string
    @labelFieldValue = String(@fieldValue)
    @origValue = @labelFieldValue
    #Since value is a string, container will be string container
    @labelName = $('<span>' + @fieldName + '</span>')
    @labelName.addClass @className +  '-label'
    @labelContainer = new BasicValueContainerNoDel @fieldValue
  
  currentValue: => 
    @labelContainer.currentValue()

  view: ->
    label = @labelName 
    cont = $('<div />')
    val = @labelContainer.view()
    cont.addClass @fieldClass
    cont.addClass @labelClass
    cont.append label
    cont.append val
    cont 
 
class NodeFilesField extends NodeField
  constructor: (@fieldName, @fieldValue, nodeId) ->
    super()
    @filesClass = 'field-files'
    #files are an array of file names (without path info)
    #at least for now.
    #ToDo: Robust type checking invalid @fieldValue as
    #well as invalid array items
    valType = getType(@fieldValue)
    @files = if valType is '[object Array]' then @fieldValue else [@fieldValue]
    @filesContainer = new FilesContainer @files, nodeId
    @origValue = @fieldValue

  currentValue: =>
    #addClass @fieldClass
    #addClass @filesClass
    @filesContainer.currentValue()

  view: ->
    #ToDo
    @filesContainer.view()

#ToDo: Node label is set lower down, move it up here?
class NodeLinksField extends NodeField
  constructor: (@fieldName, @fieldValue) ->
    super()
    @linksClass = 'field-links'
    #links are an object of url keys with text values
    #ToDo: Robust type checking invalid @fieldValue as
    #well as invalid array items
    valType = getType(@fieldValue)
    @links = if valType is '[object Object]' then @fieldValue else {}
    @linksContainer = new LinksContainer @links
    @origValue = @fieldValue

  currentValue: ->
    @linksContainer.currentValue()
    
  view: =>
    #ToDo: Add Link wrapper
    linksDom = @linksContainer.view()
    linksDom.addClass @fieldClass
    linksDom.addClass @linksClass

#ToDo: nodeId is only needed for files, is there a more elegant way?
nodeFieldFactory = (fieldName, fieldValue, nodeId) ->

  nodeField = switch fieldName
    when 'id' then new NodeIdField(fieldName, fieldValue)
    when 'label' then new NodeLabelField(fieldName, fieldValue)
    when 'attached_files' then new NodeFilesField(fieldName, fieldValue, nodeId)
    when 'links' then new NodeLinksField(fieldName, fieldValue)
    else new NodeJsonField(fieldName, fieldValue)
  nodeField
    
root.nodeFieldFactory = nodeFieldFactory
