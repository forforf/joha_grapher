root = exports ? this
$ = $ || window.$ || window.$j

#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
IdBinder = require('IdTrackerSingleton').IdBinder
IdTracker = IdBinder #TODO: Pick a name and stick with it
johaNFs = require 'JohaNodeFields'
nodeFieldFactory = johaNFs.nodeFieldFactory
johaEditClass = johaNFs.johaEditClass
johaChangeTrigger = johaNFs.johaChangeTrigger
extend = require('extend').extend
forfLib = require('forf')
arrayRemoveSet = forfLib.arrayRemoveSet
arrayRemoveItem = forfLib.arrayRemoveItem
arrayContains = forfLib.arrayContains
getKeys = forfLib.getKeys
DeleteButtonBase = require('johaComponents').DeleteButtonBase

#jQueryContext = require('onDomReady').$jjq

class JohaNodeEditor
  ni = 'not implemented'
  constructor: (@nodeData, options) ->
    console.log 'JNE constructor Entered'
    #set prefix for IdTracker
    IdTracker.get(prefix: 'joha-node-edit-')
    @id = 'id'
    @label = 'label'
    @links = 'links'
    @files = 'attached_files'
    @mainNodeId = 'joha-edit-node-data'
    @newFieldsId = 'joha-new-fields'
    #ToDo: Accept custom fields for id and label, etc
    defaultOptions =
      availableFields:  ["test", "foo", "bar"]

    options = extend( defaultOptions, options)

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
    @nodeFields

  buildFieldDropDown: =>
    selectId = 'add-new-field-select'
    mainForm = $('<form />')
    mainForm.text('Add New Field')
    select = $('<select />')
    select.attr('id', selectId)
    select.attr('name', 'addField')
    for availField in @availFields
      selectOption = $('<option />')
      selectOption.text(availField)
      select.append selectOption
    mainForm.append select
    
    select.change =>
      newFieldName = select.val()
      newFieldsDom = $('#'+@newFieldsId)
      @nodeFields[newFieldName] = nodeFieldFactory(newFieldName, null)
      newFieldDom = @nodeFields[newFieldName].view()
      newFieldDom.addClass johaEditClass["create"]
      delBtnArgs =
        targetId: newFieldDom.attr('id')
        delFn: @delFn
      delBtnObj = new DeleteButtonBase(delBtnArgs)
      delBtnDom = delBtnObj.get()
      newFieldDom.append delBtnDom
      newFieldsDom.append newFieldDom
      
  #delete Function for delete Button
  delFn: (targetId) =>
    targetDom = $('#'+targetId)
    targetDom.toggleClass johaEditClass["delete"]
    targetDom.trigger johaChangeTrigger

      
  buildDom: =>
    #idTracker is a singleton that gives us the
    #next sequential id.
    idTracker = IdTracker.get()
    johaFields = @nodeFields
    #assign Root Dom Id (see function)
    nodeDom = $('<div />')
    nodeDom.attr('id', @mainNodeId)
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
      fieldDom = johaFields[remField].view()
      delBtnArgs =
        targetId: fieldDom.attr("id")
        delFn: @delFn
      delBtnObj = new DeleteButtonBase(delBtnArgs)
      delBtnDom = delBtnObj.get()
      fieldDom.prepend delBtnDom
      nodeDom.append fieldDom
      null
    #reserved for new entries
    newFieldDom = $('<div />')
    newFieldDom.text('New Fields')
    newFieldDom.attr('id', @newFieldsId)
    nodeDom.append newFieldDom
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
    fields = @nodeFields
    for own fieldName, fieldObj of fields
      objDomId = fieldObj.fieldDomId if fieldObj.fieldDomId || ""
      objDom = $('#'+objDomId)
      if objDom.hasClass johaEditClass["delete"]
        null #curVal[fieldName] = null
      else
        curVal[fieldName] = fieldObj.currentValue()
      null
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
