root = exports ? this
#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
RootValueContainer = require('dynJsonContainers').RootValueContainer

class NodeField
  ni = 'Not Implemented'
  constructor: (@fieldName, @fieldValue) ->

class NodeJsonField extends NodeField
  constructor: (@fieldName, @fieldValue) ->
    @className = 'json-field'
    @jsonContainer = new RootValueContainer @fieldValue
    @origValue = @jsonContainer.origValue

  currentValue: ->
    @jsonContainer.currentValue()

  view: ->
    #ToDo: Requires the label wrapper around it (including className)
    @jsonContainer.view()

class NodeIdField extends NodeField
  constructor: (@fieldName, @fieldValue) ->
    @className = 'id-field'
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
    $(html).addClass @className

class NodeLabelField extends NodeField
  constructor: (@fieldName, @fieldValue) ->
    @className = 'label-field'
    #The value of the label must be a string
    @labelFieldValue = String(@fieldValue)
    @origValue = @labelFieldValue
    #Since value is a string, container will be string container
    @labelContainer = new RootValueContainer @fieldValue
  
  currentValue: -> 
    @labelContainer.currentValue()

  view: ->
    #label wrapper
    @labelContainer.view()

:class NodeFilesField extends NodeField

class NodeLinksField extends NodeField

nodeFieldFactory = (fieldName, fieldValue) ->
  switch fieldName
    when 'id' then new NodeIdField(fieldName, fieldValue)
    when 'label' then new NodeLabelField(fieldName, fieldValue)
    when 'attached_files' then new NodeFilesField(fieldName, fieldValue)
    when 'links' then new NodeLinksField(fieldName, fieldValue)
    else  new NodeJsonField(fieldName, fieldValue)
 
root.nodeFieldFactory = nodeFieldFactory
