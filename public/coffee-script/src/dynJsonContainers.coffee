#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
root = exports ? this

#Libraries
#Libraries are in stitch/coffeescripts
IdBinder = require('IdTrackerSingleton').IdBinder
getType = require('forf').getType
extend = require('forf').extend


valueContainerFactory = (value) ->
  console.log 'starting valueContainerFactory'

  containerFromSimpleType = {
    '[object Null]':  BasicValueContainer #(value, 'basic')
    '[object String]':BasicValueContainer #(value, 'basic')
    '[object Number]': BasicValueContainer #(value, 'basic')
    '[object Boolean]': BasicValueContainer #(value, 'basic')
    '[object Array]': ArrayValueContainer #(value, 'array')
    '[object Object]': ObjectValueContainer #(value, 'object')
    }
  
  containerFromValue = (value) ->
    console.log 'entered containerFromValue'
    type = getType(value)
    containerClass = containerFromSimpleType[type]
    objContainer = new containerClass(value)
    return objContainer #if objContainer
    #special cases
    #ToDo: Determine how to best handle HTML types, eg.
    #'[object HTMLDocument'], '[object HTMLDivElement]'
    #'[object HTMLScriptElement]', etc
    #ToDo: How to handle unexecuted functions?
    #'[object Function]'  (can't execute with parameters
    #and if execution was desired then it could have been executed
    #as the initial value i.e. valueContainerFactory( fn() )

  container = containerFromValue(value)
  console.log 'Container Factory, container: ', container   
  return container   

class ValueContainerBase
  constructor: (@value) ->
    #@currentValue() is the public API
    #@curValue is used for calculating the correct @currentValue
    @curValue = @value
    @origValue = @value
    idBinder = IdBinder.get()
    @domId = idBinder.assignId(@)

  jsonType: ->
    typeof @value
      
class BasicValueContainer extends ValueContainerBase
  @containerType = 'basic'
  modify: (newVal) =>
    @curValue = newVal

  currentValue: =>
    @curValue

  view: =>
    divHtml = "<div id='" + @domId + "-div'>" + @curValue + "</div>"
    editHtml = "<input type'text' id='" + @domId + "' value='" + @curValue + "'/>"
    edit = $(editHtml)
    edit.change =>
      console.log 'CCB', @curValue
      newVal = $('#' + @domId).val()
      @modify(newVal)
      console.log 'CCB', @curValue
      
    div = $(divHtml)
    div.append edit
    
class ArrayValueContainer extends ValueContainerBase
  constructor: (@value) ->
    #we know @value is an array
    @children = for val in @value
      valueContainerFactory(val)
    super @value

  @containerType = 'array'

  view: =>
    av = $('<div>Arrays</div>')
    for child in @children
      av.append(child.view())
      null
    av

  currentValue: =>
    cv = for child in @children
      child.currentValue()
    
 #has ability to add new (currently just basic values though?)

class KeyValue extends ValueContainerBase
  constructor: (@key, @val) ->
    #keyContainer should always be basic type (string)
    @keyContainer = valueContainerFactory(@key)
    @valContainer = valueContainerFactory(@val)
    console.log 'KV', @val, @valContainer, @valContainer.view()


  view: =>
    kv = $('<div>Key-Value</div>')
    k = $('<div>Key</div>')
    kv.append(k)
    k.append(@keyContainer.view())
    v = $('<div>Val</div>')
    kv.append(v)
    v.append(@valContainer.view())
    kv

  currentValue: =>
    kvVal = {}
    kvVal[@keyContainer.currentValue()] = @valContainer.currentValue()
    console.log('KVContainer CurVal: ', kvVal)
    kvVal
        
class ObjectValueContainer extends ValueContainerBase
  constructor: (@objValue) ->
    #we know @objValue is an object
    
    @kvChildren = for own key, val of @objValue
      kv = {}
      kv[key] = val
      new KeyValue(key, val)
    super @objValue

  @containerType = 'object'

  view: =>
    obj = $('<div>Object</div>')
    #running for side effect
    for kvChild in @kvChildren
      obj.append(kvChild.view())
      null
    obj
 

  currentValue: =>
    console.log('KVChildren: ', @kvChildren)
    _curVal = {}
    cv = for kvChild in @kvChildren
      console.log('EachKVChild :', kvChild.currentValue(), JSON.stringify(kvChild.currentValue()))
      extend _curVal, kvChild.currentValue()
      
    console.log 'ObjectContainer CurVal: ', _curVal
    #cv
    _curVal
    
 # #has ability to add new (currently just basic values though?)
 
class RootValueContainer
  constructor: (@value, options) ->
    options or= {}
    #ToDo: Use extend to set overwrite default options
    @injectInto = options['injectInto'] || 'data' 
    console.log 'root value:', @value
    @valueContainer = valueContainerFactory(@value)
    console.log 'RV got container: ', @valueContainer
    @origValue = @valueContainer.origValue

  view: ->
    labelHtml = "<span>" + 'data container' + "</span>"
    viewDom = $('<div />').append($(labelHtml))
    console.log(@valueContainer.view())
    domInjectInto = $('#' + @injectInto)
    domInjectInto.append(viewDom)
    viewDom.append(@valueContainer.view())

  currentValue: =>
    @valueContainer.currentValue()

root.RootValueContainer = RootValueContainer
###
$ ->
  console.log('Doc Ready')
  x = new RootValueContainer {akv: ['a', {x: 'X'}, ['aa', 'bb']]} 
  #x = new RootValueContainer 'a'
  
console.log x.valueContainer  
  console.log x.origValue
  x.view()
  calcBtnHtml = "<button type='button'>Current Value</button>"
  calcBtnDom = $(calcBtnHtml)
  calcBtnDom.click ->
    cv = x.currentValue()
    console.log cv
    alert JSON.stringify(cv)
  $('body').append(calcBtnDom)
###  

