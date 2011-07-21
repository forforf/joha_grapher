root = exports ? this

#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
IdBinder = require('IdTrackerSingleton').IdBinder
IdTracker = IdBinder #TODO: Pick a name and stick with it
nodeFieldFactory = require('JohaNodeFields').nodeFieldFactory
#extend = require('extend').extend
#jQueryContext = require('onDomReady').$jjq

class JohaNodeEditor
  ni = 'not implemented'
  constructor: (@nodeData, options) ->
    #ToDo: Accept custom fields for id and label, etc
    @nodeData.id = @makeGUID() if not @nodeData.id?
    @nodeData.label = "node:" + @nodeData.id if not @nodeData.label

  buildDom: ->
    #making sure idTracker is singleton, remove when not needed
    #if it maintains singleton across anonymous functions
    #great!, else pass it on to them explicitly
    idTracker = IdTracker.get('johaNode')
    idTracker.assignId('dummy')
    

  clearNodeEdits: ->
    return ni

  currentNodeData: ->
    return @nodeData

  currentNodeId: ->
    return @nodeData.id

  deleteNodeData: ->
    return ni

  nodeFields: ->
     _objContainer = {}
     for fieldName, fieldValue of @nodeData
       _objContainer[fieldName] = nodeFieldFactory(fieldName, fieldValue)
     _objContainer
     

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

  view: ->
    @buildDom()

root.JohaNodeEditor = JohaNodeEditor
