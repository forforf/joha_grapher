root = exports ? this

#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
forfLib = require 'forf'
#getKeys = forfLib.getKeys
idTrackerLib = require 'IdTrackerSingleton'
idTracker = idTrackerLib.IdBinder


class NodeFileAttachments

class NodeLinks

class NodeField
  constructor: (@fieldName, @fieldValue) ->

class NodeJsonField extends NodeField
    
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

class JohaNodeEditor
  ni = 'not implemented'
  constructor: (@nodeData, options) ->
    #ToDo: Accept custom fields for id and label, etc
    @nodeData.id = @makeGUID() if not @nodeData.id?
    @nodeData.label = "node:" + @nodeData.id if not @nodeData.label

  buildDom: ->
    return idTracker

  clearNodeEdits: ->
    return ni

  currentNodeData: ->
    return @nodeData

  currentNodeId: ->
    return @nodeData.id

  deleteNodeData: ->
    return ni

  nodeFields: -> 
     _dummy = {}
     for fieldName, fieldValue of @nodeData
       _dummy[fieldName] = nodeFieldFactory(fieldName, fieldValue)
     _dummy
     

  makeGUID: ->
    guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) ->
      `var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);`
      return v.toString(16)
    )
    return guid

  rootDomId: ->
    return ni

  saveNodeData: ->
    return ni

root.JohaNodeEditor = JohaNodeEditor
