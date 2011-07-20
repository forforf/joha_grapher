root = exports ? this
#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
RootValueContainer = require('dynJsonContainers').RootValueContainer

class NodeField
  ni = 'Not Implemented'
  constructor: (@fieldName, @fieldValue) ->

class NodeJsonField extends NodeField
  constructor: (@fieldName, @fieldValue) ->
    @className = 'NodeJsonField'
    @jsonContainer = new RootValueContainer @fieldValue

class NodeIdField extends NodeField

class NodeLabelField extends NodeField

class NodeFilesField extends NodeField

class NodeLinksField extends NodeField

nodeFieldFactory = (fieldName, fieldValue) ->
  switch fieldName
    when 'id' then new NodeIdField(fieldName, fieldValue)
    when 'label' then new NodeLabelField(fieldName, fieldValue)
    when 'attached_files' then new NodeFilesField(fieldName, fieldValue)
    when 'links' then new NodeLinksField(fieldName, fieldValue)
    else  new NodeJsonField(fieldName, fieldValue)
 
root.nodeFieldFactory = nodeFieldFactory
