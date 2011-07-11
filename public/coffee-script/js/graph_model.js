(function() {
  var GraphModel, test, x;
  GraphModel = (function() {
    var getTreeData, updateGraph;
    function GraphModel(tree_url, adj_url) {
      this.tree_url = tree_url;
      this.adj_url = adj_url;
    }
    getTreeData = function(topNode) {
      var callback;
      callback = function(response) {
        return updateGraph(response);
      };
      return $j.get(this.tree_url, {
        topNode: topNode
      }, callback, 'json');
    };
    updateGraph = function(graph_data) {
      return console.log(graph_data);
    };
    return GraphModel;
  })();
  test = new GraphModel('/some_json', '/nothing_here_yet');
  x = test.getTreeData('c');
  console.log(x);
}).call(this);
