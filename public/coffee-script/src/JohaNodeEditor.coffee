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
johaComps = require('johaComponents')
DeleteButtonBase = johaComps.DeleteButtonBase
wrapHtml = johaComps.wrapHtml

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
      availDropDownFields: {}
      standardDropDownFields: 
        New: 'new_value'
      #availableFields:  ["test", "foo", "bar"]

    options = extend( defaultOptions, options)
    console.log 'JNE Options', options

    requiredUserFields = options['requiredFields'] || []#|| [@files]
    #determine required fields (note id and label are removed if 
    #included in the required fields, since they will be created if
    #they don't exist
    @requiredFields = arrayRemoveSet( requiredUserFields, [@id, @label] )
    #adds the fields to the nodeData object
    for field in @requiredFields
      @nodeData[field] = null
      null
    allAvailFields =  extend(options['availDropDownFields'], options['standardDropDownFields'])
    
    reservedFields = ['id','label']
    existingFields = getKeys(@nodeData)
    @availFields = {}
    for own field, value of allAvailFields
      if arrayContains(reservedFields, field)
        continue
      if arrayContains(existingFields, field)
        continue
      @availFields[field] = value
      null #ran for side effect of setting @availFields
      
    #map values (used in drop down) to corresponding function
    #ToDo: Refactor so that node factory uses data type rather than field names
    #Should be something like this
    #@newFieldTypes = (dataType) ->
    #  switch dataType
    #    when static_value  
    #  basic_value: null
    #  array_value: null
    #  key_list_value: null
    #  file_list: null
    #  link_list: null
    #  new_value: null
    
    #instead doing this in the interim
    @initialFieldValuesForFieldFactory = (dataType) ->
      switch dataType
        when "static_value" then alert('Need something to set initial static value')
        #ok for numeric?
        when "basic_value" then "new basic value"
        when "array_value" then ['new item 1']
        when "key_list_value" then {"new key": "new value"}
        when "file_list" then null
        when "link_list" then {"new URL": "new Label"}
        when "new_value"
          alert("dialog will go here")
          "new new value"
          
    @nodeData.id = @makeGUID() if not @nodeData[@id]
    @nodeId = @nodeData.id
    @nodeData.label = "node:" + @nodeData[@id] if not @nodeData[@label]
    @nodeFields = @buildNodeFields(@nodeId)
    @nodeFields

  buildFieldDropDown: =>
    selectId = 'add-new-field-select'
    mainForm = $('<div />')
    mainForm.text('Add New Field')
    select = $('<select />')
    select.attr('id', selectId)
    select.attr('name', 'addField')
    dropDownLabels = getKeys(@availFields)
    console.log "building dropdown", @availFields, dropDownLabels
    blankOption = wrapHtml('option', "", "value=''")
    #for some reason Chrome won't let me select first option
    #this is a hack for that
    select.append blankOption 
    select.append
    for own field, johaType of @availFields
      attr = "value=\"#{johaType}\""
      selectOption = wrapHtml('option', field, attr)
      #selectOption.text(availField)
      select.append selectOption
    mainForm.append select
      
    select.change =>
      newFieldValueType = select.val()
      newFieldName = $(':selected').text()
      newFieldsDom = $('#'+@newFieldsId)
      initValue = @initialFieldValuesForFieldFactory(newFieldValueType)
      @nodeFields[newFieldName] = nodeFieldFactory(newFieldName, initValue, @nodeId)
      newFieldDom = @nodeFields[newFieldName].view()
      newFieldDom.addClass johaEditClass["create"]
      delBtnArgs =
        targetId: newFieldDom.attr('id')
        delFn: @delFn
      delBtnObj = new DeleteButtonBase(delBtnArgs)
      delBtnDom = delBtnObj.get()
      newFieldDom.append delBtnDom
      newFieldsDom.append newFieldDom
    mainForm
      
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
      #put the delete button just after the label
      #ToDo: See if placement can be uncoupled from lower layer html/class definitions
      label = fieldDom.find('.joha-label')
      label.append delBtnDom
      #fieldDom.prepend delBtnDom
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
    
    ##for testing
    #curValLabel = 'Current Value:'
    #curValCalc = JSON.stringify @currentValue()
    #curValLabelHtml = '<span>' + curValLabel + '</span>'
    #curValCalcHtml = '<span>' + curValCalc +  '</span>'
    #curValLabelDom = $(curValLabelHtml)
    #curValCalcDom = $(curValCalcHtml)
    #curValDom = $('<div />')
    #curValDom.append curValLabelDom
    #curValDom.append curValCalcDom
    #nodeDom.append curValDom
    #testFn = (event) =>
    #  console.log "JNE Testing nodeDom Change"
    #  console.log 'this', @
    #  newDomValue = JSON.stringify @currentValue()
    #  curValCalcDom.text(newDomValue)
    #
    #nodeDom.bind("joha-recalculate", testFn)
    #nodeDom


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

  origValue: =>
    fields = @nodeFields
    origVal = {}
    for own fieldName, fieldObj of fields
      origVal[fieldName] = fieldObj.origValue
    origVal
    
  deleteNodeData: ->
    return ni

  buildNodeFields: (nodeId) ->
     _objContainer = {}
     for own fieldName, fieldValue of @nodeData
       _objContainer[fieldName] = nodeFieldFactory(fieldName, fieldValue, nodeId)
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
