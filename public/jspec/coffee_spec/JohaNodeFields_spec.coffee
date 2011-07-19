describe 'JohaNodeFields', ->
  nodeFieldLib = require 'JohaNodeFields'
  nodeFieldFactory = nodeFieldLib.nodeFieldFactory

  describe 'Importing', ->
    it 'should exist', ->
      expect( nodeFieldFactory ).toBeDefined()
