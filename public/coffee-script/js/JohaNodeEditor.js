(function() {
  var JohaNodeEditor, forfLib, idTracker, idTrackerLib, johaFields, nodeFieldFactory, root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  forfLib = require('forf');
  idTrackerLib = require('IdTrackerSingleton');
  idTracker = idTrackerLib.IdBinder;
  johaFields = require('JohaNodeFields');
  nodeFieldFactory = johaFields.nodeFieldFactory;
  JohaNodeEditor = (function() {
    var ni;
    ni = 'not implemented';
    function JohaNodeEditor(nodeData, options) {
      this.nodeData = nodeData;
      if (!(this.nodeData.id != null)) {
        this.nodeData.id = this.makeGUID();
      }
      if (!this.nodeData.label) {
        this.nodeData.label = "node:" + this.nodeData.id;
      }
    }
    JohaNodeEditor.prototype.buildDom = function() {
      return ni;
    };
    JohaNodeEditor.prototype.clearNodeEdits = function() {
      return ni;
    };
    JohaNodeEditor.prototype.currentNodeData = function() {
      return this.nodeData;
    };
    JohaNodeEditor.prototype.currentNodeId = function() {
      return this.nodeData.id;
    };
    JohaNodeEditor.prototype.deleteNodeData = function() {
      return ni;
    };
    JohaNodeEditor.prototype.nodeFields = function() {
      var fieldName, fieldValue, _dummy, _ref;
      _dummy = {};
      _ref = this.nodeData;
      for (fieldName in _ref) {
        fieldValue = _ref[fieldName];
        _dummy[fieldName] = nodeFieldFactory(fieldName, fieldValue);
      }
      return _dummy;
    };
    JohaNodeEditor.prototype.makeGUID = function() {
      var guid;
      guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);;        return v.toString(16);
      });
      return guid;
    };
    JohaNodeEditor.prototype.rootDomId = function() {
      return ni;
    };
    JohaNodeEditor.prototype.saveNodeData = function() {
      return ni;
    };
    return JohaNodeEditor;
  })();
  root.JohaNodeEditor = JohaNodeEditor;
}).call(this);
