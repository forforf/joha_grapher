#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
root = exports ? this

#Libraries
#Libraries are in stitch/coffeescripts
IdBinder = require('IdTrackerSingleton').IdBinder
getType = require('forf').getType
extend = require('forf').extend


valueContainerFactory = (value) ->

  containerFromSimpleType = {
    '[object Null]':  BasicValueContainer #(value, 'basic')
    '[object String]':BasicValueContainer #(value, 'basic')
    '[object Number]': BasicValueContainer #(value, 'basic')
    '[object Boolean]': BasicValueContainer #(value, 'basic')
    '[object Array]': ArrayValueContainer #(value, 'array')
    '[object Object]': ObjectValueContainer #(value, 'object')
    }
  
  containerFromValue = (value) ->
    type = getType(value)
    containerClass = containerFromSimpleType[type]
    objContainer = new containerClass(value)
    return objContainer #if objContainer

  container = containerFromValue(value)
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
  constructor: (@value) ->
    @containerType = 'basic-vc'
    super @value

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
    contClass = @containerType
    div.addClass contClass
    div.append edit
    
class ArrayValueContainer extends ValueContainerBase
  constructor: (@value) ->
    @containerType = 'array-vc'
    #we know @value is an array
    @children = for val in @value
      valueContainerFactory(val)
    super @value

  view: =>
    av = $('<div>Arrays</div>')
    av.addClass @containerType
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
    @containerType = 'keyvalue-vc'
    #keyContainer should always be basic type (string)
    @keyContainer = valueContainerFactory(@key)
    @valContainer = valueContainerFactory(@val)

  view: =>
    kv = $('<div>Key-Value</div>')
    kv.addClass @containerType
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
    return kvVal
        
class ObjectValueContainer extends ValueContainerBase
  constructor: (@objValue) ->
    @containerType = 'object-vc'
    #we know @objValue is an object
    @kvChildren = for own key, val of @objValue
      kv = {}
      kv[key] = val
      new KeyValue(key, val)
    super @objValue

  view: =>
    obj = $('<div>Object</div>')
    obj.addClass @containerType
    #running for side effect
    for kvChild in @kvChildren
      obj.append(kvChild.view())
      null
    obj
 

  currentValue: =>
    _curVal = {}
    cv = for kvChild in @kvChildren
      extend _curVal, kvChild.currentValue()

    return _curVal
    
 # #has ability to add new (currently just basic values though?)
 
class RootValueContainer
  constructor: (@value, options) ->
    options or= {}
    @containerType = 'root-vc'
    #ToDo: Use extend to set overwrite default options
    console.log 'root value:', @value
    @valueContainer = valueContainerFactory(@value)
    @origValue = @valueContainer.origValue

  view: ->
    @valueContainer.view()

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

