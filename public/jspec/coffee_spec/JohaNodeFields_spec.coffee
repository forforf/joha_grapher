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

    it 'creates a container for the value', ->
      expect( @complexJsonFieldObj.className ).toEqual 'NodeJsonField'
      jsonContainer = @complexJsonFieldObj.jsonContainer
      expect( jsonContainer.currentValue() ).toEqual @complexObjValue
      expect(jsonContainer.origValue).toEqual @complexObjValue

