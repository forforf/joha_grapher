(function() {
  var dynJson, root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  dynJson = require('dynJsonContainers');
  root.RootValueContainer = dynJson.RootValueContainer;
  console.log('onDomReady parsed');
  $(function() {
    var calcBtnDom, calcBtnHtml, x;
    console.log('Doc Ready');
    console.log(root);
    x = new RootValueContainer({
      akv: [
        'a', {
          x: 'X'
        }, ['aa', 'bb']
      ]
    });
    console.log(x.valueContainer);
    console.log(x.origValue);
    x.view();
    calcBtnHtml = "<button type='button'>Current Value</button>";
    calcBtnDom = $(calcBtnHtml);
    calcBtnDom.click(function() {
      var cv;
      cv = x.currentValue();
      console.log(cv);
      return alert(JSON.stringify(cv));
    });
    return $('body').append(calcBtnDom);
  });
  /*  
    domId = 'johaIdBinder-0'
    idBinder = root.IdBinder.get()
    valCont = idBinder.getBoundById(domId)
    valCont.modify('b')
    #x.valueContainer.modify('b')
    console.log 'Orig', x.valueContainer.origValue
    console.log 'Cur', x.valueContainer.curValue
    console.log 'Current', x.valueContainer.currentValue()
    x.view()*/
}).call(this);
