#Requires the rgraph library to be loaded first
root = exports ? this
$jit = $jit || window.$jit
$ = $ || window.$ || $j || window $j

forfExtend = require('extend').extend

johaGraphDefaults = (thisGraph) ->
  johaRGraphDefaults =
    #Where to append the visualization
    injectInto: 'infovis'
    levelDistance: 100
    width: 900,
    height: 700,
    #Optional: create a background canvas that plots
    #concentric circles.
    background:
      #default - doesn't change node placement
      numberOfCircles: 100
      #default - doesn't change node placement
      levelDistance: 100  
      CanvasStyles:
        strokeStyle: '#555'
  
    #Add navigation capabilities:
    #zooming by scrolling and panning.
    Navigation: 
      enable: true
      panning: true
      zooming: 10
  
    #Set Node and Edge styles.
    Node: 
      color: '#ddeeff'            
  
    Edge: 
      color: '#C17878'
      lineWidth:1.5
          
    Events:
      enable: true
      onClick: (node, eventInfo, e) =>
        #console.log node
        #alert 'node ' + node.name + ' clicked'
        if node is false
          show_create_node_form()
          
  
    onBeforeCompute:(node) ->
      alert 'onBeforeCompute'
      Log.write("centering " + node.name + "...")
          
    onAfterCompute: ->
      alert 'onAfterCompute'
      Log.write("done")
   
    onCreateLabel:(domElement, node) ->
      #console.log 'onCreateLabel', node.name, domElement
      domElement.innerHTML = node.name
      domElement.onclick = (me) ->
        #alert 'createdLabel had click'
        console.log 'This onCreateLabel click', this, me, me.onClick
        thisGraph.onClick(node.id)
        routeClickedNodeDataToElements(node)
       
    #Change some label dom properties.
    #This method is called each time a label is plotted.
    onPlaceLabel: (domElement, node) ->
      
      style = domElement.style
      style.display = ''
      style.cursor = 'pointer'
  
      if node._depth <= 1 
        style.fontSize = "0.8em"
        style.color = "#ccc"
      
      else if node._depth is 2
        style.fontSize = "0.7em"
        style.color = "#494949"
      
      else 
        style.display = 'none'
      
  
      left = parseInt(style.left)
      w = domElement.offsetWidth
      style.left = (left - w / 2) + 'px'
      
   return johaRGraphDefaults       
makeJohaRGraph = (Log) ->
  Log = log
  
  #a hack to be able to set an event
  #before the rgraph is defined. It must be overwritten in order to work
  thisGraph = 
    onClick: -> 
      #This event will be called, but its not the one we want
      #ToDo: Figure out how the event is bubbling so only desired events occur
      null
    
  myDefaults = johaGraphDefaults(thisGraph)
  #overwrite the previous hack
  thisGraph = new $jit.RGraph(myDefaults)
  
  
class JohaRGraph extends $jit.RGraph
  constructor: ->
    console.log 'making JohaGraph'
    super(johaRGraphDefaults)
  
root.JohaRGraph = JohaRGraph
root.makeJohaRGraph = makeJohaRGraph

