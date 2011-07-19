###
#--- Singleton for Keeping Track of Value Container Entities ---
#
# http://stackoverflow.com/questions/4214731/coffeescript-global-variables
root = exports ? this 
# The publicly accessible Singleton fetcher
class root.IdBinder
  _instance = undefined # Must be declared here to force the closure on the class
  @get: (args) -> # Must be a static method
    _instance ?= new _SingletonBinder args

# The actual Singleton class
class _SingletonBinder
  constructor: (@args) ->
    @ids = {}
    @nextId = 0
    @idPrefix = 'johaIdBinder-'

  assignId: (boundToThis) ->
    boundId = @idPrefix + @nextId 
    @nextId++
    @ids[boundId] = boundToThis
    boundId

  getBoundById: (id) ->
     @ids[id]


  echo: ->
    @args
#---------------------------------------------------------------
###

#Libraries
#coffeescript ibraries are found in stitch/coffeescripts
root = exports ? this

IdBinder = require('IdTrackerSingleton').IdBinder


valueContainerFactory = (value) ->
    basicTypes = ['string', 'number', 'boolean', 'undefined', 'null']
    complexTypes = ['array', 'object']

    valType = typeof value
    console.log 'Factory', value, valType
    for basicType in basicTypes
      if valType is basicType
        return new BasicValueContainer(value, 'basic')
    if valType is 'object' and value instanceof Array
      return new ArrayValueContainer(value, 'array')
    if valType is 'object' #any other conditions
      return new ObjectValueContainer(value, 'object')
    return 'valType: ' + valType + 'is unknown'
      

class ValueContainerBase
  constructor: (@value, @containerType) ->
    #@currentValue() is the public API
    #@curValue is used for calculating the correct @currentValue
    @curValue = @value
    @origValue = @value
    idBinder = IdBinder.get()
    @domId = idBinder.assignId(@)

  jsonType: ->
    typeof @value
      
class BasicValueContainer extends ValueContainerBase
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
  constructor: (@value, @containerType) ->
    #we know @value is an array
    @children = for val in @value
      valueContainerFactory(val)
    super @value

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
    kvVal
        
class ObjectValueContainer extends ValueContainerBase
  constructor: (@objValue, @containerType) ->
    #we know @value is an object
    @kvChildren = for own key, val of @objValue
      kv = {}
      kv[key] = val
      new KeyValue(key, val)
    super @objValue

  view: =>
    obj = $('<div>Object</div>')
    for kvChild in @kvChildren
      obj.append(kvChild.view())
      null
    obj  

  currentValue: =>
    cv = for kvChild in @kvChildren
      kvChild.currentValue()
      
 # #has ability to add new (currently just basic values though?)
 
class RootValueContainer
  constructor: (@value, options) ->
    options or= {}
    #ToDo: Use extend to set overwrite default options
    @injectInto = options['injectInto'] || 'data' 
    console.log 'root value:', @value
    @valueContainer = valueContainerFactory(@value)
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

