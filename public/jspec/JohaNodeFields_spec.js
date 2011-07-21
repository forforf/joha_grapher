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
      it('creates NodeJsonField', function() {
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
        return expect(fieldObj.className).toEqual('json-field');
      });
      it('creates NodeIdField', function() {
        var fieldName, fieldObj, idValue;
        fieldName = 'id';
        idValue = 'SomeID';
        fieldObj = nodeFieldFactory(fieldName, idValue);
        return expect(fieldObj.className).toEqual('id-field');
      });
      return it('creates NodeIdField', function() {
        var fieldName, fieldObj, labelValue;
        fieldName = 'label';
        labelValue = 'My Label';
        fieldObj = nodeFieldFactory(fieldName, labelValue);
        return expect(fieldObj.className).toEqual('label-field');
      });
    });
    describe('NodeJsonField', function() {
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
          return expect(this.complexJsonFieldObj.className).toEqual('json-field');
        });
        it('has the data value represented', function() {
          return expect(this.complexJsonFieldObj.fieldValue).toEqual(this.complexObjValue);
        });
        it('correctly sets the original value', function() {
          var jsonFieldObj;
          jsonFieldObj = this.complexJsonFieldObj;
          return expect(jsonFieldObj.origValue).toEqual(this.complexObjValue);
        });
        it('calculates the current value from the dom correctly', function() {
          var jsonFieldObj;
          jsonFieldObj = this.complexJsonFieldObj;
          return expect(jsonFieldObj.currentValue()).toEqual(this.complexObjValue);
        });
        return it('generates the correct dom', function() {
          var jsonFieldObj, objjQ, valueContainers, _root;
          jsonFieldObj = this.complexJsonFieldObj;
          _root = $('<div />');
          objjQ = _root.append(jsonFieldObj.view());
          valueContainers = objjQ.find('.basic-vc');
          expect(valueContainers.length).toEqual(10);
          return expect(valueContainers.text()).toEqual('aaaabbbabaababbbbbabbc');
        });
      });
    });
    describe('NodeIdField', function() {
      beforeEach(function() {
        var idFieldName;
        idFieldName = 'id';
        this.idValue = 'SomeID';
        return this.idFieldObj = nodeFieldFactory(idFieldName, this.idValue);
      });
      return describe('creates a container for the value', function() {
        it('is a NodeIdField object', function() {
          return expect(this.idFieldObj.className).toEqual('id-field');
        });
        it('has the id value set', function() {
          expect(this.idFieldObj.fieldValue).toEqual(this.idValue);
          return expect(this.idFieldObj.idFieldValue).toEqual(this.idValue);
        });
        it('correctly sets the original value', function() {
          return expect(this.idFieldObj.origValue).toEqual(this.idValue);
        });
        it('calculates the current value from the dom correctly', function() {
          return expect(this.idFieldObj.currentValue()).toEqual(this.idValue);
        });
        return it('generates the correct dom', function() {
          var objjQ, valueContainers, _root;
          _root = $('<div />');
          objjQ = _root.append(this.idFieldObj.view());
          valueContainers = objjQ.find('.basic-vc');
          expect(valueContainers.length).toEqual(0);
          return expect(objjQ.text()).toEqual('idSomeID');
        });
      });
    });
    return describe('NodeLabelField', function() {
      beforeEach(function() {
        var labelFieldName;
        labelFieldName = 'label';
        this.labelObjValue = 'My Label';
        return this.labelFieldObj = nodeFieldFactory(labelFieldName, this.labelObjValue);
      });
      return describe('creates a container for the value', function() {
        it('is a labelJsonField object', function() {
          return expect(this.labelFieldObj.className).toEqual('label-field');
        });
        it('has the data value represented', function() {
          return expect(this.labelFieldObj.fieldValue).toEqual(this.labelObjValue);
        });
        it('correctly sets the original value', function() {
          return expect(this.labelFieldObj.origValue).toEqual(this.labelObjValue);
        });
        it('calculates the current value from the dom correctly', function() {
          return expect(this.labelFieldObj.currentValue()).toEqual(this.labelObjValue);
        });
        return it('generates the correct dom', function() {
          var objjQ, valueContainers, _root;
          _root = $('<div />');
          objjQ = _root.append(this.labelFieldObj.view());
          valueContainers = objjQ.find('.basic-vc');
          expect(valueContainers.length).toEqual(1);
          return expect(valueContainers.text()).toEqual('Label: My Label');
        });
      });
    });
  });
}).call(this);
