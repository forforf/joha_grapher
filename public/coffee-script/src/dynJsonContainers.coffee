#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
root = exports ? this
$ = $ || window.$ || window.$j

# ### Overview

# dynJsonContainers convets a JSON object into an editiable
# (jQuery) representation of that object in a browser
#
#     jsonVal = {akv: ['a', {x: 'X'}, ['aa', 'bb']]}
#     jsonObj = new RootValueContainer jsonVal
#     jsonDom = jsonObj.view()
#     $('body').append jsonDom
#
# Containers Types
#   BasicValueContainer -- Wrapper for string, boolean, number, and null
#   ArrayValueContainer -- Wrapper for arrays, contents can be any container type
#   ObjectValueContaier -- Wrapper for Objects, keys are strings (BasicValueContainer), values are any container type
#
# Referencing Containers and their contents by class property
#   BasicValueContainer class = 'basic-vc'
#   ArrayValueContainer class = 'array-vc'
#     Array contents can be of any type
#   ObjectValueContainer class = ' object-vc'
#     KeyValue pair Container class = 'keyvalue-vc'
#     Key Container class = 'basic-vc' (specifically a string)
#     Value contents can be of any type
#

#  Note to self - bundle external dependencies to make
#  an external, self-contained library


#Libraries
#Libraries are in stitch/coffeescripts
IdBinder = require('IdTrackerSingleton').IdBinder
forf = require('forf')
arrayContains = forf.arrayContains
arrayRemoveItem = forf.arrayRemoveItem
getType = forf.getType
extend = forf.extend
johaComp = require('johaComponents')
wrapHtml = johaComp.wrapHtml
AddButtonBase = johaComp.AddButtonBase
EditButtonBase = johaComp.EditButtonBase
DeleteButtonBase = johaComp.DeleteButtonBase
ArrayDataEntryForm = johaComp.ArrayDataEntryForm
ObjectDataEntryForm = johaComp.ObjectDataEntryForm
LinksDataEntryForm = johaComp.LinksDataEntryForm
AttachmentForm = johaComp.AttachmentForm
softParseJSON = require('jsonHelper').softParseJSON


#Constants
johaEditClass = {
                 "update": "joha-update"
                 "delete": "joha-delete"
                 "create": "joha-create"
                }
johaChangeTrigger = "joha-recalculate"

root.johaEditClass = johaEditClass


#Makes containers based on JSON values
valueContainerFactory = (value) ->

  containerFromSimpleType = {
    '[object Null]':  BasicValueContainer
    '[object String]':BasicValueContainer
    '[object Number]': BasicValueContainer
    '[object Boolean]': BasicValueContainer
    '[object Array]': ArrayValueContainer
    '[object Object]': ObjectValueContainer
    }
  
  containerFromValue = (value) ->
    type = getType(value)
    containerClass = containerFromSimpleType[type]
    objContainer = new containerClass(value)
    return objContainer #if objContainer

  container = containerFromValue(value)
  return container

#The base container that most other containers
#can inherit from
class ContainerBase
  constructor: (@value) ->
    idBinder = IdBinder.get()
    #assigns ID and this object can be referenced by
    #idBinder.getBoundById - or anywhere by IdBinder.get().getBoundById(domId)
    #ToDo: Evaluate code to see if this can be leveraged
    #I don't think its being used.
    @domId = idBinder.assignId(this)
    @curValue = @value
    @origValue = @value
    @selDomId = '#' + @domId
    @recalcTrigger = root.johaChangeTrigger
    @updateClass = root.johaEditClass["update"]
    @deleteClass = root.johaEditClass["delete"]
    @createClass = root.johaEditClass["create"]
    @commonMethods =
      setValId: (domId) ->
        domId + '-val'

      setEditValId: (domId) ->
        domId + '-edit'

      makeDelBtn: (domId, triggerName, deleteClass) ->
        delFn = (domId) =>
          targetDom = $('#'+domId)
          targetDom.toggleClass deleteClass
          targetDom.trigger(triggerName)
        args =
          targetId: domId
          delFn: delFn
        delBtnObj = new DeleteButtonBase(args)
        delBtn = delBtnObj.get()

class ValueContainerBase extends ContainerBase
  constructor: (@value) ->
    super(@value)
    #@currentValue() is the public API
    #@curValue is used for calculating the correct @currentValue
    #more specifically:
    # @currentValue reflects the result when user edits are applied 
    # @curVal reflects the current internal value ignoring user edits
    #@currentValue shows what the resut would look like when 'saved'
    #@curVal doesn't change until edits are 'saved'
    #@recalcTrigger = root.johaChangeTrigger
    valContBaseMethods =
      updateEditBoxVal: (contDom) ->
        domId = contDom.attr("id")
        valId = domId + '-val'
        editValId = domId + '-edit'
        editBoxValDom = $('#'+editValId)
        valDom = $('#'+valId)
        newVal = editBoxValDom.val()
        valDom.text(newVal)
        newVal

      updateContAfterEdit: (domId) =>
        contDom = $('#'+domId)
        @curValue = @updateEditBoxVal(contDom)
	
	
        #parses as a JSON string, but returns
        #original object if its not a valid JSON string
        #ToDo: What if we don't want to evaluate JSON?
        jsonVal = softParseJSON @curValue
        #Side Effect that updates the container's edit class
        if jsonVal is @origValue
          contDom.removeClass @updateClass
        else
          contDom.addClass @updateClass
        return @curValue  #return value not currently used

      basicView: (curValue, domId, valId, contClass) ->
        inTag = 'span'
        inVal = curValue #|| "--empty--" 
        inHtml = wrapHtml(inTag, inVal)
        #Outer Div Wrapper
        outerTag = 'div'
        outerHtml = wrapHtml(outerTag)
        div = $(outerHtml)
        div.attr("id", domId)
        valDom = $( inHtml )
        valDom.attr("id", valId)
        div.append valDom
        div.addClass contClass
        {div: div, val: valDom}

      editView: (curValue, editValId, contType) ->
        editTag = 'input'
        editType = "type='text'"
        editHtml = wrapHtml(editTag,'',editType)
        edit = $(editHtml)
        attrs = { id:editValId, value:curValue }
        edit.attr(attrs)
        #hide the editing element initially
        edit.hide()
        edit

      editControl: (elDom, editDom, elClass) ->
        elDom.addClass(elClass)
        elDom.click =>
          editDom.toggle()
          editDom.focus() if elDom.is ":visible"

      onTrigger: (triggerName, listener, eventFn) ->
        listener.bind(triggerName, eventFn)

      editChange: (editDom, domListener, triggerName) ->
        domListener.trigger(triggerName)
        editDom.hide()
    
    @commonMethods = extend(@commonMethods, valContBaseMethods)
    
  jsonType: ->
    typeof @value


  #ToDo: Remove this?
  makeDelArgs: =>
    #Default
    targetId = @domId
    delFn = (targetId) =>
      alert 'No container specific delete fn created'
      #targetDom = $('#'+targetId)
      #targetDom.toggleClass @deleteClass
      #targetDom.change()
    args = {
           targetID: targetId
           delFn: delFn
           }

class BasicValueContainerNoOp extends ValueContainerBase
  contructor: (@value) ->
    super(@value)
    alert "No Op Value Container Not Implemented Yet"

class BasicValueContainerNoMod extends ValueContainerBase
  constructor: (@value) ->
    super(@value)
    @valId = @commonMethods["setValId"](@domId)
    @delBtn = @commonMethods["makeDelBtn"](@domId,@recalcTrigger,@deleteClass)

  currentValue: =>
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      softParseJSON(@curValue)  
    retVal  

  view: ->
    elDoms = @commonMethods["basicView"](@curValue,@domId,
                                         @valId, @containerType)
    div = elDoms["div"]
    valDom = elDoms["val"]
    div.append @delBtn
    
    #let external entities trigger updates
    recalcFn = (event) =>
     #This class doesn't modify its values
     null
   
    @commonMethods["onTrigger"](@recalcTrigger, div, recalcFn)
    #return dom 
    return div
    
    
class BasicValueContainerNoDel extends ValueContainerBase
  constructor: (@value) ->
    super(@value)
    @valId = @commonMethods["setValId"](@domId)
    @editValId = @commonMethods["setEditValId"](@domId)

  currentValue: =>
    softParseJSON(@curValue)

  updateEditBoxVal: (contDom) ->
    @commonMethods["updateEditBoxVal"](contDom)

  updateContAfterEdit: (domId) =>
    @commonMethods["updateContAfterEdit"](domId)

  view: ->
    elDoms = @commonMethods["basicView"](@curValue,@domId,
                                         @valId,@containerType)
    div = elDoms["div"]
    valDom = elDoms["val"]
    edit = @commonMethods["editView"](@curValue, @editValId)
    div.append edit
    
    #controls
    @commonMethods["editControl"](valDom, edit, 'clickable-label')
    edit.change =>
      @commonMethods["editChange"](edit, div, @recalcTrigger)
    #ToDo: Move recalc Function to common methods?
    recalcFn = (event) =>
      @updateContAfterEdit( event.target.id )
    @commonMethods["onTrigger"](@recalcTrigger, div, recalcFn)
    return div

#Fully functional container (ToDo: Rename to make it clear)
class BasicValueContainer extends ValueContainerBase
  constructor: (@value) ->
    @containerType = 'basic-vc'
    super @value
    @valId = @commonMethods["setValId"](@domId)
    @editValId = @commonMethods["setEditValId"](@domId) 
    @delBtn = @commonMethods["makeDelBtn"](@domId, 
                                              @recalcTrigger,@deleteClass)
    
  currentValue: =>
    #IMPORTANT
    #the currentValue function should return values
    #that reflect the current state of user editing
    #HOWEVER
    #@curVal matches the current dom Values,
    #and returns items marked for deletion
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      softParseJSON(@curValue)  #IMPORTANT: Note that @curValue does not reflect user editing
    retVal

  updateEditBoxVal: (contDom) =>
    @commonMethods["updateEditBoxVal"](contDom)

  updateContAfterEdit: (domId) =>
    @commonMethods["updateContAfterEdit"](domId)

  view: ->
    elDoms = @commonMethods["basicView"](@curValue,@domId,
                                         @valId, @containerType)
    div = elDoms["div"]
    valDom = elDoms["val"]
    div.append @delBtn
    #edit field for value
    edit = @commonMethods["editView"](@curValue, @editValId)
    div.append edit
    

    #controls
    @commonMethods["editControl"](valDom, edit, 'clickable-label')
    edit.change =>
      @commonMethods["editChange"](edit, div, @recalcTrigger)

    #let external entities trigger updates
    recalcFn = (event) =>
      @updateContAfterEdit( event.target.id )
     
    @commonMethods["onTrigger"](@recalcTrigger, div, recalcFn)
    #return dom 
    return div
 
class ArrayValueContainer extends ContainerBase
  constructor: (@value) ->
    @containerType = 'array-vc'
    @itemClass = 'joha-array-item'
    @newFormClass = 'joha-array-add'
    #we know @value is an array
    @children = for val in @value
      valueContainerFactory(val)
    super @value
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)


  addNewItem = (me, newVal) =>
    newJsonVal = softParseJSON newVal
    newRVC = new RootValueContainer(newJsonVal)
    newChild = newRVC.valueContainer
    newChildDom = newChild.view()
    me.children.push newChild
    #Add new child to Dom
    thisDom = $(me.selDomId)
    #append to end of array items
    jItemClass = '.' + me.itemClass
    lastArrayItemDom = thisDom.find(jItemClass).last()
    if lastArrayItemDom.length > 0
      lastArrayItemDom.after( newChildDom )
    else
      thisDom.prepend( newChildDom )
    newChildDom.addClass me.itemClass
    newChildDom.addClass me.createClass
    newChildDom.trigger(me.recalcTrigger)

  view: =>
    tag = 'div'
    val = '' #value label
    avHtml = wrapHtml(tag, val)
    av = $(avHtml)
    av.attr("id", @domId)
    av.addClass @containerType
    for child in @children
      childDom = child.view()
      childDom.addClass @itemClass
      av.append childDom
      null
    #av = @appendDelBtn av
    av.append @delBtn

    addNew = new ArrayDataEntryForm(this, addNewItem)
    addNewForm = addNew.get()
    formId = @domId + '-addform'
    addNewForm.addClass @newFormClass
    addNewForm.attr('id', formId)
    addNewForm.hide()

    editFn = (targetId) =>
      formDom = $('#'+formId)
      formDom.toggle()
    
    editBtnArgs = {targetId: @domId , editFn: editFn}
    editBtn = new EditButtonBase(editBtnArgs)
    av.append editBtn.get()
    av.append addNewForm
    av

  currentValue: =>
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      cv = for child in @children
        child.currentValue()
    retVal

class KeyValueBase extends ContainerBase
  constructor: (@key, @val) ->
    super()
    kvBaseMethods = 
      basicView: (kvCont, keyCont, valCont) ->
        domId = kvCont.domId
        contType = kvCont.containerType
        kvLabel = kvCont.kvLabel 
        kLabel = kvCont.kLabel
        kClass = kvCont.kClass
        vLabel = kvCont.vLabel
        vClass = kvCont.vClass
        kvTag = 'div'
        kvHtml = wrapHtml( kvTag, kvLabel)
        kv = $(kvHtml)
        kTag = 'div'
        kHtml = wrapHtml( kTag, kLabel )
        k = $(kHtml)
        k.addClass kClass
        vTag = 'div'
        vHtml = wrapHtml(vTag, vLabel)
        v = $(vHtml)
        v.addClass vClass
        kv.attr("id", domId)
        kv.addClass(contType)
        kv.append k
        k.append keyCont.view()
        kv.append v
        v.append valCont.view()
        kv
      currentValue: (domId, kCont, vCont, deleteClass) ->
        retVal = if $('#'+domId).hasClass deleteClass
          null
        else
          kvVal = {}
          kvVal[kCont.currentValue()] = vCont.currentValue()
          kvVal
        retVal
    @commonMethods = extend(@commonMethods, kvBaseMethods)

class KeyValue extends KeyValueBase
  constructor: (@key, @val) ->
    super(@key, @val)
    @containerType = 'keyvalue-vc'
    #keyContainer should always be basic type (string)
    @keyContainer = valueContainerFactory(@key)
    @valContainer = valueContainerFactory(@val)
    @kvLabel = "" #Label for key-value wrapper
    @kLabel = ""
    @kClass = "keyvaluekey-vc"
    @vLabel = ""
    @vClass = "keyvaluevalue-vc"
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)

  view: =>
    kv = @commonMethods["basicView"](this, @keyContainer, @valContainer)
    kv.append @delBtn
    kv

  currentValue: =>
    @commonMethods["currentValue"](@domId, @keyContainer,
                                   @valContainer, @deleteClass)
class ObjectBase extends ContainerBase
  constructor: (@objValue) ->
    super @objValue
    objBaseMethods =
      basicObjView: (objCont) ->
        tag = 'div'
        label = objCont.objLabel
        objHtml = wrapHtml(tag, label)
        obj = $(objHtml)
        obj.attr("id", objCont.domId)
        obj.addClass objCont.containerType
        #running for side effect
        for child in objCont.kvChildren
          childDom = child.view()
          childDom.addClass objCont.itemClass
          obj.append childDom
          null
        obj

     @commonMethods = extend(@commonMethods, objBaseMethods)

class ObjectValueContainer extends ObjectBase
  constructor: (@objValue) ->
    @containerType = 'object-vc'
    @itemClass = 'joha-object-item'
    @newFormClass = 'joha-object-add'
    @objLabel = '' #label for object container
    #we know @objValue is an object
    @kvChildren = for own key, val of @objValue
      new KeyValue(key, val)
    super @objValue
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)


  addNewItem = (me, newObj) =>
    newKey = newObj["key"]
    newVal = newObj["val"]
    newKeyStr = String newKey
    newJsonVal = softParseJSON newVal
    newChild = new KeyValue(newKeyStr, newJsonVal)
    me.kvChildren.push newChild
    #Add new child to Dom
    thisDom = $(me.selDomId)
    #append to end of obj items
    jItemClass = '.' + me.itemClass
    lastObjItemDom = thisDom.find(jItemClass).last()
    lastObjItemDom.after( newChild.view() )
    newChildDom = $(newChild.selDomId)
    newChildDom.addClass me.createClass
    newChildDom.trigger(me.recalcTrigger)

  view: =>
    obj = @commonMethods["basicObjView"](this)
    obj.append @delBtn

    addNew = new ObjectDataEntryForm(this, addNewItem)
    addNewForm = addNew.get()
    formId = @domId + '-addform'
    addNewForm.addClass @newFormClass
    addNewForm.attr('id', formId)
    addNewForm.hide()

    editFn = (targetId) =>
      formDom = $('#'+formId)
      formDom.toggle()

    editBtnArgs = {targetId: @domId , editFn: editFn}
    editBtn = new EditButtonBase(editBtnArgs)

    obj.append editBtn.get()
    obj.append addNewForm
    obj

  currentValue: =>
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      _curVal = {}
      cv = for kvChild in @kvChildren
        extend _curVal, kvChild.currentValue()
      _curVal
    retVal

#ToDo:Provide option to force @value to be a certain type
#ToDo:Provide option that prevents adding/deleting, and one for read only (no edits allowed) 
class RootValueContainer
  constructor: (@value, options) ->
    options or= {}
    @containerType = 'root-vc'
    #ToDo: Use extend to set overwrite default options
    @valueContainer = valueContainerFactory(@value)
    @origValue = @valueContainer.origValue

  view: ->
    valCont = $('<div />')
    valCont.append @valueContainer.view()
    valCont.addClass @containerType
    valCont.addClass 'value-container'

  currentValue: =>
    @valueContainer.currentValue()

#ToDo: Add to specs
#Where to keep origValue?
#Should it be here or the parent container?

class FileValueContainer extends BasicValueContainerNoMod
  constructor: (@filename) ->
    @fileItemData = null
    super(@filename)

  equiv: (fvc) =>
    return false if fvc is undefined
    if this.filename is fvc.filename
      true
    else
      false

  setFileItem: (fileItem) =>
    @fileItemData = fileItem

  getFileItem: =>
    @fileItemData

  currentFileItem: =>
    retVal = if $(@selDomId).hasClass @deleteClass
      null
    else
      @fileItemData
    retVal

#ToDo:  ContainerBase has some unnecessary cruft for files
class FilesContainer extends ContainerBase
  constructor: (@files, nodeId) ->
    #ToDo: Organize this better
    #initialize container list variables
    @initFileContList = []  #list of existing files
    @newFileContList = []   #list of new files created
    #@deletedFileContList = []  #list of any files to be deleted
    super(@files)
    @fileClassName = 'joha-filename'
    for fname in @files
      fileCont = @makeFileCont(fname)
      @initFileContList.push fileCont
      null
    @filesList = []
    @filesListClass = 'joha-files'
    filesListHtml = wrapHtml('div')
    @filesListDom = $(filesListHtml)
    @filesListDom.addClass @filesListClass
    @containerType = 'files-vc value-container'
    #create id attr for the attachment form
    formId = @domId + 'attform'
    newFilesCallbackFn = (fileList) =>
      newestFileItemsToAdd = []
      for fileItem in fileList
        fileBasename = fileItem.fileName
        #ToDo: How to find dupes more efficiently/elegantly?
        existingConts = @validFileConts()
        #skipThis will be null if name doesn't exist
        skipThis = false
        for cont in existingConts
          existingName = cont.filename
          skipThis = true if fileBasename is existingName
        if skipThis
          alert "Skipping file: " + fileBasename + "\n It is already assigned."
          continue
        fileCont = @makeFileCont(fileBasename)
        fileCont.setFileItem(fileItem)
        newestFileItemsToAdd.push fileCont
        null
      
      @viewNewFileInsert newestFileItemsToAdd
      @newFileContList = @newFileContList.concat newestFileItemsToAdd
    
    uploadFn = (formDom) =>
      #formDom is AttachmentForm object
      uploadList = @uploadableFileContainers()
      uploadForm = new FormData()
      
      #I can't get formData to take generic objects, and
      #I can't get xhr to send data (probably because of multipart issues)
      #So the best solution would be to construct a
      #valid multipart message, however, I'm just going to 
      #add some semantic meaning to the formData keys to avoid that
      for uploadNewCont in uploadList.new
        fileItem = uploadNewCont.currentFileItem()
        formDataKey = 'NEW_FILE___' + fileItem.fileName
        uploadForm.append(formDataKey, fileItem)
        null
     
      for uploadDelCont in uploadList.deleted
        delFileName = uploadDelCont.origValue
        formDataKey = 'DEL_FILE___' + delFileName
        uploadForm.append(formDataKey, delFileName)
        null

      uploadForm.append('node_id', "FIXME!!")
   
      #HTML5 Only?
      self = this #maintain a reference to this context
      xhr = new XMLHttpRequest()
      xhr.open('POST', formDom.attr('action'), true)
      xhr.onload = (e) -> 
        resp = JSON.parse(this.responseText)
        self.updateViewAfterUpload(self, resp)
        self.updateContsAfterUpload(self, resp)
      xhr.send(uploadForm)

      #jQuery not working with Chrome for some reason, multipart issue?
      #$.ajax
      #  url: formDom.attr('action') #'/upload_files_test',
      #  type: formDom.attr('method') #'POST'
      #  data: uploadForm
      #  error: (jqXHR, textStatus, errorThrown) ->
      #    alert 'Ajax Error' + errorThrown
      #  success: (data, textStatus, jqXHR)->
      #    alert JSON.stringify data
      #    console.log 'Files Uploaded', data
      #    for uploadFileCont in uploadFileContList
      #      $(uploadFileCont.selDomId).removeClass @createClass
      uploadForm 
    
    #ToDo: Figure out iframe approach to supprt pre-HTML5
    form = new AttachmentForm(formId, '/upload_files_html5', 'iframe-uploader', newFilesCallbackFn, uploadFn)
    form.updateNodeId nodeId
    @formDom = form.get()
 
  findContByName: (basename, contList) =>
    contList or= @validFileConts()
    respCont = null
    for cont in contList
      respCont = cont if basename is cont.filename
      null
    respCont

  removeFileContFromList: (contList, remCont) =>
    console.log 'remove cont', contList, remCont
    for aCont in contList
      console.log 'remove cont iter', aCont, remCont
      if aCont.filename is remCont.filename
        console.log 'Before removing from contList', contList
        arrayRemoveItem(contList, aCont)
        console.log 'after remove', contList, aCont
    contList

  updateViewAfterUpload: (self, uploadResponse) ->
    idFinder = new IdBinder.get()
    #update files to be saved by server
    serverSaveFilesAccepted = uploadResponse["to_save"]
    newFileContDomList = self.filesListDom.find('.'+self.createClass) 
    #verification to update the view for server accepted files
    #Find all 'new' files in view
    newFileContDomList.each( (i) ->
      newFileDomId = $(this).attr("id")
      newFileCont = idFinder.getBoundById(newFileDomId)
      if arrayContains(serverSaveFilesAccepted, newFileCont.filename)
        $(this).removeClass self.createClass
      return null)
    
    #deleted files from server
    deletedFilesAccepted = uploadResponse["to_delete"]
    console.log 'deleted files', deletedFilesAccepted
    for delFilename in deletedFilesAccepted
      cont = self.findContByName(delFilename)
      #How to delete file container? Hide or Remove? (prob Remove is better
      $(cont.selDomId).remove()
      null
  
  updateContsAfterUpload: (self, uploadResponse) ->
    #files being saved
    serverSaveFilesAccepted = uploadResponse["to_save"]
    xfer = []
    for savingFilename in serverSaveFilesAccepted
      savingCont = self.findContByName(savingFilename, self.newFileContList)
      if savingCont
        xfer.push savingCont 
    #Add the xfer conts to existing conts
    self.initFileContList  = self.initFileContList.concat xfer

    idFinder = new IdBinder.get()
    newFileContDomList = self.filesListDom.find('.'+self.createClass)
    self.newFileContList = []
    newFileContDomList.each( (i) ->
      newFileDomId = $(this).attr("id")
      newFileCont = idFinder.getBoundById(newFileDomId)
      self.newFileContList.push newFileCont)
          

    #files being deleted
    #ToDo: For performance, it would probably be better to do this one before save files
    
    deletedFilesAccepted = uploadResponse["to_delete"]
    for existingFile in self.initFileContList
      continue if existingFile is undefined
      console.log 'Iter FileCont', existingFile
      if arrayContains(deletedFilesAccepted, existingFile.filename)
        idx = self.initFileContList.indexOf existingFile
        self.initFileContList.splice idx, 1
      null


  validFileConts: =>
    @initFileContList.concat @newFileContList

  view: =>
    dom = $('<div />')
    dom.addClass @containerType
    labelHtml = wrapHtml('span', 'File Attachments')
    labelDom = $(labelHtml)
    dom.append labelDom
    @viewInitFileInsert @initFileContList
    #for fileCont in @initFileContList
    #  @insertFileCont(fileCont, @filesListDom)
    #  null
 
    dom.addClass @containerType
    dom.append @filesListDom
    dom.append @formDom
    dom

  #TODO: DRY up with next method
  viewInitFileInsert: (initFileContList) =>
    for initFileCont in initFileContList
      fileDom = initFileCont.view()
      fileDom.addClass 'joha-file-item'
      @filesListDom.append fileDom

  viewNewFileInsert: (newFileContList) =>
    for newFileCont in newFileContList
      fileDom = newFileCont.view()
      fileDom.addClass 'joha-file-item'
      fileDom.addClass @createClass
      @filesListDom.append fileDom
      

  makeFileCont: (filename) =>
    fileCont = new FileValueContainer(filename)
    fileCont

  currentValue: =>
    _curVal = []
    cv = for fileCont in @validFileConts()
      itemVal = if $(fileCont.selDomId).hasClass @deleteClass
        null
      else
        fileCont.currentValue()
      _curVal.push itemVal
    _curVal

  uploadableFileContainers: =>
    uploadFileConts =
      new: []
      deleted: []

    newUploadList = []
    for fileCont in @newFileContList
      fileContDom = $(fileCont.selDomId)
      delSel = '.'+fileCont.deleteClass
      newUploadList.push fileCont if not (fileContDom.is delSel)
      null
    
    deletedUploadList = []
    
    for fileCont in @initFileContList
      fileContDom = $(fileCont.selDomId)
      delSel = '.'+fileCont.deleteClass
      deletedUploadList.push fileCont if (fileContDom.is delSel)
      null

    uploadFileConts.new = newUploadList
    uploadFileConts.deleted = deletedUploadList
    console.log 'uploadFileConts', uploadFileConts
    uploadFileConts
  

class LinksKeyValue extends KeyValueBase
  constructor: (@key, @val)->
    super(@key, @val)
    @containerType = 'linkskv-vc'
    @keyContainer = new BasicValueContainerNoDel(@key)
    @valContainer = new BasicValueContainerNoDel(@val)
    @kvLabel = "---"
    @kLabel = "Link URL"
    @vLabel = "Link Label"
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)
  
  view: =>
    linkskv = @commonMethods["basicView"](this, @keyContainer, @valContainer)
    linkskv.append @delBtn
 
  currentValue: =>
    @commonMethods["currentValue"](@domId, @keyContainer,
                                   @valContainer, @deleteClass)

#ToDo Add to specs
class LinksContainer extends ObjectBase
  constructor: (links, options) ->
    @objValue = links
    @containerType = 'links-edit-vc'
    @itemClass = 'joha-links-item'
    @objLabel = "Links"
    @showEditClass = 'joha-link-edit-active'
    @viewClass = 'joha-link-view'
    @editClass = 'joha-link-edit'
    @newFormClass = 'joha-link-add'
    @linksChildren = for own key, val of @objValue
      new LinksKeyValue(key, val)
    @kvChildren = @linksChildren #ToDo: refactor to single name
    super @objValue
    @delBtn = @commonMethods["makeDelBtn"](@domId,
                                           @recalcTrigger,@deleteClass)
  addNewItem = (me, newLink) =>
    newUrl = newLink["url"]
    newLabel = newLink["label"]
    newUrlStr = String newUrl
    newLabelStr = String newLabel
    newChild = new LinksKeyValue(newUrlStr, newLabelStr)
    me.kvChildren.push newChild
    #Add new child to Dom
    thisDom = $(me.selDomId)
    #append to end of obj items
    jItemClass = '.' + me.itemClass
    lastObjItemDom = thisDom.find(jItemClass).last()
    lastObjItemDom.after( newChild.view() )
    newChildDom = $(newChild.selDomId)
    newChildDom.addClass me.createClass
    newChildDom.trigger(me.recalcTrigger)

  view: =>
    linksDomClass = 'joha-links'
    linksDom = $('<div />')
    linksDom.addClass  linksDomClass
    linkEditDom = @commonMethods["basicObjView"](this)
    linkViewDom = @linksView @currentValue() 
    linkEditDom.addClass @editClass
    linkViewDom.addClass @viewClass
 
    if linksDom.hasClass @showEditClass
      linkEditDom.show()
      linkViewDom.hide()
    else
      linkEditDom.hide()
      linkViewDom.show()

    linksDom.append linkEditDom
    linksDom.append linkViewDom

    editFn = (targetId) =>
      targetDom = $('.'+linksDomClass)
      targetDom.toggleClass @showEditClass
      targetDom.trigger(johaChangeTrigger) 

    editBtnArgs = {targetId: @domId , editFn: editFn}
    editBtn = new EditButtonBase(editBtnArgs)
    linksDom.append editBtn.get()

    #This function is relying on a lot of 'this'
    #magic. Is there a better way?
    toggleViewOrEditFn = (event) =>
      newLinks =  @linksView @currentValue()
      linksDom.find('.'+@viewClass).replaceWith newLinks
      if linksDom.hasClass @showEditClass
        linksDom.find('.'+@viewClass).hide()
        linksDom.find('.'+@editClass).show()
      else
        linksDom.find('.'+@viewClass).show()
        linksDom.find('.'+@editClass).hide()  

    linksDom.bind(johaChangeTrigger, toggleViewOrEditFn)

  linkViewDom: (url, label) ->
    attrs = "href='" + url + "'"
    linkHtml = wrapHtml('a', label, attrs)
    linkDom = $(linkHtml)
    linkDom.addClass @itemClass
    linkDom

  linksView:  (links) ->
    linksViewOuterHtml = wrapHtml('div')
    linksViewOuterTitle = wrapHtml('span','Links')
    linksContainerHtml = wrapHtml('div')
    linksViewOuterDom = $(linksViewOuterHtml)
    linksViewOuterTitleDom = $(linksViewOuterTitle)
    linksContainerDom = $(linksContainerHtml)
    linksContainerDom.addClass 'links-vc'
    linksContainerDom.addClass 'value-container'
    linksViewOuterTitleDom.addClass 'link-label'
    linksViewOuterDom.append linksViewOuterTitleDom
    linksViewOuterDom.addClass @viewClass
    for own url, label of links
      linkViewDom = @linkViewDom(url, label)
      linksContainerDom.append linkViewDom
      null
    linksViewOuterDom.append linksContainerDom
    addNew = new LinksDataEntryForm(this, addNewItem)
    addNewForm = addNew.get()
    formId = @domId + '-addform'
    addNewForm.addClass @newFormClass
    addNewForm.attr('id', formId)
    addNewForm.hide()
    linksViewOuterDom.append addNewForm

    addFn = (targetId) =>
      formDom = $('#'+formId)
      console.log 'Add Form', formDom
      formDom.toggle()

    addBtnArgs = {targetId: @domId, addFn: addFn}
    addBtn = new AddButtonBase(addBtnArgs)
    linksViewOuterDom.append addBtn.get()

    linksViewOuterDom

  #Is this even called anymore?
  linkEditDom: (url, label) ->
    objHtml = wrapHtml('div')
    urlHtml = wrapHtml('span', url)
    labelHtml = wrapHtml('span', label)
    urlCont = new BasicValueContainer(url)
    labelCont = new BasicValueContainer(label)
    _kv = {}
    _kv[url] = label
    objDom = $(objHtml)
    objDom.addClass 
    urlDom = urlCont.view() 
    labelDom = labelCont.view() 
    objDom.append urlDom
    objDom.append labelDom
    

  linksEdit: (links) ->
    linksEditDom  = $('<div />')
    #linksEditDom.addClass 'link-edit'
    for own url, label of links
      linkEditDom = @linkEditDom(url, label)
      linksEditDom.append linkEditDom
      null
    linksEditDom


  _curVal: ->
    undefined

  currentValue: => 
    _curVal = {}
    cv = for kvChild in @kvChildren
      extend _curVal, kvChild.currentValue()
    _curVal

root.RootValueContainer = RootValueContainer
root.BasicValueContainerNoDel = BasicValueContainerNoDel
root.BasicValueContainerNoMod = BasicValueContainerNoMod
root.FilesContainer = FilesContainer
root.LinksContainer = LinksContainer
root.johaChangeTrigger = johaChangeTrigger

