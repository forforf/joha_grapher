root = exports ? this

#makeGUID = ->
#    guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) ->
#      `var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);`
#      return v.toString(16)
#    )
#    return guid

class NodeFileAttachments

class NodeLinks

class JohaNodeEditor
  ni = 'not implemented'
  constructor: (@nodeData) ->
    @nodeData.id = @makeGUID() if not @nodeData.id?
    @nodeData.label = "node:" + @nodeData.id if not @nodeData.label

  buildDom: ->
    return ni

  clearNodeEdits: ->
    return ni

  currentNodeData: ->
    return @nodeData

  currentNodeId: ->
    return @nodeData.id

  deleteNodeData: ->
    return ni

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
