(function() {
  var JohaNodeEditor, NodeField, NodeFileAttachments, NodeFilesField, NodeIdField, NodeJsonField, NodeLabelField, NodeLinks, NodeLinksField, forfLib, idTracker, idTrackerLib, nodeFieldFactory, root;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  forfLib = require('forf');
  idTrackerLib = require('IdTrackerSingleton');
  idTracker = idTrackerLib.IdBinder;
  NodeFileAttachments = (function() {
    function NodeFileAttachments() {}
    return NodeFileAttachments;
  })();
  NodeLinks = (function() {
    function NodeLinks() {}
    return NodeLinks;
  })();
  NodeField = (function() {
    function NodeField(fieldName, fieldValue) {
      this.fieldName = fieldName;
      this.fieldValue = fieldValue;
    }
    return NodeField;
  })();
  NodeJsonField = (function() {
    __extends(NodeJsonField, NodeField);
    function NodeJsonField() {
      NodeJsonField.__super__.constructor.apply(this, arguments);
    }
    return NodeJsonField;
  })();
  NodeIdField = (function() {
    __extends(NodeIdField, NodeField);
    function NodeIdField() {
      NodeIdField.__super__.constructor.apply(this, arguments);
    }
    return NodeIdField;
  })();
  NodeLabelField = (function() {
    __extends(NodeLabelField, NodeField);
    function NodeLabelField() {
      NodeLabelField.__super__.constructor.apply(this, arguments);
    }
    return NodeLabelField;
  })();
  NodeFilesField = (function() {
    __extends(NodeFilesField, NodeField);
    function NodeFilesField() {
      NodeFilesField.__super__.constructor.apply(this, arguments);
    }
    return NodeFilesField;
  })();
  NodeLinksField = (function() {
    __extends(NodeLinksField, NodeField);
    function NodeLinksField() {
      NodeLinksField.__super__.constructor.apply(this, arguments);
    }
    return NodeLinksField;
  })();
  nodeFieldFactory = function(fieldName, fieldValue) {
    switch (fieldName) {
      case 'id':
        return new NodeIdField(fieldName, fieldValue);
      case 'label':
        return new NodeLabelField(fieldName, fieldValue);
      case 'attached_files':
        return new NodeFilesField(fieldName, fieldValue);
      case 'links':
        return new NodeLinksField(fieldName, fieldValue);
      default:
        return new NodeJsonField(fieldName, fieldValue);
    }
  };
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
      return idTracker;
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
