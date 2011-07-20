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
      return describe('creates a container for the value', function() {
        it('is a NodeJsonField object', function() {
          return expect(this.complexJsonFieldObj.className).toEqual('NodeJsonField');
        });
        it('has the data value represented', function() {
          return expect(this.complexJsonFieldObj.fieldValue).toEqual(this.complexObjValue);
        });
        it('correctly sets the original value', function() {
          var jsonContainer;
          jsonContainer = this.complexJsonFieldObj.jsonContainer;
          return expect(jsonContainer.origValue).toEqual(this.complexObjValue);
        });
        return it('calculates the current value from the dom correctly', function() {
          var jsonContainer;
          jsonContainer = this.complexJsonFieldObj.jsonContainer;
          return expect(jsonContainer.currentValue()).toEqual(this.complexObjValue);
        });
      });
    });
  });
}).call(this);
