describe 'JohaNodeFields', ->
  nodeFieldLib = require 'JohaNodeFields'
  nodeFieldFactory = nodeFieldLib.nodeFieldFactory

  describe 'Importing', ->
    it 'should exist', ->
      expect( nodeFieldFactory ).toBeDefined()

  describe 'nodeFactory', ->
    it 'creates NodeJsonField', ->
      fieldName = 'anything other than required labels'
      complexObjValue = {a: ['aa', 'ab'], b: { ba: ['baa', 'bab'], bb: {bba: 'bbc'}}}
      fieldObj = nodeFieldFactory(fieldName, complexObjValue)
      expect( fieldObj.className ).toEqual 'NodeJsonField'

  describe 'NodeJsonField', ->
    beforeEach ->
      complexFieldName = 'complex'
      @complexObjValue = {a: ['aa', 'ab'], b: { ba: ['baa', 'bab'], bb: {bba: 'bbc'}}}
      @complexJsonFieldObj = nodeFieldFactory(complexFieldName, @complexObjValue)

    describe 'creates a container for the value', ->
      it 'is a NodeJsonField object', ->
        expect( @complexJsonFieldObj.className ).toEqual 'NodeJsonField'

      it 'has the data value represented', ->
        expect( @complexJsonFieldObj.fieldValue ).toEqual @complexObjValue

      it 'correctly sets the original value', ->
        jsonFieldObj = @complexJsonFieldObj
        #jsonContainer = @complexJsonFieldObj.jsonContainer
        #expect(jsonContainer.origValue).toEqual @complexObjValue            
        expect(jsonFieldObj.origValue).toEqual @complexObjValue
        
      it 'calculates the current value from the dom correctly', ->
        jsonFieldObj = @complexJsonFieldObj
        #jsonContainer = jsonFieldObj.jsonContainer
        #expect( jsonContainer.currentValue() ).toEqual @complexObjValue
        expect( jsonFieldObj.currentValue() ).toEqual @complexObjValue

      it 'generates the correct dom', ->
        baseHtml = '''
<span>data container</span><div>Object<div>Key-Value<div>Key<div id="106-div">a<input type'text'="" id="106" value="a"></div></div><div>Val<div>Arrays<div id="107-div">aa<input type'text'="" id="107" value="aa"></div><div id="108-div">ab<input type'text'="" id="108" value="ab"></div></div></div></div><div>Key-Value<div>Key<div id="110-div">b<input type'text'="" id="110" value="b"></div></div><div>Val<div>Object<div>Key-Value<div>Key<div id="111-div">ba<input type'text'="" id="111" value="ba"></div></div><div>Val<div>Arrays<div id="112-div">baa<input type'text'="" id="112" value="baa"></div><div id="113-div">bab<input type'text'="" id="113" value="bab"></div></div></div></div><div>Key-Value<div>Key<div id="115-div">bb<input type'text'="" id="115" value="bb"></div></div><div>Val<div>Object<div>Key-Value<div>Key<div id="116-div">bba<input type'text'="" id="116" value="bba"></div></div><div>Val<div id="117-div">bbc<input type'text'="" id="117" value="bbc"></div></div></div></div></div></div></div></div></div></div>
        '''   
        #since id's may vary, make id values generic
        idRegex = new RegExp(/id="\d+/g)
        expectedHtml = baseHtml.replace(idRegex, "id=\"#")     

        jsonFieldObj = @complexJsonFieldObj
        viewHtml = jsonFieldObj.view().html().replace(idRegex, "id=\"#")
        expect( viewHtml ).toEqual expectedHtml

