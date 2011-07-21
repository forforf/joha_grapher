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
      expect( fieldObj.className ).toEqual 'json-field'

    it 'creates NodeIdField', ->
      fieldName = 'id' #ToDo: Support custom id field names
      idValue = 'SomeID'
      fieldObj = nodeFieldFactory(fieldName, idValue)
      expect( fieldObj.className ).toEqual 'id-field'

     it 'creates NodeIdField', ->
      fieldName = 'label' #ToDo: Support custom label field names
      labelValue = 'My Label'
      fieldObj = nodeFieldFactory(fieldName, labelValue)
      expect( fieldObj.className ).toEqual 'label-field'

  describe 'NodeJsonField', ->
    beforeEach ->
      complexFieldName = 'complex'
      @complexObjValue = {a: ['aa', 'ab'], b: { ba: ['baa', 'bab'], bb: {bba: 'bbc'}}}
      @complexJsonFieldObj = nodeFieldFactory(complexFieldName, @complexObjValue)

    describe 'creates a container for the value', ->
      it 'is a NodeJsonField object', ->
        expect( @complexJsonFieldObj.className ).toEqual 'json-field'

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
        jsonFieldObj = @complexJsonFieldObj
        _root = $('<div />')
        objjQ = _root.append( jsonFieldObj.view() )
        valueContainers = objjQ.find '.basic-vc'
        expect(valueContainers.length).toEqual 10
        #this is a bit of a cheat and doesn't verify structure
        expect( valueContainers.text() ).toEqual 'aaaabbbabaababbbbbabbc'

  describe 'NodeIdField', ->
    beforeEach ->
      idFieldName = 'id'
      @idValue = 'SomeID'
      @idFieldObj = nodeFieldFactory(idFieldName, @idValue)

    describe 'creates a container for the value', ->
      it 'is a NodeIdField object', ->
        expect( @idFieldObj.className ).toEqual 'id-field'

      it 'has the id value set', ->
        expect( @idFieldObj.fieldValue ).toEqual @idValue
        expect( @idFieldObj.idFieldValue ).toEqual @idValue
        

      it 'correctly sets the original value', ->
        expect(@idFieldObj.origValue).toEqual @idValue
        
      it 'calculates the current value from the dom correctly', ->
        #expect( jsonContainer.currentValue() ).toEqual @complexObjValue
        expect( @idFieldObj.currentValue() ).toEqual @idValue

      it 'generates the correct dom', ->
        _root = $('<div />')
        objjQ = _root.append( @idFieldObj.view() )
        valueContainers = objjQ.find '.basic-vc'
        expect(valueContainers.length).toEqual 0
        expect( objjQ.text() ).toEqual 'idSomeID'

  describe 'NodeLabelField', ->
    beforeEach ->
      labelFieldName = 'label'
      @labelObjValue = 'My Label'
      @labelFieldObj = nodeFieldFactory(labelFieldName, @labelObjValue)

    describe 'creates a container for the value', ->
      it 'is a labelJsonField object', ->
        expect( @labelFieldObj.className ).toEqual 'label-field'

      it 'has the data value represented', ->
        expect( @labelFieldObj.fieldValue ).toEqual @labelObjValue

      it 'correctly sets the original value', ->
        expect(@labelFieldObj.origValue).toEqual @labelObjValue
        
      it 'calculates the current value from the dom correctly', ->
        expect( @labelFieldObj.currentValue() ).toEqual @labelObjValue

      it 'generates the correct dom', ->
        #ToDo: test for the proper label wrapper
        _root = $('<div />')
        objjQ = _root.append( @labelFieldObj.view() )
        valueContainers = objjQ.find '.basic-vc'
        expect(valueContainers.length).toEqual 1
        #this is a bit of a cheat and doesn't verify structure
        expect( valueContainers.text() ).toEqual 'Label: My Label'
