(function() {
  describe('JohaNodeEditor', function() {
    var JNEd, JohaNodeEditor, forfLib, getKeys;
    JNEd = require("JohaNodeEditor");
    JohaNodeEditor = JNEd.JohaNodeEditor;
    forfLib = require('forf');
    getKeys = forfLib.getKeys;
    describe('Importing', function() {
      return it('should be loaded and defined and instantiable', function() {
        this.instance = new JohaNodeEditor({});
        expect(this.instance).toBeDefined();
        return expect(this.instance.currentNodeId()).toBeDefined();
      });
    });
    describe('Initialization with proper data', function() {
      this.nodeData = {};
      this.nodeEd = null;
      beforeEach(function() {
        this.nodeData = {
          id: 'id-test',
          label: 'label-test',
          links: {
            'http://www.google.com': 'google',
            'http://www.yahoo.com': 'yahoo'
          },
          a_string: 'abc',
          a_number: 42,
          a_simple_array: ['A', 'B', 'C'],
          a_simple_obj: {
            a: 'AA',
            b: 'BB',
            c: 'CC'
          },
          a_complex_array: [
            'd', ['e', 'f'], {
              g: 'G'
            }
          ],
          a_complex_obj: {
            h: {
              hh: [
                'i', 'j', {
                  k: 'K'
                }
              ]
            }
          }
        };
        return this.nodeEd = new JohaNodeEditor(this.nodeData);
      });
      it('provides node data', function() {
        return expect(this.nodeEd.currentNodeData()).toEqual(this.nodeData);
      });
      it('provides the node id', function() {
        expect(this.nodeData.id).toEqual('id-test');
        return expect(this.nodeEd.currentNodeId()).toEqual(this.nodeData.id);
      });
      it('creates joha field objects properly', function() {
        var johaFields;
        johaFields = this.nodeEd.nodeFields();
        expect(johaFields.id.fieldName).toEqual("id");
        expect(johaFields.id.fieldValue).toEqual(this.nodeData.id);
        expect(johaFields.label.fieldName).toEqual("label");
        expect(johaFields.label.fieldValue).toEqual(this.nodeData.label);
        expect(johaFields.links.fieldName).toEqual("links");
        expect(johaFields.links.fieldValue).toEqual(this.nodeData.links);
        expect(johaFields.a_string.fieldName).toEqual("a_string");
        return expect(johaFields.a_string.fieldValue).toEqual(this.nodeData.a_string);
      });
      return it('builds Dom', function() {});
    });
    return describe('Initialization with improper data', function() {
      it('provides a node id if one does not exist', function() {
        var nodeData, nodeEd;
        nodeData = {};
        nodeEd = new JohaNodeEditor(nodeData);
        expect(nodeData.id).toEqual(nodeEd.currentNodeId());
        return expect(nodeData.id.length).toEqual(36);
      });
      return it('provides a node label if one does not exist', function() {
        var nodeData, nodeEd;
        nodeData = {};
        nodeEd = new JohaNodeEditor(nodeData);
        expect(nodeData.label).toEqual(nodeEd.currentNodeData().label);
        return expect(nodeData.label).toEqual('node:' + nodeData.id);
      });
    });
  });
}).call(this);
