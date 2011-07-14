root = exports ? this

#put in a common coffeescript library?
#code from http://forrst.com/posts/Deep_Extend_an_Object_in_CoffeeScript-DWu

deepExtend = (object, extenders...) ->
  return {} if not object?
  for other in extenders
    for own key, val of other
      if not object[key]? or typeof val isnt "object"
        object[key] = val
      else
        object[key] = deepExtend object[key], val

  object


#Singleton code from here: https://gist.github.com/979402
class Singleton
  # We can make private variables!
  instance = null    

  # Static singleton retriever/loader
  @get: ->
    if not @instance?
      instance = new @
      instance.init()
    
    instance

  # Example class method for debugging
  init: (name = "unknown") ->
    console.log "#{name} initialized"
    

#This approach requires two labels to be defined at instantiation
#An alternate
class Binder extends Singleton
  
  constructor:  ->
  binderData = {}
  #[initA, initB] = [{},{}]
  
  #dataA: initA
  #dataB: initB

  #addA: (aKey, aVal) -> 
  #  @dataA[aKey] = aVal
  #addB: (bKey, bVal) -> 
  #  @dataB[bKey] = bVal
  add: (bindKey, label, val) ->
    addData = {}
    addData[label] = val
    bindData = binderData[bindKey]||{}
    binderData[bindKey] = deepExtend(bindData, addData)

  getBindings: (commonKey) ->
    #result = {}
    #newResult = binderData
    #a = @dataA[keyData]
    #b = @dataB[keyData]
    #result[@labelA] = a
    #result[@labelB] = b
    #result['new'] = binderData
    binderData[commonKey]

  getLabels: (commonKey) ->
    binderObj = binderData[commonKey]
    labels = (labels for labels of binderObj)

#test
#x = new Binder('aa', 'bb')
#console.log('test', x.getLabels())

  
 
root.Binder = Binder
#test = new Binder("LabelA", "LabelB")

#test.addA("AB", "a")
#test.addB("AB", "b")

#newTest = new Binder
#console.log test.getBindings("AB")
#console.log newTest.getBindings("AB")
#console.log test.dataA
#console.log test.dataB
#console.log test.getBindings("AB")
