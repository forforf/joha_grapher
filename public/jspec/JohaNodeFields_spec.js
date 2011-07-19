(function() {
  describe('JohaNodeFields', function() {
    var nodeFieldFactory, nodeFieldLib;
    nodeFieldLib = require('JohaNodeFields');
    nodeFieldFactory = nodeFieldLib.nodeFieldFactory;
    describe('Importing', function() {
      return it('should exist', function() {
        return expect(nodeFieldFactory).toBeDefined();
      });
    });
    describe('nodeFactory', function() {
      return it('creates NodeJsonField', function() {
        var complexObjValue, fieldName, fieldObj;
        fieldName = 'anything other than required labels';
        complexObjValue = {
          a: ['aa', 'ab'],
          b: {
            ba: ['baa', 'bab'],
            bb: {
              bba: 'bbc'
            }
          }
        };
        fieldObj = nodeFieldFactory(fieldName, complexObjValue);
        return expect(fieldObj.className).toEqual('NodeJsonField');
      });
    });
    return describe('NodeJsonField', function() {
      beforeEach(function() {
        var complexFieldName;
        complexFieldName = 'complex';
        this.complexObjValue = {
          a: ['aa', 'ab'],
          b: {
            ba: ['baa', 'bab'],
            bb: {
              bba: 'bbc'
            }
          }
        };
        return this.complexJsonFieldObj = nodeFieldFactory(complexFieldName, this.complexObjValue);
      });
      return it('creates a container for the value', function() {
        var jsonContainer;
        expect(this.complexJsonFieldObj.className).toEqual('NodeJsonField');
        jsonContainer = this.complexJsonFieldObj.jsonContainer;
        expect(jsonContainer.currentValue()).toEqual(this.complexObjValue);
        return expect(jsonContainer.origValue).toEqual(this.complexObjValue);
      });
    });
  });
}).call(this);
