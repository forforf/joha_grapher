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
        jsonContainer = @complexJsonFieldObj.jsonContainer
        expect(jsonContainer.origValue).toEqual @complexObjValue            

      it 'calculates the current value from the dom correctly', ->
        jsonContainer = @complexJsonFieldObj.jsonContainer
        expect( jsonContainer.currentValue() ).toEqual @complexObjValue

