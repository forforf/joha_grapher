#$j.ajax '/some_json',
#    type: 'GET'  #or POST
#    dataType: 'json', #or 'html'
#    error: (xhr, status, error) ->
#        console.error(xhr, status, error)
#    success: (data, status, xhr) ->
#        console.log(data)

root = exports ? this

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
    


class Binder extends Singleton
  
  constructor: (@labelA, @labelB) ->
  [initA, initB] = [{},{}]
  
  dataA: initA
  dataB: initB

  addA: (aKey, aVal) -> 
    @dataA[aKey] = aVal
  addB: (bKey, bVal) -> 
    @dataB[bKey] = bVal

  getBindings: (keyData) ->
    result = {}
    a = @dataA[keyData]
    b = @dataB[keyData]
    result[@labelA] = a
    result[@labelB] = b
    result

  getLabels: ->
    [@labelA, @labelB]


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
