root = exports ? this

#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
IdBinder = require('IdTrackerSingleton').IdBinder
IdTracker = IdBinder #TODO: Pick a name and stick with it
nodeFieldFactory = require('JohaNodeFields').nodeFieldFactory
extend = require('extend').extend
forfLib = require('forf')
arrayRemoveSet = forfLib.arrayRemoveSet
arrayRemoveItem = forfLib.arrayRemoveItem
arrayContains = forfLib.arrayContains
getKeys = forfLib.getKeys

#jQueryContext = require('onDomReady').$jjq

class JohaNodeEditor
  ni = 'not implemented'
  constructor: (@nodeData, options) ->
    #set prefix for IdTracker
    IdTracker.get(prefix: 'joha-node-edit-')
    @id = 'id'
    @label = 'label'
    @links = 'links'
    @files = 'attached_files'
    
    #ToDo: Accept custom fields for id and label, etc
    options = extend( {}, options)

    requiredUserFields = options['requiredFields'] || []
    #determine required fields (note id and label are removed if 
    #included in the required fields, since they will be created if
    #they don't exist
    @requiredFields = arrayRemoveSet( requiredUserFields, [@id, @label] )
    #adds the fields to the nodeData object
    for field in @requiredFields
      @nodeData[field] = null
      null

    @availFields =  options['availableFields'] || []
    
    @nodeData.id = @makeGUID() if not @nodeData[@id]
    @nodeData.label = "node:" + @nodeData[@id] if not @nodeData[@label]
    @nodeFields = @buildNodeFields()

  buildFieldDropDown: =>
    $('<div>Dropdown Goes Here</div>')

  buildDom: =>
    #idTracker is a singleton that gives us the
    #next sequential id.
    idTracker = IdTracker.get()
    johaFields = @nodeFields
    #assign Root Dom Id (see function)
    nodeDom = $('<div />')
    fieldNames = getKeys @nodeData

    idDom = johaFields[@id].view()
    labelDom = johaFields[@label].view()
    linksDom = johaFields[@links].view() if arrayContains(fieldNames, @links) 
    filesDom = johaFields[@files].view() if arrayContains(fieldNames, @files)
    remainingFieldNames = arrayRemoveSet(fieldNames, [@id, @label, @links, @files])
    dropDown = @buildFieldDropDown()
    #building the node Dom
    nodeDom.append idDom
    nodeDom.append labelDom
    nodeDom.append dropDown
    #required fields
    for reqField in @requiredFields
      nodeDom.append johaFields[reqField].view()
      arrayRemoveItem(remainingFieldNames, reqField)
      null
    #remaining fields
    for remField in remainingFieldNames
      nodeDom.append johaFields[remField].view()
      null
    #links and files
    nodeDom.append linksDom
    nodeDom.append filesDom
    nodeDom
    
    #for testing
    curValLabel = 'Current Value:'
    curValCalc = JSON.stringify @currentValue()
    curValLabelHtml = '<span>' + curValLabel + '</span>'
    curValCalcHtml = '<span>' + curValCalc +  '</span>'
    curValLabelDom = $(curValLabelHtml)
    curValCalcDom = $(curValCalcHtml)
    curValDom = $('<div />')
    curValDom.append curValLabelDom
    curValDom.append curValCalcDom
    nodeDom.append curValDom
    testFn = (event) =>
      console.log "JNE Testing nodeDom Change"
      console.log 'this', @
      newDomValue = JSON.stringify @currentValue()
      curValCalcDom.text(newDomValue)

    nodeDom.bind("joha-recalculate", testFn)
    nodeDom


  clearNodeEdits: ->
    return ni

  currentNodeData: ->
    return @nodeData

  currentNodeId: ->
    return @nodeData.id

  currentValue: =>
    curThis = this
    curVal = {}
    console.log 'before @nodeFields'
    fields = @nodeFields
    console.log 'JNE cv1', @, this, curThis
    for own fieldName, fieldObj of fields
      curVal[fieldName] = fieldObj.currentValue()
      null
    console.log 'JNE cV2', this, curThis, curVal
    curVal

  deleteNodeData: ->
    return ni

  buildNodeFields: ->
     _objContainer = {}
     for own fieldName, fieldValue of @nodeData
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
