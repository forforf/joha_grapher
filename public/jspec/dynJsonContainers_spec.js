(function() {
  var RootValueContainer;
  RootValueContainer = require('dynJsonContainers').RootValueContainer;
  describe('dynJsonContainers RootValueContainer', function() {
    return describe('complex data set 1', function() {
      beforeEach(function() {
        var data1Html;
        this.data1 = {
          akv: [
            'a', {
              x: 'X'
            }, ['aa', 'bb']
          ]
        };
        data1Html = 'Object<div>Key-Value<div>Key<div id="126-div">akv<input type\'text\'="" id="126" value="akv"></div></div><div>Val<div>Arrays<div id="127-div">a<input type\'text\'="" id="127" value="a"></div><div>Object<div>Key-Value<div>Key<div id="128-div">x<input type\'text\'="" id="128" value="x"></div></div><div>Val<div id="129-div">X<input type\'text\'="" id="129" value="X"></div></div></div></div><div>Arrays<div id="131-div">aa<input type\'text\'="" id="131" value="aa"></div><div id="132-div">bb<input type\'text\'="" id="132" value="bb"></div></div></div></div></div>';
        this.idRegex = new RegExp(/id="\d+/g);
        return this.expectedHtml = data1Html.replace(this.idRegex, "id=\"#");
      });
      it('should record the initial data correctly', function() {
        var cont;
        cont = new RootValueContainer(this.data1);
        return expect(cont.origValue).toEqual(this.data1);
      });
      it('should calculate the current data from the dom correctly', function() {
        var cont;
        cont = new RootValueContainer(this.data1);
        return expect(cont.currentValue()).toEqual(this.data1);
      });
      return it('should build a dom for {akv: [\'a\', {x: \'X\'}, [\'aa\', \'bb\']]} ', function() {
        var cont, contjQ, valueContainers, _root;
        cont = new RootValueContainer(this.data1);
        _root = $('<div />');
        contjQ = _root.append(cont.view());
        valueContainers = contjQ.find('.basic-vc');
        expect(valueContainers.length).toEqual(6);
        return expect(valueContainers.text()).toEqual('akvaxXaabb');
      });
    });
  });
}).call(this);
