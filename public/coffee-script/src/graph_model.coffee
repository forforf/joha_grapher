class GraphModel
  constructor: (@tree_url, @adj_url) ->
  
  #Model (joha_grapher.rb) topNode is from Session, this needs fixed to be overridable
  getTreeData = (topNode) ->
    callback = (response) -> updateGraph(response)
    $j.get @tree_url, {topNode}, callback, 'json'
  
   updateGraph = (graph_data) ->
      console.log(graph_data);
      #johaIndex(graph_data);
      #aGraph.loadJSON(graph_data);
  
      #aGraph.refresh();
      #johaGraph.myGraph = aGraph;
     

test = new GraphModel('/some_json', '/nothing_here_yet')
x = test.getTreeData('c')
console.log x
  