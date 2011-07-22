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
      it('creates NodeIdField', function() {
        var fieldName, fieldObj, labelValue;
        fieldName = 'label';
        labelValue = 'My Label';
        fieldObj = nodeFieldFactory(fieldName, labelValue);
        return expect(fieldObj.className).toEqual('label-field');
      });
      it('creates NodeFilesField', function() {
        var fieldName, fieldObj, filesValue;
        fieldName = 'attached_files';
        filesValue = ['file1.txt', 'file2', 'file3.html'];
        fieldObj = nodeFieldFactory(fieldName, filesValue);
        return expect(fieldObj.className).toEqual('files-field');
      });
      return it('creates NodeLinksField', function() {
        var fieldName, fieldObj, linksValue;
        fieldName = 'links';
        linksValue = {
          'http://www.google.com': 'Google',
          'http://www.yahoo.com': 'Yahoo'
        };
        fieldObj = nodeFieldFactory(fieldName, linksValue);
        return expect(fieldObj.className).toEqual('links-field');
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
    describe('NodeLabelField', function() {
      beforeEach(function() {
        var labelFieldName;
        labelFieldName = 'label';
        this.labelObjValue = 'My Label';
        return this.labelFieldObj = nodeFieldFactory(labelFieldName, this.labelObjValue);
      });
      return describe('creates a container for the value', function() {
        it('is a NodeLabelField object', function() {
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
    describe('NodeFilesField', function() {
      beforeEach(function() {
        var filesFieldName;
        filesFieldName = 'attached_files';
        this.filesValue = ['simple.txt', 'simple', 'simple.html'];
        return this.filesFieldObj = nodeFieldFactory(filesFieldName, this.filesValue);
      });
      return describe('creates a container for the value', function() {
        it('is a NodeFilesField object', function() {
          return expect(this.filesFieldObj.className).toEqual('files-field');
        });
        it('has the data value represented', function() {
          return expect(this.filesFieldObj.fieldValue).toEqual(this.filesValue);
        });
        it('correctly sets the original value', function() {
          return expect(this.filesFieldObj.origValue).toEqual(this.filesValue);
        });
        it('calculates the current value from the dom correctly', function() {
          return expect(this.filesFieldObj.currentValue()).toEqual(this.filesValue);
        });
        return it('generates the correct dom', function() {
          var filesContainer, filesListContainer, objjQ, _root;
          _root = $('<div />');
          objjQ = _root.append(this.filesFieldObj.view());
          filesContainer = objjQ.find('.joha-files');
          expect(filesContainer.length).toEqual(1);
          filesListContainer = objjQ.find('.joha-filename');
          expect(filesListContainer.length).toEqual(3);
          return expect(filesListContainer.text()).toEqual(this.filesValue.join(''));
        });
      });
    });
    return describe('NodeLinksField', function() {
      beforeEach(function() {
        var linksFieldName;
        linksFieldName = 'links';
        this.linksValue = {
          'http://www.google.com': 'Google',
          'http://www.yahoo.com': 'Yahoo'
        };
        return this.linksFieldObj = nodeFieldFactory(linksFieldName, this.linksValue);
      });
      return describe('creates a container for the value', function() {
        it('is a NodeLinksField object', function() {
          return expect(this.linksFieldObj.className).toEqual('links-field');
        });
        it('has the data value represented', function() {
          return expect(this.linksFieldObj.fieldValue).toEqual(this.linksValue);
        });
        it('correctly sets the original value', function() {
          return expect(this.linksFieldObj.origValue).toEqual(this.linksValue);
        });
        it('calculates the current value from the dom correctly', function() {
          return expect(this.linksFieldObj.currentValue()).toEqual(this.linksValue);
        });
        return it('generates the correct dom', function() {
          var linkEdits, linkLabels, objjQ, _root;
          _root = $('<div />');
          objjQ = _root.append(this.linksFieldObj.view());
          linkLabels = objjQ.find('.link-view');
          expect(linkLabels.length).toEqual(1);
          expect(linkLabels.text()).toEqual('GoogleYahoo');
          linkEdits = objjQ.find('.link-edit');
          expect(linkEdits.length).toEqual(1);
          return expect(linkEdits.text()).toEqual('http://www.google.comGooglehttp://www.yahoo.comYahoo');
        });
      });
    });
  });
}).call(this);
