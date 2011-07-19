(function() {
  var JohaNodeEditor, root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  JohaNodeEditor = require('JohaNodeEditor').JohaNodeEditor;
  root.$jjq = $;
  $(function() {
    var newNode, nodeData;
    console.log('JohaNode Doc Ready');
    nodeData = {
      akv: [
        'a', {
          x: 'X'
        }, ['aa', 'bb']
      ]
    };
    newNode = new JohaNodeEditor(nodeData);
    return console.log('NewNode:', newNode.view());
  });
  /*
  #Working with dynJsonContainers
  dynJson = require 'dynJsonContainers'
  root.RootValueContainer = dynJson.RootValueContainer
  root.$j = $
  
  #JNE = require 'JohaNodeEditor'
  
  $ ->
    console.log($)
    #JohaNodeEditor = JNE.JohaNodeEditor
    console.log('Doc Ready')
    x = new RootValueContainer {akv: ['a', {x: 'X'}, ['aa', 'bb']]}
    console.log x.valueContainer
    console.log x.origValue
    x.view()
    calcBtnHtml = "<button type='button'>Current Value</button>"
    calcBtnDom = $(calcBtnHtml)
    calcBtnDom.click ->
      cv = x.currentValue()
      console.log cv
      alert JSON.stringify(cv)
    $('body').append(calcBtnDom)*/
}).call(this);
