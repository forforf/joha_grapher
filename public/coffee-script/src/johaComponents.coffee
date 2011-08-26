root = exports ? this
$ = $ || window.$ || window.$j 

#For extending options
deepExtend = (object, extenders...) ->
  return {} if not object?
  for other in extenders
    for own key, val of other
      if not object[key]? or typeof val isnt "object"
        object[key] = val
      else
        object[key] = deepExtend object[key], val

  object
extend = deepExtend

#HTML Helpers
createTags = (tagText, attrs) ->
  tags = {}
  tags.open = '<' + tagText + ' ' + attrs + '>'
  tags.close = '</' + tagText + '>'
  tags

wrapHtml = (tagName, wrapText, attrs) ->
  attrs = attrs || ''
  wrapText = wrapText or= ''
  tags = createTags(tagName, attrs)
  html = tags.open + wrapText + tags.close

class DataEntryFormBase
  #ToDo: See if initial dom obj can be refactored out
  #It is only used in the callback functions
  constructor: (parentObj, onClickCallback, options) ->
    defaultUpdateFn = (e) ->
        console.log "DataEntryFormBase updateFn not overwritten"
        onClickCallback(parentObj, null)
        
    defaultOptions = 
      formLabel: "Enter Data"
      updateFn: defaultUpdateFn

    options = extend(defaultOptions, options)
    formHtml = wrapHtml('form')
    formLabel = wrapHtml('span', options.formLabel)
    buttonHtml = wrapHtml('button', 'Update', "type='submit'")
    hideButtonHtml = wrapHtml('button', 'Hide', "type='button'")
    formDom = $(formHtml)
    formLabelDom = $(formLabel)
    buttonDom = $(buttonHtml)
    hideButtonDom = $(hideButtonHtml)
    formDom.append formLabelDom
    formDom.append buttonDom
    formDom.append hideButtonDom
    @formDom = formDom
    buttonDom.click (e) =>
      e.preventDefault()
      options.updateFn()
    hideButtonDom.click (e) =>
      formDom.hide()
    
  get: ->
    @formDom
        
class ArrayDataEntryForm extends DataEntryFormBase
  constructor: (arrayObj, onClickCallback) ->
    myUpdateFn = (e) ->
      dataEntered =  inputDom.val()
      onClickCallback(arrayObj, dataEntered)
      
    options =
      formLabel: 'New Value for Array Item:'
      updateFn: myUpdateFn
    super(arrayObj, onClickCallback, options)
    inputHtml = wrapHtml('input', '', "type='text' name='array_item'")
    inputDom =$(inputHtml)
    buttonHtml = "<button type='submit'>Update</button>"
    @formDom.append inputDom
    
#requires jQuery and leverages JQueryUI
class ObjectDataEntryForm extends DataEntryFormBase
  constructor: (objCont, onClickCallback) ->
    myUpdateFn = (e) ->
      dataEntered = {}
      dataEntered["key"] = keyInputDom.val()
      dataEntered["val"] = valInputDom.val()
      onClickCallback(objCont, dataEntered)
    options =
      formLabel: 'New Key-Value for Object Item:'
      updateFn: myUpdateFn
    super(objCont, onClickCallback, options)
    keyLabel = wrapHtml('span', 'Key:')
    valLabel = wrapHtml('span', 'Value:')
    keyInputHtml = wrapHtml('input', '', "type='text' name='key_item'")
    valInputHtml = wrapHtml('input', '', "type='text' name='val_item'")
    keyLabelDom = $(keyLabel)
    valLabelDom = $(valLabel)
    keyInputDom = $(keyInputHtml)
    valInputDom = $(valInputHtml)
    @formDom.append keyLabelDom
    @formDom.append keyInputDom
    @formDom.append valLabelDom
    @formDom.append valInputDom
    
class LinksDataEntryForm extends DataEntryFormBase
  constructor: (linkCont, onClickCallback) ->
    myUpdateFn = (e) ->
      dataEntered = {}
      dataEntered["url"] = urlInputDom.val()
      dataEntered["label"] = labelInputDom.val()
      onClickCallback(linkCont, dataEntered)
    options = 
      formLabel: 'Add New Link:'
      updateFn: myUpdateFn
    super(linkCont, onClickCallback, options)
    urlLabel = wrapHtml('span', 'Url:')
    labelLabel = wrapHtml('span', 'Label:')
    urlInputHtml = wrapHtml('input', '', "type='text' name='url_item'")
    labelInputHtml = wrapHtml('input', '', "type='text' name='label_item'")
    urlLabelDom = $(urlLabel)
    labelLabelDom = $(labelLabel)
    urlInputDom = $(urlInputHtml)
    labelInputDom = $(labelInputHtml)
    @formDom.append urlLabelDom
    @formDom.append urlInputDom
    @formDom.append labelLabelDom
    @formDom.append labelInputDom
    
iframeUploader = (name) ->
  iframeHtml = wrapHtml('iframe')
  iframeDom = $(iframeHtml)
  iframeDom.attr 'id', name
  iframeDom.attr 'name', name
  iframeDom.attr 'src', ''
  iframeDom.hide()
  iframeDom

fileAttachmentButtons = ->
  controls = wrapHtml('div')
  uploadAttach = wrapHtml('button', 'Upload to Node')
  controlsDom = $(controls)
  uploadAttachDom = $(uploadAttach)
  #uploadAttachDom.attr 'name', 'uploadFiles'
  #uploadAttachDom.attr 'value', 'Upload to Node'
  #uploadAttachDom.attr 'type', 'button'
  controlsDom.append uploadAttachDom
  controlsDom

fileAttachmentForm = (iframeName, formId, @callbackFn) ->  
  container = wrapHtml('div')
  labelWrapper = wrapHtml('div')
  fileChooser = wrapHtml('input')
  fileChooserUI = wrapHtml('button', 'Add Files')
  fileChooserCont = wrapHtml('div')
  containerDom = $(container)
  labelWrapperDom = $(labelWrapper)
  fileChooserDom = $(fileChooser)
  fileChooserUIDom = $(fileChooserUI)
  fileChooserContDom = $(fileChooserCont)
  #Some javascript styling
  #To overcome browser differences in file selection
  fileChContStyle =
    position: 'relative'
  fileChUIStyle =
    position: 'absolute'
    top: '0px'
    left: '0px'
    'z-index': '1'
  fileChStyle =
    position: 'relative'
    'text-align': 'right'
    '-moz-opacity': '0'
    filter: 'alpha(opacity: 0)'
    opacity: '0'
    'z-index': '2'
  
  fileChooserDom.attr 'id', 'joha-file-chooser'  
  fileChooserDom.attr 'name', 'add_files[]'
  fileChooserDom.attr 'type', 'file'
  fileChooserDom.attr 'multiple', 'multiple'
  fileChooserDom.css fileChStyle
  fileChooserDom.addClass 'new-files' 
  fileChooserUIDom.css fileChUIStyle
  fileChooserContDom.css fileChContStyle
  fileChooserContDom.append fileChooserDom
  fileChooserContDom.append fileChooserUIDom
  containerDom.append fileChooserContDom

  #ToDo: Maybe send raw filename with path back to callback?  
  #ToDo:IMPORTANT: THIS ONLY WORKS WITH HTML5
  #everything else should work with ~HTML4, need to find pre-5 workaround
  fileChooserDom.change =>
    #can't use fileChooserDom.val() since that doesn't work with mulitple files
    fileList = fileChooserDom.get(0).files
    #fileList contains previously selected files
    filenames = for fileItem in fileList
      #ToDo: Create progress bar component
      filename = fileItem.fileName
      #IMPORTANT - Don't delete these as they *almost* work with pre-5 HTML
      #          - the problem was getting multiple file selections
      #filename = escape fileChooserDom.val()
      #parts = filename.split(/\%5C/)
      #filename = parts.join('/')
      #filename = unescape(filename)
      #parts = filename.split('/')
      #basename = parts.pop()
      filename

    @callbackFn(fileList)
    fileChooserDom.val("")

  containerDom
  
  controlsDom = fileAttachmentButtons()
  containerDom.append controlsDom
  iframeDom = iframeUploader(iframeName)
  containerDom.append iframeDom
  containerDom
  
class AttachmentForm
  constructor:(formId, uploadUrl, iframeTarget, newFilesCallbackFn, uploadFn)->
    formHtml = wrapHtml('form')
    formDom = $(formHtml)
    formDom.attr 'id', formId
    formDom.attr 'action', uploadUrl
    formDom.attr 'method', 'post'
    formDom.attr 'enctype', 'multipart/form-data'
    formDom.attr 'target', iframeTarget
    #ToDo: Fix the tight coupling (using .new-files)
    formDom.submit (e) =>
      #This works for HTML5
      #ToDo: Check/develop fix for older browsers
      uploadFn(formDom)
      false #don't submit for HTML5 since we use xhr
 
    #formDom.hide()
    #hidden input field for node id
    nodeIdHtml = wrapHtml('input')
    @nodeIdDom = $(nodeIdHtml)
    @nodeIdDom.attr 'id', 'joha-attachment-node-id'
    @nodeIdDom.attr 'name', 'node_id'
    @nodeIdDom.attr 'type', 'hidden'
    @nodeIdDom.attr 'value', ' '
    formDom.append @nodeIdDom
    fileAttachmentFormDom = fileAttachmentForm(iframeTarget, formId, newFilesCallbackFn)
    formDom.append fileAttachmentFormDom
    @formDom = formDom
 
  get: =>
    @formDom
    
  updateNodeId: (nodeId) =>
    @nodeIdDom.attr 'value', nodeId
    
  
	
class UiControlBase
  constructor: (@options) ->
    @targetId = options.targetId || ""
    @tag = options.tag || "span"
    @text = options.text || ""
    @uiClasses = options.uiClasses || ""
    noopFn = -> alert "No Function Defined"
    @clickFn = options.clickFn || noopFn
    htmlBase = wrapHtml(@tag, @text)
    dom = $(htmlBase)
    dom.addClass @uiClasses
    timeOutFn = (editedDom) ->
      editedDom.removeClass 'selected'
    dom.click =>
      editedDom = $('#'+@targetId)
      editedDom.addClass 'selected'
      window.setTimeout( (-> timeOutFn(editedDom) ), 1500 )
      @clickFn(@targetId)
    @dom = dom

  get: ->
    @dom

#Is this still in use?    
editBtnBase = (id) ->
  tag = 'span'
  open = '<' + tag + '>'
  close = '</' + tag + '>'
  altText = 'edit'
  editBtnDom = $(open + altText + close)
  editBtnDom.attr("id", id) if id
  #uses jQueryUI sprites
  editBtnDom.addClass('edit-btn ui-icon ui-icon-pencil')
  editBtnDom

class AddButtonBase extends UiControlBase  
  constructor: (editArgs) ->
    targetId = editArgs.targetId
    onClickFn = editArgs.addFn
    uiClasses = 'add-btn ui-icon ui-icon-plus'
    options = {
               targetId: targetId,
               text: "add",
               uiClasses: uiClasses,
               clickFn: onClickFn
              }
    super options
  
class EditButtonBase extends UiControlBase
  constructor: (editArgs) ->
    targetId = editArgs.targetId
    onClickFn = editArgs.editFn
    uiClasses = 'edit-btn ui-icon ui-icon-pencil'
    options = {
               targetId: targetId,
               text: "edit",
               uiClasses: uiClasses,
               clickFn: onClickFn
              }
    super options
    

class DeleteButtonBase extends UiControlBase
  constructor: (delArgs) ->
    targetId = delArgs.targetId
    onClickFn = delArgs.delFn
    uiClasses = 'delete-btn ui-icon ui-icon-close'
    options = {
                targetId: targetId,
                text: "del", 
                uiClasses: uiClasses, 
                clickFn: onClickFn
              }

    super options
   
#class AddNewButtonBase extends UIControlBase
#  constructor: (addArgs) ->
    

root.AddButtonBase = AddButtonBase
root.EditButtonBase = EditButtonBase  
root.DeleteButtonBase = DeleteButtonBase
root.ArrayDataEntryForm = ArrayDataEntryForm
root.ObjectDataEntryForm = ObjectDataEntryForm
root.LinksDataEntryForm = LinksDataEntryForm

root.AttachmentForm = AttachmentForm
root.wrapHtml = wrapHtml
