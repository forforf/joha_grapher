#Requires the rgraph library to be loaded first
root = exports ? this
$jit = $jit || window.$jit
$ = $ || window.$ || $j || window $j

forfExtend = require('extend').extend

#warning: onCreateLabel requires the global variable
#johaGraph which holds the main graph and data routing function
  
johaGraphDefaults = () ->
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
        if node is false
          show_create_node_form()
        null
          
  
    onBeforeCompute:(node) ->
      Log.write("centering " + node.name + "...")
      null
          
    onAfterCompute: ->
      Log.write("done")
      null
   
    onCreateLabel:(domElement, node) =>
      #johaGraph.myGraph is the global variable that will hold the rGraph
      domElement.innerHTML = node.name
      domElement.onclick = () ->
        johaGraph.myGraph.onClick(node.id)
        johaGraph.routeClickedNodeDataToElements(node)
      null
       
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
      null
      
   return johaRGraphDefaults     
   
   
makeJohaRGraph = (Log) ->
  Log = log
  thisGraph = new $jit.RGraph( johaGraphDefaults() )
  
  
root.makeJohaRGraph = makeJohaRGraph

