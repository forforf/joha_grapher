root = exports ? this

#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
forfLib = require 'forf'
#getKeys = forfLib.getKeys
idTrackerLib = require 'IdTrackerSingleton'
idTracker = idTrackerLib.IdBinder
johaFields = require 'JohaNodeFields'
nodeFieldFactory = johaFields.nodeFieldFactory

class JohaNodeEditor
  ni = 'not implemented'
  constructor: (@nodeData, options) ->
    #ToDo: Accept custom fields for id and label, etc
    @nodeData.id = @makeGUID() if not @nodeData.id?
    @nodeData.label = "node:" + @nodeData.id if not @nodeData.label

  buildDom: ->
    return ni #idTracker

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
