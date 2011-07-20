RootValueContainer = require('dynJsonContainers').RootValueContainer

describe 'dynJsonContainers RootValueContainer', ->

  describe 'complex data set 1', ->

    beforeEach ->
      @data1 = {akv: ['a', {x: 'X'}, ['aa', 'bb']]}
      #@data2 = {a: ['aa', 'ab'], b: { ba: ['baa', 'bab'], bb: {bba: 'bbc'}}}
      #@data3 = {a: 'AA', b: 'BB'}
      data1Html = '''
<span>data container</span><div>Object<div>Key-Value<div>Key<div id="126-div">akv<input type'text'="" id="126" value="akv"></div></div><div>Val<div>Arrays<div id="127-div">a<input type'text'="" id="127" value="a"></div><div>Object<div>Key-Value<div>Key<div id="128-div">x<input type'text'="" id="128" value="x"></div></div><div>Val<div id="129-div">X<input type'text'="" id="129" value="X"></div></div></div></div><div>Arrays<div id="131-div">aa<input type'text'="" id="131" value="aa"></div><div id="132-div">bb<input type'text'="" id="132" value="bb"></div></div></div></div></div></div>
      '''
      #since id's may vary, make id values generic
      @idRegex = new RegExp(/id="\d+/g)
      @expectedHtml = data1Html.replace(@idRegex, "id=\"#")

    it 'should record the initial data correctly', ->
      cont = new RootValueContainer(@data1)
      expect(cont.origValue).toEqual @data1

    it 'should calculate the current data from the dom correctly', ->
      cont = new RootValueContainer(@data1)
      expect( cont.currentValue() ).toEqual @data1

    it 'should build a dom', ->
      #requires jasmine-jquery
      cont = new RootValueContainer(@data1)
      console.log cont.view()
      viewHtml = cont.view().html().replace(@idRegex, "id=\"#")
      expect( viewHtml ).toEqual @expectedHtml

