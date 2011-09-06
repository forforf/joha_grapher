
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var module = cache[name], path = expand(root, name), fn;
      if (module) {
        return module;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: name, exports: {}};
        try {
          cache[name] = module.exports;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return cache[name] = module.exports;
        } catch (err) {
          delete cache[name];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({
"JohaNodeEditor": function(exports, require, module) {(function() {
  var $, DeleteButtonBase, IdBinder, IdTracker, JohaNodeEditor, arrayContains, arrayRemoveItem, arrayRemoveSet, extend, forfLib, getKeys, johaChangeTrigger, johaComps, johaEditClass, johaNFs, nodeFieldFactory, root, wrapHtml;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $ = $ || window.$ || window.$j;
  IdBinder = require('IdTrackerSingleton').IdBinder;
  IdTracker = IdBinder;
  johaNFs = require('JohaNodeFields');
  nodeFieldFactory = johaNFs.nodeFieldFactory;
  johaEditClass = johaNFs.johaEditClass;
  johaChangeTrigger = johaNFs.johaChangeTrigger;
  extend = require('extend').extend;
  forfLib = require('forf');
  arrayRemoveSet = forfLib.arrayRemoveSet;
  arrayRemoveItem = forfLib.arrayRemoveItem;
  arrayContains = forfLib.arrayContains;
  getKeys = forfLib.getKeys;
  johaComps = require('johaComponents');
  DeleteButtonBase = johaComps.DeleteButtonBase;
  wrapHtml = johaComps.wrapHtml;
  JohaNodeEditor = (function() {
    var ni;
    ni = 'not implemented';
    function JohaNodeEditor(nodeData, options) {
      var allAvailFields, defaultOptions, existingFields, field, requiredUserFields, reservedFields, value, _i, _len, _ref;
      this.nodeData = nodeData;
      this.origValue = __bind(this.origValue, this);
      this.currentValue = __bind(this.currentValue, this);
      this.buildDom = __bind(this.buildDom, this);
      this.delFn = __bind(this.delFn, this);
      this.buildFieldDropDown = __bind(this.buildFieldDropDown, this);
      console.log('JNE constructor Entered');
      console.log(options);
      IdTracker.get({
        prefix: 'joha-node-edit-'
      });
      this.id = 'id';
      this.label = 'label';
      this.links = 'links';
      this.files = 'attached_files';
      this.mainNodeId = 'joha-edit-node-data';
      this.newFieldsId = 'joha-new-fields';
      defaultOptions = {
        availDropDownFields: {},
        standardDropDownFields: {
          New: 'new_value'
        }
      };
      options = extend(defaultOptions, options);
      console.log('JNE Options', options);
      requiredUserFields = options['requiredFields'] || [];
      this.requiredFields = arrayRemoveSet(requiredUserFields, [this.id, this.label]);
      _ref = this.requiredFields;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        this.nodeData[field] = null;
        null;
      }
      allAvailFields = extend(options['availDropDownFields'], options['standardDropDownFields']);
      reservedFields = ['id', 'label'];
      existingFields = getKeys(this.nodeData);
      this.availFields = {};
      for (field in allAvailFields) {
        if (!__hasProp.call(allAvailFields, field)) continue;
        value = allAvailFields[field];
        if (arrayContains(reservedFields, field)) {
          continue;
        }
        if (arrayContains(existingFields, field)) {
          continue;
        }
        this.availFields[field] = value;
        null;
      }
      this.initialFieldValuesForFieldFactory = function(dataType) {
        switch (dataType) {
          case "static_value":
            return alert('Need something to set initial static value');
          case "basic_value":
            return "new basic value";
          case "array_value":
            return ['new item 1'];
          case "key_list_value":
            return {
              "new key": "new value"
            };
          case "file_list":
            return null;
          case "link_list":
            return {
              "new URL": "new Label"
            };
          case "new_value":
            alert("dialog will go here");
            return "new new value";
        }
      };
      if (!this.nodeData[this.id]) {
        this.nodeData.id = this.makeGUID();
      }
      this.nodeId = this.nodeData.id;
      if (!this.nodeData[this.label]) {
        this.nodeData.label = "node:" + this.nodeData[this.id];
      }
      this.nodeFields = this.buildNodeFields(this.nodeId);
      this.nodeFields;
    }
    JohaNodeEditor.prototype.buildFieldDropDown = function() {
      var attr, blankOption, dropDownLabels, field, johaType, mainForm, select, selectId, selectOption, _ref;
      selectId = 'add-new-field-select';
      mainForm = $('<div />');
      mainForm.text('Add New Field');
      select = $('<select />');
      select.attr('id', selectId);
      select.attr('name', 'addField');
      dropDownLabels = getKeys(this.availFields);
      console.log("building dropdown", this.availFields, dropDownLabels);
      blankOption = wrapHtml('option', "", "value=''");
      select.append(blankOption);
      select.append;
      _ref = this.availFields;
      for (field in _ref) {
        if (!__hasProp.call(_ref, field)) continue;
        johaType = _ref[field];
        attr = "value=\"" + johaType + "\"";
        selectOption = wrapHtml('option', field, attr);
        select.append(selectOption);
      }
      mainForm.append(select);
      select.change(__bind(function() {
        var delBtnArgs, delBtnDom, delBtnObj, initValue, newFieldDom, newFieldName, newFieldValueType, newFieldsDom;
        newFieldValueType = select.val();
        newFieldName = $(':selected').text();
        newFieldsDom = $('#' + this.newFieldsId);
        initValue = this.initialFieldValuesForFieldFactory(newFieldValueType);
        this.nodeFields[newFieldName] = nodeFieldFactory(newFieldName, initValue, this.nodeId);
        newFieldDom = this.nodeFields[newFieldName].view();
        newFieldDom.addClass(johaEditClass["create"]);
        delBtnArgs = {
          targetId: newFieldDom.attr('id'),
          delFn: this.delFn
        };
        delBtnObj = new DeleteButtonBase(delBtnArgs);
        delBtnDom = delBtnObj.get();
        newFieldDom.append(delBtnDom);
        return newFieldsDom.append(newFieldDom);
      }, this));
      return mainForm;
    };
    JohaNodeEditor.prototype.delFn = function(targetId) {
      var targetDom;
      targetDom = $('#' + targetId);
      targetDom.toggleClass(johaEditClass["delete"]);
      return targetDom.trigger(johaChangeTrigger);
    };
    JohaNodeEditor.prototype.buildDom = function() {
      var delBtnArgs, delBtnDom, delBtnObj, dropDown, fieldDom, fieldNames, filesDom, idDom, idTracker, johaFields, label, labelDom, linksDom, newFieldDom, nodeDom, remField, remainingFieldNames, reqField, _i, _j, _len, _len2, _ref;
      idTracker = IdTracker.get();
      johaFields = this.nodeFields;
      nodeDom = $('<div />');
      nodeDom.attr('id', this.mainNodeId);
      fieldNames = getKeys(this.nodeData);
      idDom = johaFields[this.id].view();
      labelDom = johaFields[this.label].view();
      if (arrayContains(fieldNames, this.links)) {
        linksDom = johaFields[this.links].view();
      }
      if (arrayContains(fieldNames, this.files)) {
        filesDom = johaFields[this.files].view();
      }
      remainingFieldNames = arrayRemoveSet(fieldNames, [this.id, this.label, this.links, this.files]);
      dropDown = this.buildFieldDropDown();
      nodeDom.append(idDom);
      nodeDom.append(labelDom);
      nodeDom.append(dropDown);
      _ref = this.requiredFields;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        reqField = _ref[_i];
        nodeDom.append(johaFields[reqField].view());
        arrayRemoveItem(remainingFieldNames, reqField);
        null;
      }
      for (_j = 0, _len2 = remainingFieldNames.length; _j < _len2; _j++) {
        remField = remainingFieldNames[_j];
        fieldDom = johaFields[remField].view();
        delBtnArgs = {
          targetId: fieldDom.attr("id"),
          delFn: this.delFn
        };
        delBtnObj = new DeleteButtonBase(delBtnArgs);
        delBtnDom = delBtnObj.get();
        label = fieldDom.find('.joha-label');
        label.append(delBtnDom);
        nodeDom.append(fieldDom);
        null;
      }
      newFieldDom = $('<div />');
      newFieldDom.text('New Fields');
      newFieldDom.attr('id', this.newFieldsId);
      nodeDom.append(newFieldDom);
      nodeDom.append(linksDom);
      nodeDom.append(filesDom);
      return nodeDom;
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
    JohaNodeEditor.prototype.currentValue = function() {
      var curThis, curVal, fieldName, fieldObj, fields, objDom, objDomId;
      curThis = this;
      curVal = {};
      fields = this.nodeFields;
      for (fieldName in fields) {
        if (!__hasProp.call(fields, fieldName)) continue;
        fieldObj = fields[fieldName];
        if (fieldObj.fieldDomId || "") {
          objDomId = fieldObj.fieldDomId;
        }
        objDom = $('#' + objDomId);
        if (objDom.hasClass(johaEditClass["delete"])) {
          null;
        } else {
          curVal[fieldName] = fieldObj.currentValue();
        }
        null;
      }
      return curVal;
    };
    JohaNodeEditor.prototype.origValue = function() {
      var fieldName, fieldObj, fields, origVal;
      fields = this.nodeFields;
      origVal = {};
      for (fieldName in fields) {
        if (!__hasProp.call(fields, fieldName)) continue;
        fieldObj = fields[fieldName];
        origVal[fieldName] = fieldObj.origValue;
      }
      return origVal;
    };
    JohaNodeEditor.prototype.deleteNodeData = function() {
      return ni;
    };
    JohaNodeEditor.prototype.buildNodeFields = function(nodeId) {
      var fieldName, fieldValue, _objContainer, _ref;
      _objContainer = {};
      _ref = this.nodeData;
      for (fieldName in _ref) {
        if (!__hasProp.call(_ref, fieldName)) continue;
        fieldValue = _ref[fieldName];
        _objContainer[fieldName] = nodeFieldFactory(fieldName, fieldValue, nodeId);
      }
      return _objContainer;
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
    JohaNodeEditor.prototype.view = function() {
      return this.buildDom();
    };
    return JohaNodeEditor;
  })();
  root.JohaNodeEditor = JohaNodeEditor;
}).call(this);
}, "jsonHelper": function(exports, require, module) {(function() {
  var isBlank, isJSON, root, softParseJSON;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  isBlank = function(str) {
    return !str || /^\s*$/.test(str);
  };
  isJSON = function(val) {
    var retStr, str;
    if (typeof val !== 'string') {
      return false;
    }
    str = val;
    if (isBlank(str)) {
      return false;
    }
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    retStr = /^[\],:{}\s]*$/.test(str);
    return retStr;
  };
  softParseJSON = function(val) {
    if (isJSON(val)) {
      return jQuery.parseJSON(val);
    }
    return val;
  };
  root.softParseJSON = softParseJSON;
}).call(this);
}, "IdTrackerSingleton": function(exports, require, module) {(function() {
  var IdBinder, extend, extendLib, root, _SingletonBinder;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  extendLib = require('./extend');
  extend = extendLib.extend;
  IdBinder = (function() {
    var _instance;
    function IdBinder() {}
    _instance = void 0;
    IdBinder.get = function(args) {
      return _instance != null ? _instance : _instance = new _SingletonBinder(args);
    };
    return IdBinder;
  })();
  _SingletonBinder = (function() {
    function _SingletonBinder(args) {
      var defaults;
      this.args = args;
      defaults = {
        prefix: ""
      };
      this.options = extend(defaults, this.args);
      this.ids = {};
      this.nextId = 0;
      this.idPrefix = this.options.prefix;
    }
    _SingletonBinder.prototype.assignId = function(boundToThis) {
      var boundId;
      boundId = this.idPrefix + this.nextId;
      this.nextId++;
      this.ids[boundId] = boundToThis;
      return boundId;
    };
    _SingletonBinder.prototype.getBoundById = function(id) {
      return this.ids[id];
    };
    _SingletonBinder.prototype.echo = function() {
      return this.args;
    };
    return _SingletonBinder;
  })();
  root.IdBinder = IdBinder;
}).call(this);
}, "dynJsonContainers": function(exports, require, module) {(function() {
  var $, AddButtonBase, ArrayDataEntryForm, ArrayValueContainer, AttachmentForm, BasicValueContainer, BasicValueContainerNoDel, BasicValueContainerNoMod, BasicValueContainerNoOp, ContainerBase, DeleteButtonBase, EditButtonBase, FileValueContainer, FilesContainer, IdBinder, KeyValue, KeyValueBase, LinksContainer, LinksDataEntryForm, LinksKeyValue, ObjectBase, ObjectDataEntryForm, ObjectValueContainer, RootValueContainer, ValueContainerBase, arrayContains, arrayRemoveItem, extend, forf, getType, johaChangeTrigger, johaComp, johaEditClass, root, softParseJSON, valueContainerFactory, wrapHtml;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $ = $ || window.$ || window.$j;
  IdBinder = require('IdTrackerSingleton').IdBinder;
  forf = require('forf');
  arrayContains = forf.arrayContains;
  arrayRemoveItem = forf.arrayRemoveItem;
  getType = forf.getType;
  extend = forf.extend;
  johaComp = require('johaComponents');
  wrapHtml = johaComp.wrapHtml;
  AddButtonBase = johaComp.AddButtonBase;
  EditButtonBase = johaComp.EditButtonBase;
  DeleteButtonBase = johaComp.DeleteButtonBase;
  ArrayDataEntryForm = johaComp.ArrayDataEntryForm;
  ObjectDataEntryForm = johaComp.ObjectDataEntryForm;
  LinksDataEntryForm = johaComp.LinksDataEntryForm;
  AttachmentForm = johaComp.AttachmentForm;
  softParseJSON = require('jsonHelper').softParseJSON;
  johaEditClass = {
    "update": "joha-update",
    "delete": "joha-delete",
    "create": "joha-create"
  };
  johaChangeTrigger = "joha-recalculate";
  root.johaEditClass = johaEditClass;
  valueContainerFactory = function(value) {
    var container, containerFromSimpleType, containerFromValue;
    containerFromSimpleType = {
      '[object Null]': BasicValueContainer,
      '[object String]': BasicValueContainer,
      '[object Number]': BasicValueContainer,
      '[object Boolean]': BasicValueContainer,
      '[object Array]': ArrayValueContainer,
      '[object Object]': ObjectValueContainer
    };
    containerFromValue = function(value) {
      var containerClass, objContainer, type;
      type = getType(value);
      containerClass = containerFromSimpleType[type];
      objContainer = new containerClass(value);
      return objContainer;
    };
    container = containerFromValue(value);
    return container;
  };
  ContainerBase = (function() {
    function ContainerBase(value) {
      var idBinder;
      this.value = value;
      idBinder = IdBinder.get();
      this.domId = idBinder.assignId(this);
      this.curValue = this.value;
      this.origValue = this.value;
      this.selDomId = '#' + this.domId;
      this.recalcTrigger = root.johaChangeTrigger;
      this.updateClass = root.johaEditClass["update"];
      this.deleteClass = root.johaEditClass["delete"];
      this.createClass = root.johaEditClass["create"];
      this.commonMethods = {
        setValId: function(domId) {
          return domId + '-val';
        },
        setEditValId: function(domId) {
          return domId + '-edit';
        },
        makeDelBtn: function(domId, triggerName, deleteClass) {
          var args, delBtn, delBtnObj, delFn;
          delFn = __bind(function(domId) {
            var targetDom;
            targetDom = $('#' + domId);
            targetDom.toggleClass(deleteClass);
            return targetDom.trigger(triggerName);
          }, this);
          args = {
            targetId: domId,
            delFn: delFn
          };
          delBtnObj = new DeleteButtonBase(args);
          return delBtn = delBtnObj.get();
        }
      };
    }
    return ContainerBase;
  })();
  ValueContainerBase = (function() {
    __extends(ValueContainerBase, ContainerBase);
    function ValueContainerBase(value) {
      var valContBaseMethods;
      this.value = value;
      this.makeDelArgs = __bind(this.makeDelArgs, this);
      ValueContainerBase.__super__.constructor.call(this, this.value);
      valContBaseMethods = {
        updateEditBoxVal: function(contDom) {
          var domId, editBoxValDom, editValId, newVal, valDom, valId;
          domId = contDom.attr("id");
          valId = domId + '-val';
          editValId = domId + '-edit';
          editBoxValDom = $('#' + editValId);
          valDom = $('#' + valId);
          newVal = editBoxValDom.val();
          valDom.text(newVal);
          return newVal;
        },
        updateContAfterEdit: __bind(function(domId) {
          var contDom, jsonVal;
          contDom = $('#' + domId);
          this.curValue = this.updateEditBoxVal(contDom);
          jsonVal = softParseJSON(this.curValue);
          if (jsonVal === this.origValue) {
            contDom.removeClass(this.updateClass);
          } else {
            contDom.addClass(this.updateClass);
          }
          return this.curValue;
        }, this),
        basicView: function(curValue, domId, valId, contClass) {
          var div, inHtml, inTag, inVal, outerHtml, outerTag, valDom;
          inTag = 'span';
          inVal = curValue;
          inHtml = wrapHtml(inTag, inVal);
          outerTag = 'div';
          outerHtml = wrapHtml(outerTag);
          div = $(outerHtml);
          div.attr("id", domId);
          valDom = $(inHtml);
          valDom.attr("id", valId);
          div.append(valDom);
          div.addClass(contClass);
          return {
            div: div,
            val: valDom
          };
        },
        editView: function(curValue, editValId, contType) {
          var attrs, edit, editHtml, editTag, editType;
          editTag = 'input';
          editType = "type='text'";
          editHtml = wrapHtml(editTag, '', editType);
          edit = $(editHtml);
          attrs = {
            id: editValId,
            value: curValue
          };
          edit.attr(attrs);
          edit.hide();
          return edit;
        },
        editControl: function(elDom, editDom, elClass) {
          elDom.addClass(elClass);
          return elDom.click(__bind(function() {
            editDom.toggle();
            if (elDom.is(":visible")) {
              return editDom.focus();
            }
          }, this));
        },
        onTrigger: function(triggerName, listener, eventFn) {
          return listener.bind(triggerName, eventFn);
        },
        editChange: function(editDom, domListener, triggerName) {
          domListener.trigger(triggerName);
          return editDom.hide();
        }
      };
      this.commonMethods = extend(this.commonMethods, valContBaseMethods);
    }
    ValueContainerBase.prototype.jsonType = function() {
      return typeof this.value;
    };
    ValueContainerBase.prototype.makeDelArgs = function() {
      var args, delFn, targetId;
      targetId = this.domId;
      delFn = __bind(function(targetId) {
        return alert('No container specific delete fn created');
      }, this);
      return args = {
        targetID: targetId,
        delFn: delFn
      };
    };
    return ValueContainerBase;
  })();
  BasicValueContainerNoOp = (function() {
    __extends(BasicValueContainerNoOp, ValueContainerBase);
    function BasicValueContainerNoOp() {
      BasicValueContainerNoOp.__super__.constructor.apply(this, arguments);
    }
    BasicValueContainerNoOp.prototype.contructor = function(value) {
      this.value = value;
      BasicValueContainerNoOp.__super__.contructor.call(this, this.value);
      return alert("No Op Value Container Not Implemented Yet");
    };
    return BasicValueContainerNoOp;
  })();
  BasicValueContainerNoMod = (function() {
    __extends(BasicValueContainerNoMod, ValueContainerBase);
    function BasicValueContainerNoMod(value) {
      this.value = value;
      this.currentValue = __bind(this.currentValue, this);
      BasicValueContainerNoMod.__super__.constructor.call(this, this.value);
      this.valId = this.commonMethods["setValId"](this.domId);
      this.delBtn = this.commonMethods["makeDelBtn"](this.domId, this.recalcTrigger, this.deleteClass);
    }
    BasicValueContainerNoMod.prototype.currentValue = function() {
      var retVal;
      retVal = $(this.selDomId).hasClass(this.deleteClass) ? null : softParseJSON(this.curValue);
      return retVal;
    };
    BasicValueContainerNoMod.prototype.view = function() {
      var div, elDoms, recalcFn, valDom;
      elDoms = this.commonMethods["basicView"](this.curValue, this.domId, this.valId, this.containerType);
      div = elDoms["div"];
      valDom = elDoms["val"];
      div.append(this.delBtn);
      recalcFn = __bind(function(event) {
        return null;
      }, this);
      this.commonMethods["onTrigger"](this.recalcTrigger, div, recalcFn);
      return div;
    };
    return BasicValueContainerNoMod;
  })();
  BasicValueContainerNoDel = (function() {
    __extends(BasicValueContainerNoDel, ValueContainerBase);
    function BasicValueContainerNoDel(value) {
      this.value = value;
      this.updateContAfterEdit = __bind(this.updateContAfterEdit, this);
      this.currentValue = __bind(this.currentValue, this);
      BasicValueContainerNoDel.__super__.constructor.call(this, this.value);
      this.valId = this.commonMethods["setValId"](this.domId);
      this.editValId = this.commonMethods["setEditValId"](this.domId);
    }
    BasicValueContainerNoDel.prototype.currentValue = function() {
      return softParseJSON(this.curValue);
    };
    BasicValueContainerNoDel.prototype.updateEditBoxVal = function(contDom) {
      return this.commonMethods["updateEditBoxVal"](contDom);
    };
    BasicValueContainerNoDel.prototype.updateContAfterEdit = function(domId) {
      return this.commonMethods["updateContAfterEdit"](domId);
    };
    BasicValueContainerNoDel.prototype.view = function() {
      var div, edit, elDoms, recalcFn, valDom;
      elDoms = this.commonMethods["basicView"](this.curValue, this.domId, this.valId, this.containerType);
      div = elDoms["div"];
      valDom = elDoms["val"];
      edit = this.commonMethods["editView"](this.curValue, this.editValId);
      div.append(edit);
      this.commonMethods["editControl"](valDom, edit, 'clickable-label');
      edit.change(__bind(function() {
        return this.commonMethods["editChange"](edit, div, this.recalcTrigger);
      }, this));
      recalcFn = __bind(function(event) {
        return this.updateContAfterEdit(event.target.id);
      }, this);
      this.commonMethods["onTrigger"](this.recalcTrigger, div, recalcFn);
      return div;
    };
    return BasicValueContainerNoDel;
  })();
  BasicValueContainer = (function() {
    __extends(BasicValueContainer, ValueContainerBase);
    function BasicValueContainer(value) {
      this.value = value;
      this.updateContAfterEdit = __bind(this.updateContAfterEdit, this);
      this.updateEditBoxVal = __bind(this.updateEditBoxVal, this);
      this.currentValue = __bind(this.currentValue, this);
      this.containerType = 'basic-vc';
      BasicValueContainer.__super__.constructor.call(this, this.value);
      this.valId = this.commonMethods["setValId"](this.domId);
      this.editValId = this.commonMethods["setEditValId"](this.domId);
      this.delBtn = this.commonMethods["makeDelBtn"](this.domId, this.recalcTrigger, this.deleteClass);
    }
    BasicValueContainer.prototype.currentValue = function() {
      var retVal;
      retVal = $(this.selDomId).hasClass(this.deleteClass) ? null : softParseJSON(this.curValue);
      return retVal;
    };
    BasicValueContainer.prototype.updateEditBoxVal = function(contDom) {
      return this.commonMethods["updateEditBoxVal"](contDom);
    };
    BasicValueContainer.prototype.updateContAfterEdit = function(domId) {
      return this.commonMethods["updateContAfterEdit"](domId);
    };
    BasicValueContainer.prototype.view = function() {
      var div, edit, elDoms, recalcFn, valDom;
      elDoms = this.commonMethods["basicView"](this.curValue, this.domId, this.valId, this.containerType);
      div = elDoms["div"];
      valDom = elDoms["val"];
      div.append(this.delBtn);
      edit = this.commonMethods["editView"](this.curValue, this.editValId);
      div.append(edit);
      this.commonMethods["editControl"](valDom, edit, 'clickable-label');
      edit.change(__bind(function() {
        return this.commonMethods["editChange"](edit, div, this.recalcTrigger);
      }, this));
      recalcFn = __bind(function(event) {
        return this.updateContAfterEdit(event.target.id);
      }, this);
      this.commonMethods["onTrigger"](this.recalcTrigger, div, recalcFn);
      return div;
    };
    return BasicValueContainer;
  })();
  ArrayValueContainer = (function() {
    var addNewItem;
    __extends(ArrayValueContainer, ContainerBase);
    function ArrayValueContainer(value) {
      var val;
      this.value = value;
      this.currentValue = __bind(this.currentValue, this);
      this.view = __bind(this.view, this);
      this.containerType = 'array-vc';
      this.itemClass = 'joha-array-item';
      this.newFormClass = 'joha-array-add';
      this.children = (function() {
        var _i, _len, _ref, _results;
        _ref = this.value;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          val = _ref[_i];
          _results.push(valueContainerFactory(val));
        }
        return _results;
      }).call(this);
      ArrayValueContainer.__super__.constructor.call(this, this.value);
      this.delBtn = this.commonMethods["makeDelBtn"](this.domId, this.recalcTrigger, this.deleteClass);
    }
    addNewItem = __bind(function(me, newVal) {
      var jItemClass, lastArrayItemDom, newChild, newChildDom, newJsonVal, newRVC, thisDom;
      newJsonVal = softParseJSON(newVal);
      newRVC = new RootValueContainer(newJsonVal);
      newChild = newRVC.valueContainer;
      newChildDom = newChild.view();
      me.children.push(newChild);
      thisDom = $(me.selDomId);
      jItemClass = '.' + me.itemClass;
      lastArrayItemDom = thisDom.find(jItemClass).last();
      if (lastArrayItemDom.length > 0) {
        lastArrayItemDom.after(newChildDom);
      } else {
        thisDom.prepend(newChildDom);
      }
      newChildDom.addClass(me.itemClass);
      newChildDom.addClass(me.createClass);
      return newChildDom.trigger(me.recalcTrigger);
    }, ArrayValueContainer);
    ArrayValueContainer.prototype.view = function() {
      var addNew, addNewForm, av, avHtml, child, childDom, editBtn, editBtnArgs, editFn, formId, tag, val, _i, _len, _ref;
      tag = 'div';
      val = '';
      avHtml = wrapHtml(tag, val);
      av = $(avHtml);
      av.attr("id", this.domId);
      av.addClass(this.containerType);
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        childDom = child.view();
        childDom.addClass(this.itemClass);
        av.append(childDom);
        null;
      }
      av.append(this.delBtn);
      addNew = new ArrayDataEntryForm(this, addNewItem);
      addNewForm = addNew.get();
      formId = this.domId + '-addform';
      addNewForm.addClass(this.newFormClass);
      addNewForm.attr('id', formId);
      addNewForm.hide();
      editFn = __bind(function(targetId) {
        var formDom;
        formDom = $('#' + formId);
        return formDom.toggle();
      }, this);
      editBtnArgs = {
        targetId: this.domId,
        editFn: editFn
      };
      editBtn = new EditButtonBase(editBtnArgs);
      av.append(editBtn.get());
      av.append(addNewForm);
      return av;
    };
    ArrayValueContainer.prototype.currentValue = function() {
      var child, cv, retVal;
      retVal = $(this.selDomId).hasClass(this.deleteClass) ? null : cv = (function() {
        var _i, _len, _ref, _results;
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.currentValue());
        }
        return _results;
      }).call(this);
      return retVal;
    };
    return ArrayValueContainer;
  }).call(this);
  KeyValueBase = (function() {
    __extends(KeyValueBase, ContainerBase);
    function KeyValueBase(key, val) {
      var kvBaseMethods;
      this.key = key;
      this.val = val;
      KeyValueBase.__super__.constructor.call(this);
      kvBaseMethods = {
        basicView: function(kvCont, keyCont, valCont) {
          var contType, domId, k, kClass, kHtml, kLabel, kTag, kv, kvHtml, kvLabel, kvTag, v, vClass, vHtml, vLabel, vTag;
          domId = kvCont.domId;
          contType = kvCont.containerType;
          kvLabel = kvCont.kvLabel;
          kLabel = kvCont.kLabel;
          kClass = kvCont.kClass;
          vLabel = kvCont.vLabel;
          vClass = kvCont.vClass;
          kvTag = 'div';
          kvHtml = wrapHtml(kvTag, kvLabel);
          kv = $(kvHtml);
          kTag = 'div';
          kHtml = wrapHtml(kTag, kLabel);
          k = $(kHtml);
          k.addClass(kClass);
          vTag = 'div';
          vHtml = wrapHtml(vTag, vLabel);
          v = $(vHtml);
          v.addClass(vClass);
          kv.attr("id", domId);
          kv.addClass(contType);
          kv.append(k);
          k.append(keyCont.view());
          kv.append(v);
          v.append(valCont.view());
          return kv;
        },
        currentValue: function(domId, kCont, vCont, deleteClass) {
          var kvVal, retVal;
          retVal = $('#' + domId).hasClass(deleteClass) ? null : (kvVal = {}, kvVal[kCont.currentValue()] = vCont.currentValue(), kvVal);
          return retVal;
        }
      };
      this.commonMethods = extend(this.commonMethods, kvBaseMethods);
    }
    return KeyValueBase;
  })();
  KeyValue = (function() {
    __extends(KeyValue, KeyValueBase);
    function KeyValue(key, val) {
      this.key = key;
      this.val = val;
      this.currentValue = __bind(this.currentValue, this);
      this.view = __bind(this.view, this);
      KeyValue.__super__.constructor.call(this, this.key, this.val);
      this.containerType = 'keyvalue-vc';
      this.keyContainer = valueContainerFactory(this.key);
      this.valContainer = valueContainerFactory(this.val);
      this.kvLabel = "";
      this.kLabel = "";
      this.kClass = "keyvaluekey-vc";
      this.vLabel = "";
      this.vClass = "keyvaluevalue-vc";
      this.delBtn = this.commonMethods["makeDelBtn"](this.domId, this.recalcTrigger, this.deleteClass);
    }
    KeyValue.prototype.view = function() {
      var kv;
      kv = this.commonMethods["basicView"](this, this.keyContainer, this.valContainer);
      kv.append(this.delBtn);
      return kv;
    };
    KeyValue.prototype.currentValue = function() {
      return this.commonMethods["currentValue"](this.domId, this.keyContainer, this.valContainer, this.deleteClass);
    };
    return KeyValue;
  })();
  ObjectBase = (function() {
    __extends(ObjectBase, ContainerBase);
    function ObjectBase(objValue) {
      var objBaseMethods;
      this.objValue = objValue;
      ObjectBase.__super__.constructor.call(this, this.objValue);
      objBaseMethods = {
        basicObjView: function(objCont) {
          var child, childDom, label, obj, objHtml, tag, _i, _len, _ref;
          tag = 'div';
          label = objCont.objLabel;
          objHtml = wrapHtml(tag, label);
          obj = $(objHtml);
          obj.attr("id", objCont.domId);
          obj.addClass(objCont.containerType);
          _ref = objCont.kvChildren;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            childDom = child.view();
            childDom.addClass(objCont.itemClass);
            obj.append(childDom);
            null;
          }
          return obj;
        }
      };
      this.commonMethods = extend(this.commonMethods, objBaseMethods);
    }
    return ObjectBase;
  })();
  ObjectValueContainer = (function() {
    var addNewItem;
    __extends(ObjectValueContainer, ObjectBase);
    function ObjectValueContainer(objValue) {
      var key, val;
      this.objValue = objValue;
      this.currentValue = __bind(this.currentValue, this);
      this.view = __bind(this.view, this);
      this.containerType = 'object-vc';
      this.itemClass = 'joha-object-item';
      this.newFormClass = 'joha-object-add';
      this.objLabel = '';
      this.kvChildren = (function() {
        var _ref, _results;
        _ref = this.objValue;
        _results = [];
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          val = _ref[key];
          _results.push(new KeyValue(key, val));
        }
        return _results;
      }).call(this);
      ObjectValueContainer.__super__.constructor.call(this, this.objValue);
      this.delBtn = this.commonMethods["makeDelBtn"](this.domId, this.recalcTrigger, this.deleteClass);
    }
    addNewItem = __bind(function(me, newObj) {
      var jItemClass, lastObjItemDom, newChild, newChildDom, newJsonVal, newKey, newKeyStr, newVal, thisDom;
      newKey = newObj["key"];
      newVal = newObj["val"];
      newKeyStr = String(newKey);
      newJsonVal = softParseJSON(newVal);
      newChild = new KeyValue(newKeyStr, newJsonVal);
      me.kvChildren.push(newChild);
      thisDom = $(me.selDomId);
      jItemClass = '.' + me.itemClass;
      lastObjItemDom = thisDom.find(jItemClass).last();
      lastObjItemDom.after(newChild.view());
      newChildDom = $(newChild.selDomId);
      newChildDom.addClass(me.createClass);
      return newChildDom.trigger(me.recalcTrigger);
    }, ObjectValueContainer);
    ObjectValueContainer.prototype.view = function() {
      var addNew, addNewForm, editBtn, editBtnArgs, editFn, formId, obj;
      obj = this.commonMethods["basicObjView"](this);
      obj.append(this.delBtn);
      addNew = new ObjectDataEntryForm(this, addNewItem);
      addNewForm = addNew.get();
      formId = this.domId + '-addform';
      addNewForm.addClass(this.newFormClass);
      addNewForm.attr('id', formId);
      addNewForm.hide();
      editFn = __bind(function(targetId) {
        var formDom;
        formDom = $('#' + formId);
        return formDom.toggle();
      }, this);
      editBtnArgs = {
        targetId: this.domId,
        editFn: editFn
      };
      editBtn = new EditButtonBase(editBtnArgs);
      obj.append(editBtn.get());
      obj.append(addNewForm);
      return obj;
    };
    ObjectValueContainer.prototype.currentValue = function() {
      var cv, kvChild, retVal, _curVal;
      retVal = $(this.selDomId).hasClass(this.deleteClass) ? null : (_curVal = {}, cv = (function() {
        var _i, _len, _ref, _results;
        _ref = this.kvChildren;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          kvChild = _ref[_i];
          _results.push(extend(_curVal, kvChild.currentValue()));
        }
        return _results;
      }).call(this), _curVal);
      return retVal;
    };
    return ObjectValueContainer;
  }).call(this);
  RootValueContainer = (function() {
    function RootValueContainer(value, options) {
      this.value = value;
      this.currentValue = __bind(this.currentValue, this);
      options || (options = {});
      this.containerType = 'root-vc';
      this.valueContainer = valueContainerFactory(this.value);
      this.origValue = this.valueContainer.origValue;
    }
    RootValueContainer.prototype.view = function() {
      var valCont;
      valCont = $('<div />');
      valCont.append(this.valueContainer.view());
      valCont.addClass(this.containerType);
      return valCont.addClass('value-container');
    };
    RootValueContainer.prototype.currentValue = function() {
      return this.valueContainer.currentValue();
    };
    return RootValueContainer;
  })();
  FileValueContainer = (function() {
    __extends(FileValueContainer, BasicValueContainerNoMod);
    function FileValueContainer(filename) {
      this.filename = filename;
      this.view = __bind(this.view, this);
      this.currentFileItem = __bind(this.currentFileItem, this);
      this.getFileItem = __bind(this.getFileItem, this);
      this.setFileItem = __bind(this.setFileItem, this);
      this.equiv = __bind(this.equiv, this);
      this.fileItemData = null;
      FileValueContainer.__super__.constructor.call(this, this.filename);
    }
    FileValueContainer.prototype.equiv = function(fvc) {
      if (fvc === void 0) {
        return false;
      }
      if (this.filename === fvc.filename) {
        return true;
      } else {
        return false;
      }
    };
    FileValueContainer.prototype.setFileItem = function(fileItem) {
      return this.fileItemData = fileItem;
    };
    FileValueContainer.prototype.getFileItem = function() {
      return this.fileItemData;
    };
    FileValueContainer.prototype.currentFileItem = function() {
      var retVal;
      retVal = $(this.selDomId).hasClass(this.deleteClass) ? null : this.fileItemData;
      return retVal;
    };
    FileValueContainer.prototype.view = function() {
      return FileValueContainer.__super__.view.apply(this, arguments);
    };
    return FileValueContainer;
  })();
  FilesContainer = (function() {
    __extends(FilesContainer, ContainerBase);
    function FilesContainer(files, nodeId) {
      var fileCont, filesListHtml, fname, form, formId, newFilesCallbackFn, uploadFn, _i, _len, _ref;
      this.files = files;
      this.nodeId = nodeId;
      this.uploadableFileContainers = __bind(this.uploadableFileContainers, this);
      this.currentValue = __bind(this.currentValue, this);
      this.makeFileCont = __bind(this.makeFileCont, this);
      this.viewNewFileInsert = __bind(this.viewNewFileInsert, this);
      this.viewInitFileInsert = __bind(this.viewInitFileInsert, this);
      this.view = __bind(this.view, this);
      this.validFileConts = __bind(this.validFileConts, this);
      this.removeFileContFromList = __bind(this.removeFileContFromList, this);
      this.findContByName = __bind(this.findContByName, this);
      this.initFileContList = [];
      this.newFileContList = [];
      FilesContainer.__super__.constructor.call(this, this.files);
      this.fileClassName = 'joha-filename';
      _ref = this.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fname = _ref[_i];
        fileCont = this.makeFileCont(fname);
        this.initFileContList.push(fileCont);
        null;
      }
      this.filesList = [];
      this.filesListClass = 'joha-files';
      filesListHtml = wrapHtml('div');
      this.filesListDom = $(filesListHtml);
      this.filesListDom.addClass(this.filesListClass);
      this.containerType = 'files-vc value-container';
      formId = this.domId + 'attform';
      newFilesCallbackFn = __bind(function(fileList) {
        var cont, existingConts, existingName, fileBasename, fileItem, newestFileItemsToAdd, skipThis, _j, _k, _len2, _len3;
        newestFileItemsToAdd = [];
        for (_j = 0, _len2 = fileList.length; _j < _len2; _j++) {
          fileItem = fileList[_j];
          fileBasename = fileItem.fileName;
          existingConts = this.validFileConts();
          skipThis = false;
          for (_k = 0, _len3 = existingConts.length; _k < _len3; _k++) {
            cont = existingConts[_k];
            existingName = cont.filename;
            if (fileBasename === existingName) {
              skipThis = true;
            }
          }
          if (skipThis) {
            alert("Skipping file: " + fileBasename + "\n It is already assigned.");
            continue;
          }
          fileCont = this.makeFileCont(fileBasename);
          fileCont.setFileItem(fileItem);
          newestFileItemsToAdd.push(fileCont);
          null;
        }
        this.viewNewFileInsert(newestFileItemsToAdd);
        return this.newFileContList = this.newFileContList.concat(newestFileItemsToAdd);
      }, this);
      uploadFn = __bind(function(formDom) {
        var delFileName, fileItem, formDataKey, self, uploadDelCont, uploadForm, uploadList, uploadNewCont, xhr, _j, _k, _len2, _len3, _ref2, _ref3;
        uploadList = this.uploadableFileContainers();
        uploadForm = new FormData();
        _ref2 = uploadList["new"];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          uploadNewCont = _ref2[_j];
          fileItem = uploadNewCont.currentFileItem();
          formDataKey = 'NEW_FILE___' + fileItem.fileName;
          uploadForm.append(formDataKey, fileItem);
          null;
        }
        _ref3 = uploadList.deleted;
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          uploadDelCont = _ref3[_k];
          delFileName = uploadDelCont.origValue;
          formDataKey = 'DEL_FILE___' + delFileName;
          uploadForm.append(formDataKey, delFileName);
          null;
        }
        uploadForm.append('node_id', this.nodeId);
        self = this;
        xhr = new XMLHttpRequest();
        xhr.open('POST', formDom.attr('action'), true);
        xhr.onload = function(e) {
          var resp;
          console.log(this);
          resp = JSON.parse(this.responseText);
          self.updateViewAfterUpload(self, resp);
          return self.updateContsAfterUpload(self, resp);
        };
        xhr.send(uploadForm);
        return uploadForm;
      }, this);
      form = new AttachmentForm(formId, '/upload_files_html5', 'iframe-uploader', newFilesCallbackFn, uploadFn);
      form.updateNodeId(this.nodeId);
      this.formDom = form.get();
    }
    FilesContainer.prototype.findContByName = function(basename, contList) {
      var cont, respCont, _i, _len;
      contList || (contList = this.validFileConts());
      respCont = null;
      for (_i = 0, _len = contList.length; _i < _len; _i++) {
        cont = contList[_i];
        if (basename === cont.filename) {
          respCont = cont;
        }
        null;
      }
      return respCont;
    };
    FilesContainer.prototype.removeFileContFromList = function(contList, remCont) {
      var aCont, _i, _len;
      console.log('remove cont', contList, remCont);
      for (_i = 0, _len = contList.length; _i < _len; _i++) {
        aCont = contList[_i];
        console.log('remove cont iter', aCont, remCont);
        if (aCont.filename === remCont.filename) {
          console.log('Before removing from contList', contList);
          arrayRemoveItem(contList, aCont);
          console.log('after remove', contList, aCont);
        }
      }
      return contList;
    };
    FilesContainer.prototype.updateViewAfterUpload = function(self, uploadResponse) {
      var cont, delFilename, deletedFilesAccepted, idFinder, newFileContDomList, serverSaveFilesAccepted, _i, _len, _results;
      idFinder = new IdBinder.get();
      serverSaveFilesAccepted = uploadResponse["to_save"];
      newFileContDomList = self.filesListDom.find('.' + self.createClass);
      newFileContDomList.each(function(i) {
        var newFileCont, newFileDomId;
        newFileDomId = $(this).attr("id");
        newFileCont = idFinder.getBoundById(newFileDomId);
        if (arrayContains(serverSaveFilesAccepted, newFileCont.filename)) {
          $(this).removeClass(self.createClass);
        }
        return null;
      });
      deletedFilesAccepted = uploadResponse["to_delete"];
      console.log('deleted files', deletedFilesAccepted);
      _results = [];
      for (_i = 0, _len = deletedFilesAccepted.length; _i < _len; _i++) {
        delFilename = deletedFilesAccepted[_i];
        cont = self.findContByName(delFilename);
        $(cont.selDomId).remove();
        _results.push(null);
      }
      return _results;
    };
    FilesContainer.prototype.updateContsAfterUpload = function(self, uploadResponse) {
      var deletedFilesAccepted, existingFile, idFinder, idx, newFileContDomList, savingCont, savingFilename, serverSaveFilesAccepted, xfer, _i, _j, _len, _len2, _ref, _results;
      serverSaveFilesAccepted = uploadResponse["to_save"];
      xfer = [];
      for (_i = 0, _len = serverSaveFilesAccepted.length; _i < _len; _i++) {
        savingFilename = serverSaveFilesAccepted[_i];
        savingCont = self.findContByName(savingFilename, self.newFileContList);
        if (savingCont) {
          xfer.push(savingCont);
        }
      }
      self.initFileContList = self.initFileContList.concat(xfer);
      idFinder = new IdBinder.get();
      newFileContDomList = self.filesListDom.find('.' + self.createClass);
      self.newFileContList = [];
      newFileContDomList.each(function(i) {
        var newFileCont, newFileDomId;
        newFileDomId = $(this).attr("id");
        newFileCont = idFinder.getBoundById(newFileDomId);
        return self.newFileContList.push(newFileCont);
      });
      deletedFilesAccepted = uploadResponse["to_delete"];
      _ref = self.initFileContList;
      _results = [];
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        existingFile = _ref[_j];
        if (existingFile === void 0) {
          continue;
        }
        console.log('Iter FileCont', existingFile);
        if (arrayContains(deletedFilesAccepted, existingFile.filename)) {
          idx = self.initFileContList.indexOf(existingFile);
          self.initFileContList.splice(idx, 1);
        }
        _results.push(null);
      }
      return _results;
    };
    FilesContainer.prototype.validFileConts = function() {
      return this.initFileContList.concat(this.newFileContList);
    };
    FilesContainer.prototype.view = function() {
      var dom, labelDom, labelHtml;
      dom = $('<div />');
      dom.addClass(this.containerType);
      labelHtml = wrapHtml('span', 'File Attachments');
      labelDom = $(labelHtml);
      dom.append(labelDom);
      this.viewInitFileInsert(this.initFileContList);
      dom.addClass(this.containerType);
      dom.append(this.filesListDom);
      dom.append(this.formDom);
      return dom;
    };
    FilesContainer.prototype.viewInitFileInsert = function(initFileContList) {
      var fileDom, initFileCont, _i, _len, _results;
      console.log(initFileContList);
      _results = [];
      for (_i = 0, _len = initFileContList.length; _i < _len; _i++) {
        initFileCont = initFileContList[_i];
        if (!initFileCont.filename) {
          continue;
        }
        fileDom = initFileCont.view();
        fileDom.addClass('joha-file-item');
        this.filesListDom.append(fileDom);
        console.log(this.filesListDom);
        _results.push(null);
      }
      return _results;
    };
    FilesContainer.prototype.viewNewFileInsert = function(newFileContList) {
      var fileDom, newFileCont, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = newFileContList.length; _i < _len; _i++) {
        newFileCont = newFileContList[_i];
        fileDom = newFileCont.view();
        fileDom.addClass('joha-file-item');
        fileDom.addClass(this.createClass);
        _results.push(this.filesListDom.append(fileDom));
      }
      return _results;
    };
    FilesContainer.prototype.makeFileCont = function(filename) {
      var fileCont;
      fileCont = new FileValueContainer(filename);
      return fileCont;
    };
    FilesContainer.prototype.currentValue = function() {
      var cv, fileCont, itemVal, _curVal;
      _curVal = [];
      cv = (function() {
        var _i, _len, _ref, _results;
        _ref = this.validFileConts();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          fileCont = _ref[_i];
          itemVal = $(fileCont.selDomId).hasClass(this.deleteClass) ? null : fileCont.currentValue();
          _results.push(_curVal.push(itemVal));
        }
        return _results;
      }).call(this);
      return _curVal;
    };
    FilesContainer.prototype.uploadableFileContainers = function() {
      var delSel, deletedUploadList, fileCont, fileContDom, newUploadList, uploadFileConts, _i, _j, _len, _len2, _ref, _ref2;
      uploadFileConts = {
        "new": [],
        deleted: []
      };
      newUploadList = [];
      _ref = this.newFileContList;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fileCont = _ref[_i];
        fileContDom = $(fileCont.selDomId);
        delSel = '.' + fileCont.deleteClass;
        if (!(fileContDom.is(delSel))) {
          newUploadList.push(fileCont);
        }
        null;
      }
      deletedUploadList = [];
      _ref2 = this.initFileContList;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        fileCont = _ref2[_j];
        fileContDom = $(fileCont.selDomId);
        delSel = '.' + fileCont.deleteClass;
        if (fileContDom.is(delSel)) {
          deletedUploadList.push(fileCont);
        }
        null;
      }
      uploadFileConts["new"] = newUploadList;
      uploadFileConts.deleted = deletedUploadList;
      console.log('uploadFileConts', uploadFileConts);
      return uploadFileConts;
    };
    return FilesContainer;
  })();
  LinksKeyValue = (function() {
    __extends(LinksKeyValue, KeyValueBase);
    function LinksKeyValue(key, val) {
      this.key = key;
      this.val = val;
      this.currentValue = __bind(this.currentValue, this);
      this.view = __bind(this.view, this);
      LinksKeyValue.__super__.constructor.call(this, this.key, this.val);
      this.containerType = 'linkskv-vc';
      this.keyContainer = new BasicValueContainerNoDel(this.key);
      this.valContainer = new BasicValueContainerNoDel(this.val);
      this.kvLabel = "---";
      this.kLabel = "Link URL";
      this.vLabel = "Link Label";
      this.delBtn = this.commonMethods["makeDelBtn"](this.domId, this.recalcTrigger, this.deleteClass);
    }
    LinksKeyValue.prototype.view = function() {
      var linkskv;
      linkskv = this.commonMethods["basicView"](this, this.keyContainer, this.valContainer);
      return linkskv.append(this.delBtn);
    };
    LinksKeyValue.prototype.currentValue = function() {
      return this.commonMethods["currentValue"](this.domId, this.keyContainer, this.valContainer, this.deleteClass);
    };
    return LinksKeyValue;
  })();
  LinksContainer = (function() {
    var addNewItem;
    __extends(LinksContainer, ObjectBase);
    function LinksContainer(links, options) {
      this.currentValue = __bind(this.currentValue, this);
      this.view = __bind(this.view, this);      var key, val;
      this.objValue = links;
      this.containerType = 'links-edit-vc';
      this.itemClass = 'joha-links-item';
      this.objLabel = "Links";
      this.showEditClass = 'joha-link-edit-active';
      this.viewClass = 'joha-link-view';
      this.editClass = 'joha-link-edit';
      this.newFormClass = 'joha-link-add';
      this.linksChildren = (function() {
        var _ref, _results;
        _ref = this.objValue;
        _results = [];
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          val = _ref[key];
          _results.push(new LinksKeyValue(key, val));
        }
        return _results;
      }).call(this);
      this.kvChildren = this.linksChildren;
      LinksContainer.__super__.constructor.call(this, this.objValue);
      this.delBtn = this.commonMethods["makeDelBtn"](this.domId, this.recalcTrigger, this.deleteClass);
    }
    addNewItem = __bind(function(me, newLink) {
      var jItemClass, lastObjItemDom, newChild, newChildDom, newLabel, newLabelStr, newUrl, newUrlStr, thisDom;
      newUrl = newLink["url"];
      newLabel = newLink["label"];
      newUrlStr = String(newUrl);
      newLabelStr = String(newLabel);
      newChild = new LinksKeyValue(newUrlStr, newLabelStr);
      me.kvChildren.push(newChild);
      thisDom = $(me.selDomId);
      jItemClass = '.' + me.itemClass;
      lastObjItemDom = thisDom.find(jItemClass).last();
      lastObjItemDom.after(newChild.view());
      newChildDom = $(newChild.selDomId);
      newChildDom.addClass(me.createClass);
      return newChildDom.trigger(me.recalcTrigger);
    }, LinksContainer);
    LinksContainer.prototype.view = function() {
      var editBtn, editBtnArgs, editFn, linkEditDom, linkViewDom, linksDom, linksDomClass, toggleViewOrEditFn;
      linksDomClass = 'joha-links';
      linksDom = $('<div />');
      linksDom.addClass(linksDomClass);
      linkEditDom = this.commonMethods["basicObjView"](this);
      linkViewDom = this.linksView(this.currentValue());
      linkEditDom.addClass(this.editClass);
      linkViewDom.addClass(this.viewClass);
      if (linksDom.hasClass(this.showEditClass)) {
        linkEditDom.show();
        linkViewDom.hide();
      } else {
        linkEditDom.hide();
        linkViewDom.show();
      }
      linksDom.append(linkEditDom);
      linksDom.append(linkViewDom);
      editFn = __bind(function(targetId) {
        var targetDom;
        targetDom = $('.' + linksDomClass);
        targetDom.toggleClass(this.showEditClass);
        return targetDom.trigger(johaChangeTrigger);
      }, this);
      editBtnArgs = {
        targetId: this.domId,
        editFn: editFn
      };
      editBtn = new EditButtonBase(editBtnArgs);
      linksDom.append(editBtn.get());
      toggleViewOrEditFn = __bind(function(event) {
        var newLinks;
        newLinks = this.linksView(this.currentValue());
        linksDom.find('.' + this.viewClass).replaceWith(newLinks);
        if (linksDom.hasClass(this.showEditClass)) {
          linksDom.find('.' + this.viewClass).hide();
          return linksDom.find('.' + this.editClass).show();
        } else {
          linksDom.find('.' + this.viewClass).show();
          return linksDom.find('.' + this.editClass).hide();
        }
      }, this);
      return linksDom.bind(johaChangeTrigger, toggleViewOrEditFn);
    };
    LinksContainer.prototype.linkViewDom = function(url, label) {
      var attrs, linkDom, linkHtml;
      attrs = "href='" + url + "'";
      linkHtml = wrapHtml('a', label, attrs);
      linkDom = $(linkHtml);
      linkDom.addClass(this.itemClass);
      return linkDom;
    };
    LinksContainer.prototype.linksView = function(links) {
      var addBtn, addBtnArgs, addFn, addNew, addNewForm, formId, label, linkViewDom, linksContainerDom, linksContainerHtml, linksViewOuterDom, linksViewOuterHtml, linksViewOuterTitle, linksViewOuterTitleDom, url;
      linksViewOuterHtml = wrapHtml('div');
      linksViewOuterTitle = wrapHtml('span', 'Links');
      linksContainerHtml = wrapHtml('div');
      linksViewOuterDom = $(linksViewOuterHtml);
      linksViewOuterTitleDom = $(linksViewOuterTitle);
      linksContainerDom = $(linksContainerHtml);
      linksContainerDom.addClass('links-vc');
      linksContainerDom.addClass('value-container');
      linksViewOuterTitleDom.addClass('link-label');
      linksViewOuterDom.append(linksViewOuterTitleDom);
      linksViewOuterDom.addClass(this.viewClass);
      for (url in links) {
        if (!__hasProp.call(links, url)) continue;
        label = links[url];
        linkViewDom = this.linkViewDom(url, label);
        linksContainerDom.append(linkViewDom);
        null;
      }
      linksViewOuterDom.append(linksContainerDom);
      addNew = new LinksDataEntryForm(this, addNewItem);
      addNewForm = addNew.get();
      formId = this.domId + '-addform';
      addNewForm.addClass(this.newFormClass);
      addNewForm.attr('id', formId);
      addNewForm.hide();
      linksViewOuterDom.append(addNewForm);
      addFn = __bind(function(targetId) {
        var formDom;
        formDom = $('#' + formId);
        console.log('Add Form', formDom);
        return formDom.toggle();
      }, this);
      addBtnArgs = {
        targetId: this.domId,
        addFn: addFn
      };
      addBtn = new AddButtonBase(addBtnArgs);
      linksViewOuterDom.append(addBtn.get());
      return linksViewOuterDom;
    };
    LinksContainer.prototype.linkEditDom = function(url, label) {
      var labelCont, labelDom, labelHtml, objDom, objHtml, urlCont, urlDom, urlHtml, _kv;
      objHtml = wrapHtml('div');
      urlHtml = wrapHtml('span', url);
      labelHtml = wrapHtml('span', label);
      urlCont = new BasicValueContainer(url);
      labelCont = new BasicValueContainer(label);
      _kv = {};
      _kv[url] = label;
      objDom = $(objHtml);
      objDom.addClass;
      urlDom = urlCont.view();
      labelDom = labelCont.view();
      objDom.append(urlDom);
      return objDom.append(labelDom);
    };
    LinksContainer.prototype.linksEdit = function(links) {
      var label, linkEditDom, linksEditDom, url;
      linksEditDom = $('<div />');
      for (url in links) {
        if (!__hasProp.call(links, url)) continue;
        label = links[url];
        linkEditDom = this.linkEditDom(url, label);
        linksEditDom.append(linkEditDom);
        null;
      }
      return linksEditDom;
    };
    LinksContainer.prototype._curVal = function() {
      return;
    };
    LinksContainer.prototype.currentValue = function() {
      var cv, kvChild, _curVal;
      _curVal = {};
      cv = (function() {
        var _i, _len, _ref, _results;
        _ref = this.kvChildren;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          kvChild = _ref[_i];
          _results.push(extend(_curVal, kvChild.currentValue()));
        }
        return _results;
      }).call(this);
      return _curVal;
    };
    return LinksContainer;
  }).call(this);
  root.RootValueContainer = RootValueContainer;
  root.BasicValueContainerNoDel = BasicValueContainerNoDel;
  root.BasicValueContainerNoMod = BasicValueContainerNoMod;
  root.FilesContainer = FilesContainer;
  root.LinksContainer = LinksContainer;
  root.johaChangeTrigger = johaChangeTrigger;
}).call(this);
}, "JohaRGraph": function(exports, require, module) {(function() {
  var $, $jit, JohaGraph, forfExtend, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $jit = $jit || window.$jit;
  $ = $ || window.$ || $j || window($j);
  forfExtend = require('extend').extend;
  JohaGraph = (function() {
    function JohaGraph() {
      this.afterNodeClickCallback = $johaGraph.afterNodeClick;
      this.thisRGraph = new $jit.RGraph(this.johaGraphDefaults(this));
    }
    JohaGraph.prototype.freshNode = function(staleNode) {
      var freshNode;
      freshNode = $jit.json.getSubtree(this.thisRGraph.json, staleNode.id);
      return freshNode;
    };
    JohaGraph.prototype.johaGraphDefaults = function(johaRGraph) {
      var johaRGraphDefaults;
      johaRGraphDefaults = {
        injectInto: 'infovis',
        levelDistance: 100,
        width: 900,
        height: 700,
        background: {
          numberOfCircles: 100,
          levelDistance: 100,
          CanvasStyles: {
            strokeStyle: '#555'
          }
        },
        Navigation: {
          enable: true,
          panning: true,
          zooming: 10
        },
        Node: {
          color: '#ddeeff'
        },
        Edge: {
          color: '#C17878',
          lineWidth: 1.5
        },
        Events: {
          enable: true,
          onClick: __bind(function(node, eventInfo, e) {
            if (node === false) {
              show_create_node_form();
            }
            return null;
          }, this)
        },
        onBeforeCompute: function(node) {
          Log.write("centering " + node.name + "...");
          return null;
        },
        onAfterCompute: function() {
          Log.write("done");
          return null;
        },
        onCreateLabel: __bind(function(domElement, node) {
          domElement.innerHTML = node.name;
          domElement.onclick = function() {
            var freshNode;
            johaRGraph.thisRGraph.onClick(node.id);
            freshNode = johaRGraph.freshNode(node);
            johaRGraph.afterNodeClickCallback(freshNode);
            return null;
          };
          return null;
        }, this),
        onPlaceLabel: function(domElement, node) {
          var left, style, w;
          style = domElement.style;
          style.display = '';
          style.cursor = 'pointer';
          if (node._depth <= 1) {
            style.fontSize = "0.8em";
            style.color = "#ccc";
          } else if (node._depth === 2) {
            style.fontSize = "0.7em";
            style.color = "#494949";
          } else {
            style.display = 'none';
          }
          left = parseInt(style.left);
          w = domElement.offsetWidth;
          style.left = (left - w / 2) + 'px';
          return null;
        }
      };
      return johaRGraphDefaults;
    };
    return JohaGraph;
  })();
  root.makeJohaRGraph = makeJohaRGraph;
  root.JohaGraph = JohaGraph;
}).call(this);
}, "extend": function(exports, require, module) {(function() {
  var deepExtend, root;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  deepExtend = function() {
    var extenders, key, object, other, val, _i, _len;
    object = arguments[0], extenders = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (!(object != null)) {
      return {};
    }
    for (_i = 0, _len = extenders.length; _i < _len; _i++) {
      other = extenders[_i];
      for (key in other) {
        if (!__hasProp.call(other, key)) continue;
        val = other[key];
        if (!(object[key] != null) || typeof val !== "object") {
          object[key] = val;
        } else {
          object[key] = deepExtend(object[key], val);
        }
      }
    }
    return object;
  };
  root.extend = deepExtend;
}).call(this);
}, "onDomReady": function(exports, require, module) {(function() {
  var JohaNodeEditor, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  console.log('onDomReady Script Loaded');
  JohaNodeEditor = require('JohaNodeEditor').JohaNodeEditor;
  $(function() {
    var clearButtonDom, clearButtonHtml, domData, newNode, nodeData, saveButtonDom, saveButtonHtml;
    console.log('JohaNode Doc Ready');
    nodeData = {
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
    nodeData = {
      id: 'id-test2',
      label: 'short basic data test',
      a_string: 'abc',
      a_simple_array: ['A', 'B', 'C'],
      a_simple_obj: {
        a: 'AA'
      },
      links: {
        'http://www.google.com': 'google',
        'http://www.yahoo.com': 'yahoo'
      },
      a_complex_obj: {
        h: {
          hh: [
            'i', 'j', {
              k: 'K'
            }
          ]
        }
      },
      attached_files: ['file1.txt', 'file2.txt']
    };
    newNode = new JohaNodeEditor(nodeData);
    domData = newNode.view();
    console.log('domData:', domData);
    $('#data').append(domData);
    saveButtonHtml = "<button type='button'>Save</button>";
    saveButtonDom = $(saveButtonHtml);
    $('#save').append(saveButtonDom);
    saveButtonDom.click(__bind(function() {
      var current_json;
      current_json = JSON.stringify(newNode.currentValue());
      return $.ajax({
        type: 'GET',
        url: '/json_echo',
        data: {
          json: current_json
        },
        success: function(new_json) {
          $('#data').empty();
          newNode = new JohaNodeEditor(new_json);
          domData = newNode.view();
          return $('#data').append(domData);
        }
      });
    }, this));
    clearButtonHtml = "<button type='button'>Clear Edits</button>";
    clearButtonDom = $(clearButtonHtml);
    $('#save').append(clearButtonDom);
    return clearButtonDom.click(__bind(function() {
      var editClass, editClasses, _i, _len, _results;
      editClasses = ['joha-delete', 'joha-update', 'joha-create'];
      _results = [];
      for (_i = 0, _len = editClasses.length; _i < _len; _i++) {
        editClass = editClasses[_i];
        newNode = new JohaNodeEditor(newNode.origValue());
        domData = newNode.view();
        $('#data').empty();
        _results.push($('#data').append(domData));
      }
      return _results;
    }, this));
  });
  /*
  #Working with dynJsonContainers
  dynJson = require 'dynJsonContainers'
  root.RootValueContainer = dynJson.RootValueContainer
  root.$j = $
  
  #JNE = require 'JohaNodeEditor'
  
  $ ->
    console.log($)
    #JohaNodeEditor = JNE.JohaNodeEditor
    console.log('Doc Ready')
    x = new RootValueContainer {akv: ['a', {x: 'X'}, ['aa', 'bb']]}
    console.log x.valueContainer
    console.log x.origValue
    x.view()
    calcBtnHtml = "<button type='button'>Current Value</button>"
    calcBtnDom = $(calcBtnHtml)
    calcBtnDom.click ->
      cv = x.currentValue()
      console.log cv
      alert JSON.stringify(cv)
    $('body').append(calcBtnDom)*/
}).call(this);
}, "johaComponents": function(exports, require, module) {(function() {
  var $, AddButtonBase, ArrayDataEntryForm, AttachmentForm, DataEntryFormBase, DeleteButtonBase, EditButtonBase, LinksDataEntryForm, ObjectDataEntryForm, UiControlBase, createTags, deepExtend, editBtnBase, extend, fileAttachmentButtons, fileAttachmentForm, iframeUploader, root, wrapHtml;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $ = $ || window.$ || window.$j;
  deepExtend = function() {
    var extenders, key, object, other, val, _i, _len;
    object = arguments[0], extenders = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (!(object != null)) {
      return {};
    }
    for (_i = 0, _len = extenders.length; _i < _len; _i++) {
      other = extenders[_i];
      for (key in other) {
        if (!__hasProp.call(other, key)) continue;
        val = other[key];
        if (!(object[key] != null) || typeof val !== "object") {
          object[key] = val;
        } else {
          object[key] = deepExtend(object[key], val);
        }
      }
    }
    return object;
  };
  extend = deepExtend;
  createTags = function(tagText, attrs) {
    var tags;
    tags = {};
    tags.open = '<' + tagText + ' ' + attrs + '>';
    tags.close = '</' + tagText + '>';
    return tags;
  };
  wrapHtml = function(tagName, wrapText, attrs) {
    var html, tags;
    attrs = attrs || '';
    wrapText = wrapText || (wrapText = '');
    tags = createTags(tagName, attrs);
    return html = tags.open + wrapText + tags.close;
  };
  DataEntryFormBase = (function() {
    function DataEntryFormBase(parentObj, onClickCallback, options) {
      var buttonDom, buttonHtml, defaultOptions, defaultUpdateFn, formDom, formHtml, formLabel, formLabelDom, hideButtonDom, hideButtonHtml;
      defaultUpdateFn = function(e) {
        console.log("DataEntryFormBase updateFn not overwritten");
        return onClickCallback(parentObj, null);
      };
      defaultOptions = {
        formLabel: "Enter Data",
        updateFn: defaultUpdateFn
      };
      options = extend(defaultOptions, options);
      formHtml = wrapHtml('form');
      formLabel = wrapHtml('span', options.formLabel);
      buttonHtml = wrapHtml('button', 'Update', "type='submit'");
      hideButtonHtml = wrapHtml('button', 'Hide', "type='button'");
      formDom = $(formHtml);
      formLabelDom = $(formLabel);
      buttonDom = $(buttonHtml);
      hideButtonDom = $(hideButtonHtml);
      formDom.append(formLabelDom);
      formDom.append(buttonDom);
      formDom.append(hideButtonDom);
      this.formDom = formDom;
      buttonDom.click(__bind(function(e) {
        e.preventDefault();
        return options.updateFn();
      }, this));
      hideButtonDom.click(__bind(function(e) {
        return formDom.hide();
      }, this));
    }
    DataEntryFormBase.prototype.get = function() {
      return this.formDom;
    };
    return DataEntryFormBase;
  })();
  ArrayDataEntryForm = (function() {
    __extends(ArrayDataEntryForm, DataEntryFormBase);
    function ArrayDataEntryForm(arrayObj, onClickCallback) {
      var buttonHtml, inputDom, inputHtml, myUpdateFn, options;
      myUpdateFn = function(e) {
        var dataEntered;
        dataEntered = inputDom.val();
        return onClickCallback(arrayObj, dataEntered);
      };
      options = {
        formLabel: 'New Value for Array Item:',
        updateFn: myUpdateFn
      };
      ArrayDataEntryForm.__super__.constructor.call(this, arrayObj, onClickCallback, options);
      inputHtml = wrapHtml('input', '', "type='text' name='array_item'");
      inputDom = $(inputHtml);
      buttonHtml = "<button type='submit'>Update</button>";
      this.formDom.append(inputDom);
    }
    return ArrayDataEntryForm;
  })();
  ObjectDataEntryForm = (function() {
    __extends(ObjectDataEntryForm, DataEntryFormBase);
    function ObjectDataEntryForm(objCont, onClickCallback) {
      var keyInputDom, keyInputHtml, keyLabel, keyLabelDom, myUpdateFn, options, valInputDom, valInputHtml, valLabel, valLabelDom;
      myUpdateFn = function(e) {
        var dataEntered;
        dataEntered = {};
        dataEntered["key"] = keyInputDom.val();
        dataEntered["val"] = valInputDom.val();
        return onClickCallback(objCont, dataEntered);
      };
      options = {
        formLabel: 'New Key-Value for Object Item:',
        updateFn: myUpdateFn
      };
      ObjectDataEntryForm.__super__.constructor.call(this, objCont, onClickCallback, options);
      keyLabel = wrapHtml('span', 'Key:');
      valLabel = wrapHtml('span', 'Value:');
      keyInputHtml = wrapHtml('input', '', "type='text' name='key_item'");
      valInputHtml = wrapHtml('input', '', "type='text' name='val_item'");
      keyLabelDom = $(keyLabel);
      valLabelDom = $(valLabel);
      keyInputDom = $(keyInputHtml);
      valInputDom = $(valInputHtml);
      this.formDom.append(keyLabelDom);
      this.formDom.append(keyInputDom);
      this.formDom.append(valLabelDom);
      this.formDom.append(valInputDom);
    }
    return ObjectDataEntryForm;
  })();
  LinksDataEntryForm = (function() {
    __extends(LinksDataEntryForm, DataEntryFormBase);
    function LinksDataEntryForm(linkCont, onClickCallback) {
      var labelInputDom, labelInputHtml, labelLabel, labelLabelDom, myUpdateFn, options, urlInputDom, urlInputHtml, urlLabel, urlLabelDom;
      myUpdateFn = function(e) {
        var dataEntered;
        dataEntered = {};
        dataEntered["url"] = urlInputDom.val();
        dataEntered["label"] = labelInputDom.val();
        return onClickCallback(linkCont, dataEntered);
      };
      options = {
        formLabel: 'Add New Link:',
        updateFn: myUpdateFn
      };
      LinksDataEntryForm.__super__.constructor.call(this, linkCont, onClickCallback, options);
      urlLabel = wrapHtml('span', 'Url:');
      labelLabel = wrapHtml('span', 'Label:');
      urlInputHtml = wrapHtml('input', '', "type='text' name='url_item'");
      labelInputHtml = wrapHtml('input', '', "type='text' name='label_item'");
      urlLabelDom = $(urlLabel);
      labelLabelDom = $(labelLabel);
      urlInputDom = $(urlInputHtml);
      labelInputDom = $(labelInputHtml);
      this.formDom.append(urlLabelDom);
      this.formDom.append(urlInputDom);
      this.formDom.append(labelLabelDom);
      this.formDom.append(labelInputDom);
    }
    return LinksDataEntryForm;
  })();
  iframeUploader = function(name) {
    var iframeDom, iframeHtml;
    iframeHtml = wrapHtml('iframe');
    iframeDom = $(iframeHtml);
    iframeDom.attr('id', name);
    iframeDom.attr('name', name);
    iframeDom.attr('src', '');
    iframeDom.hide();
    return iframeDom;
  };
  fileAttachmentButtons = function() {
    var controls, controlsDom, uploadAttach, uploadAttachDom;
    controls = wrapHtml('div');
    uploadAttach = wrapHtml('button', 'Upload to Node');
    controlsDom = $(controls);
    uploadAttachDom = $(uploadAttach);
    controlsDom.append(uploadAttachDom);
    return controlsDom;
  };
  fileAttachmentForm = function(iframeName, formId, callbackFn) {
    var container, containerDom, controlsDom, fileChContStyle, fileChStyle, fileChUIStyle, fileChooser, fileChooserCont, fileChooserContDom, fileChooserDom, fileChooserUI, fileChooserUIDom, iframeDom, labelWrapper, labelWrapperDom;
    this.callbackFn = callbackFn;
    container = wrapHtml('div');
    labelWrapper = wrapHtml('div');
    fileChooser = wrapHtml('input');
    fileChooserUI = wrapHtml('button', 'Add Files');
    fileChooserCont = wrapHtml('div');
    containerDom = $(container);
    labelWrapperDom = $(labelWrapper);
    fileChooserDom = $(fileChooser);
    fileChooserUIDom = $(fileChooserUI);
    fileChooserContDom = $(fileChooserCont);
    fileChContStyle = {
      position: 'relative'
    };
    fileChUIStyle = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      'z-index': '1'
    };
    fileChStyle = {
      position: 'relative',
      'text-align': 'right',
      '-moz-opacity': '0',
      filter: 'alpha(opacity: 0)',
      opacity: '0',
      'z-index': '2'
    };
    fileChooserDom.attr('id', 'joha-file-chooser');
    fileChooserDom.attr('name', 'add_files[]');
    fileChooserDom.attr('type', 'file');
    fileChooserDom.attr('multiple', 'multiple');
    fileChooserDom.css(fileChStyle);
    fileChooserDom.addClass('new-files');
    fileChooserUIDom.css(fileChUIStyle);
    fileChooserContDom.css(fileChContStyle);
    fileChooserContDom.append(fileChooserDom);
    fileChooserContDom.append(fileChooserUIDom);
    containerDom.append(fileChooserContDom);
    fileChooserDom.change(__bind(function() {
      var fileItem, fileList, filename, filenames;
      fileList = fileChooserDom.get(0).files;
      filenames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = fileList.length; _i < _len; _i++) {
          fileItem = fileList[_i];
          filename = fileItem.fileName;
          _results.push(filename);
        }
        return _results;
      })();
      this.callbackFn(fileList);
      return fileChooserDom.val("");
    }, this));
    containerDom;
    controlsDom = fileAttachmentButtons();
    containerDom.append(controlsDom);
    iframeDom = iframeUploader(iframeName);
    containerDom.append(iframeDom);
    return containerDom;
  };
  AttachmentForm = (function() {
    function AttachmentForm(formId, uploadUrl, iframeTarget, newFilesCallbackFn, uploadFn) {
      this.updateNodeId = __bind(this.updateNodeId, this);
      this.get = __bind(this.get, this);      var fileAttachmentFormDom, formDom, formHtml, nodeIdHtml;
      formHtml = wrapHtml('form');
      formDom = $(formHtml);
      formDom.attr('id', formId);
      formDom.attr('action', uploadUrl);
      formDom.attr('method', 'post');
      formDom.attr('enctype', 'multipart/form-data');
      formDom.attr('target', iframeTarget);
      formDom.submit(__bind(function(e) {
        uploadFn(formDom);
        return false;
      }, this));
      nodeIdHtml = wrapHtml('input');
      this.nodeIdDom = $(nodeIdHtml);
      this.nodeIdDom.attr('id', 'joha-attachment-node-id');
      this.nodeIdDom.attr('name', 'node_id');
      this.nodeIdDom.attr('type', 'hidden');
      this.nodeIdDom.attr('value', ' ');
      formDom.append(this.nodeIdDom);
      fileAttachmentFormDom = fileAttachmentForm(iframeTarget, formId, newFilesCallbackFn);
      formDom.append(fileAttachmentFormDom);
      this.formDom = formDom;
    }
    AttachmentForm.prototype.get = function() {
      return this.formDom;
    };
    AttachmentForm.prototype.updateNodeId = function(nodeId) {
      return this.nodeIdDom.attr('value', nodeId);
    };
    return AttachmentForm;
  })();
  UiControlBase = (function() {
    function UiControlBase(options) {
      var dom, htmlBase, noopFn, timeOutFn;
      this.options = options;
      this.targetId = options.targetId || "";
      this.tag = options.tag || "span";
      this.text = options.text || "";
      this.uiClasses = options.uiClasses || "";
      noopFn = function() {
        return alert("No Function Defined");
      };
      this.clickFn = options.clickFn || noopFn;
      htmlBase = wrapHtml(this.tag, this.text);
      dom = $(htmlBase);
      dom.addClass(this.uiClasses);
      timeOutFn = function(editedDom) {
        return editedDom.removeClass('selected');
      };
      dom.click(__bind(function() {
        var editedDom;
        editedDom = $('#' + this.targetId);
        editedDom.addClass('selected');
        window.setTimeout((function() {
          return timeOutFn(editedDom);
        }), 1500);
        return this.clickFn(this.targetId);
      }, this));
      this.dom = dom;
    }
    UiControlBase.prototype.get = function() {
      return this.dom;
    };
    return UiControlBase;
  })();
  editBtnBase = function(id) {
    var altText, close, editBtnDom, open, tag;
    tag = 'span';
    open = '<' + tag + '>';
    close = '</' + tag + '>';
    altText = 'edit';
    editBtnDom = $(open + altText + close);
    if (id) {
      editBtnDom.attr("id", id);
    }
    editBtnDom.addClass('edit-btn ui-icon ui-icon-pencil');
    return editBtnDom;
  };
  AddButtonBase = (function() {
    __extends(AddButtonBase, UiControlBase);
    function AddButtonBase(editArgs) {
      var onClickFn, options, targetId, uiClasses;
      targetId = editArgs.targetId;
      onClickFn = editArgs.addFn;
      uiClasses = 'add-btn ui-icon ui-icon-plus';
      options = {
        targetId: targetId,
        text: "add",
        uiClasses: uiClasses,
        clickFn: onClickFn
      };
      AddButtonBase.__super__.constructor.call(this, options);
    }
    return AddButtonBase;
  })();
  EditButtonBase = (function() {
    __extends(EditButtonBase, UiControlBase);
    function EditButtonBase(editArgs) {
      var onClickFn, options, targetId, uiClasses;
      targetId = editArgs.targetId;
      onClickFn = editArgs.editFn;
      uiClasses = 'edit-btn ui-icon ui-icon-pencil';
      options = {
        targetId: targetId,
        text: "edit",
        uiClasses: uiClasses,
        clickFn: onClickFn
      };
      EditButtonBase.__super__.constructor.call(this, options);
    }
    return EditButtonBase;
  })();
  DeleteButtonBase = (function() {
    __extends(DeleteButtonBase, UiControlBase);
    function DeleteButtonBase(delArgs) {
      var onClickFn, options, targetId, uiClasses;
      targetId = delArgs.targetId;
      onClickFn = delArgs.delFn;
      uiClasses = 'delete-btn ui-icon ui-icon-close';
      options = {
        targetId: targetId,
        text: "del",
        uiClasses: uiClasses,
        clickFn: onClickFn
      };
      DeleteButtonBase.__super__.constructor.call(this, options);
    }
    return DeleteButtonBase;
  })();
  root.AddButtonBase = AddButtonBase;
  root.EditButtonBase = EditButtonBase;
  root.DeleteButtonBase = DeleteButtonBase;
  root.ArrayDataEntryForm = ArrayDataEntryForm;
  root.ObjectDataEntryForm = ObjectDataEntryForm;
  root.LinksDataEntryForm = LinksDataEntryForm;
  root.AttachmentForm = AttachmentForm;
  root.wrapHtml = wrapHtml;
}).call(this);
}, "forf": function(exports, require, module) {(function() {
  var arrayContains, arrayContainsAll, arrayIntersection, arrayRemoveItem, arrayRemoveSet, arraySubtract, deepEquiv, deepExtend, diff, equiv, getKeys, getType, getValues, objKeyPosition, objSize, root;
  var __hasProp = Object.prototype.hasOwnProperty, __slice = Array.prototype.slice;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  getKeys = function(obj) {
    var key, keys, _results;
    _results = [];
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      _results.push(keys = key);
    }
    return _results;
  };
  root.getKeys = getKeys;
  getValues = function(obj) {
    var key, val, _results;
    _results = [];
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      val = obj[key];
      _results.push(obj[key]);
    }
    return _results;
  };
  root.getValues = getValues;
  deepEquiv = function(obj1, obj2) {
    var str_obj1, str_obj2;
    str_obj1 = JSON.stringify(obj1);
    str_obj2 = JSON.stringify(obj2);
    return str_obj1 === str_obj2;
  };
  equiv = function(obj1, obj2) {
    if (obj1 === obj2) {
      return true;
    } else {
      if (deepEquiv(obj1, obj2)) {
        return true;
      }
    }
    return false;
  };
  root.equiv = equiv;
  diff = function(obj1, obj2) {
    var key, memo, val;
    for (key in obj1) {
      if (!__hasProp.call(obj1, key)) continue;
      val = obj1[key];
      memo = memo || {};
      if (!equiv(obj1[key], obj2[key])) {
        memo[key] = [obj1[key], obj2[key]];
      }
    }
    return memo;
  };
  root.diff = diff;
  arrayContains = function(a, obj) {
    var item, _i, _len;
    for (_i = 0, _len = a.length; _i < _len; _i++) {
      item = a[_i];
      if (equiv(item, obj)) {
        return true;
      }
    }
    return false;
  };
  root.arrayContains = arrayContains;
  arrayIntersection = function(a1, a2) {
    var compr, intersects, item, iter, _i, _len;
    intersects = [];
    if (a2.length > a1.length) {
      iter = a2;
      compr = a1;
    } else {
      iter = a1;
      compr = a2;
    }
    for (_i = 0, _len = iter.length; _i < _len; _i++) {
      item = iter[_i];
      if (arrayContains(compr, item)) {
        if (!arrayContains(intersects, item)) {
          intersects.push(item);
        }
      }
      null;
    }
    return intersects;
  };
  root.arrayIntersection = arrayIntersection;
  arrayRemoveItem = function(a, obj) {
    var idx, item, _i, _len;
    for (_i = 0, _len = a.length; _i < _len; _i++) {
      item = a[_i];
      if (item === obj) {
        idx = a.indexOf(obj);
        a.splice(idx, 1);
      }
    }
    return a;
  };
  root.arrayRemoveItem = arrayRemoveItem;
  arrayRemoveSet = function(a, objs) {
    var obj, _i, _len;
    if (a === void 0) {
      throw "arrayRemoveSet remove items from a non existent array";
    }
    for (_i = 0, _len = objs.length; _i < _len; _i++) {
      obj = objs[_i];
      arrayRemoveItem(a, obj);
      null;
    }
    return a;
  };
  root.arrayRemoveSet = arrayRemoveSet;
  arraySubtract = function(srcAry, opAry) {
    var item, remaining, _i, _len;
    remaining = [];
    for (_i = 0, _len = srcAry.length; _i < _len; _i++) {
      item = srcAry[_i];
      if (!arrayContains(opAry, item)) {
        if (!arrayContains(remaining, item)) {
          remaining.push(item);
        }
      }
      null;
    }
    return remaining;
  };
  root.arraySubtract = arraySubtract;
  arrayContainsAll = function(a, subset) {
    var item, retVal, _i, _len;
    retVal = true;
    for (_i = 0, _len = subset.length; _i < _len; _i++) {
      item = subset[_i];
      if (!arrayContains(a, item)) {
        retVal = false;
      }
    }
    return retVal;
  };
  root.arrayContainsAll = arrayContainsAll;
  objKeyPosition = function(obj, key) {
    var i, k;
    i = 0;
    for (k in obj) {
      if (deepEquiv(k, key)) {
        return i;
      }
      i += 1;
    }
  };
  root.objKeyPosition = objKeyPosition;
  objSize = function(obj) {
    var key, size;
    size = 0;
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      size++;
    }
    return size;
  };
  root.objSize = objSize;
  getType = function(obj) {
    if (obj === null) {
      return '[object Null]';
    }
    return Object.prototype.toString.call(obj);
  };
  root.getType = getType;
  deepExtend = function() {
    var extenders, key, object, other, val, _i, _len;
    object = arguments[0], extenders = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (!(object != null)) {
      return {};
    }
    for (_i = 0, _len = extenders.length; _i < _len; _i++) {
      other = extenders[_i];
      for (key in other) {
        if (!__hasProp.call(other, key)) continue;
        val = other[key];
        if (!(object[key] != null) || typeof val !== "object") {
          object[key] = val;
        } else {
          object[key] = deepExtend(object[key], val);
        }
      }
    }
    return object;
  };
  root.extend = deepExtend;
}).call(this);
}, "JohaNodeFields": function(exports, require, module) {(function() {
  var $, BasicValueContainerNoDel, FilesContainer, IdBinder, LinksContainer, NodeField, NodeFilesField, NodeIdField, NodeJsonField, NodeLabelField, NodeLinksField, RootValueContainer, dynJc, getType, johaChangeTrigger, johaComp, johaEditClass, nodeFieldFactory, root, wrapHtml;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  $ = $ || window.$ || window.$j;
  dynJc = require('dynJsonContainers');
  RootValueContainer = dynJc.RootValueContainer;
  BasicValueContainerNoDel = dynJc.BasicValueContainerNoDel;
  FilesContainer = dynJc.FilesContainer;
  LinksContainer = dynJc.LinksContainer;
  johaEditClass = dynJc.johaEditClass;
  johaChangeTrigger = dynJc.johaChangeTrigger;
  johaComp = require('johaComponents');
  wrapHtml = johaComp.wrapHtml;
  IdBinder = require('IdTrackerSingleton').IdBinder;
  root.johaEditClass = johaEditClass;
  root.johaChangeTrigger = johaChangeTrigger;
  getType = require('forf').getType;
  NodeField = (function() {
    function NodeField() {
      var idBinder;
      idBinder = IdBinder.get();
      this.fieldDomId = idBinder.assignId(this);
      this.fieldClass = 'joha-field';
      this.fieldNameClass = 'field-name';
    }
    return NodeField;
  })();
  NodeJsonField = (function() {
    __extends(NodeJsonField, NodeField);
    function NodeJsonField(fieldName, fieldValue) {
      var labelHtml;
      this.fieldName = fieldName;
      this.fieldValue = fieldValue;
      this.currentValue = __bind(this.currentValue, this);
      NodeJsonField.__super__.constructor.call(this);
      this.jsonClass = 'field-json';
      this.labelClass = 'joha-label';
      this.jsonContainer = new RootValueContainer(this.fieldValue);
      this.origValue = this.jsonContainer.origValue;
      labelHtml = '<span>' + this.fieldName + '</span>';
      this.labelName = $(labelHtml);
      this.labelName.addClass(this.jsonClass);
      this.labelName.addClass(this.labelClass);
    }
    NodeJsonField.prototype.currentValue = function() {
      return this.jsonContainer.currentValue();
    };
    NodeJsonField.prototype.view = function() {
      var cont, label, val;
      label = this.labelName;
      cont = $('<div />');
      cont.attr("id", this.fieldDomId);
      cont.addClass(this.fieldClass);
      cont.addClass(this.jsonClass);
      val = this.jsonContainer.view();
      cont.append(label);
      cont.append(val);
      return cont;
    };
    return NodeJsonField;
  })();
  NodeIdField = (function() {
    __extends(NodeIdField, NodeField);
    function NodeIdField(fieldName, fieldValue) {
      this.fieldName = fieldName;
      this.fieldValue = fieldValue;
      NodeIdField.__super__.constructor.call(this);
      this.idClass = 'field-id';
      this.idFieldValue = String(this.fieldValue);
      this.origValue = this.idFieldValue;
    }
    NodeIdField.prototype.currentValue = function() {
      return this.idFieldValue;
    };
    NodeIdField.prototype.view = function() {
      var html, idCont, nameHtml, valueHtml;
      nameHtml = '<span>' + this.fieldName + '</span>';
      valueHtml = '<span>' + this.idFieldValue + '</span>';
      html = '<div>' + nameHtml + valueHtml + '</div>';
      idCont = $(html);
      idCont.addClass(this.fieldClass);
      return idCont.addClass(this.idClass);
    };
    return NodeIdField;
  })();
  NodeLabelField = (function() {
    __extends(NodeLabelField, NodeField);
    function NodeLabelField(fieldName, fieldValue) {
      this.fieldName = fieldName;
      this.fieldValue = fieldValue;
      this.currentValue = __bind(this.currentValue, this);
      NodeLabelField.__super__.constructor.call(this);
      this.labelClass = 'field-label';
      this.labelFieldValue = String(this.fieldValue);
      this.origValue = this.labelFieldValue;
      this.labelName = $('<span>' + this.fieldName + '</span>');
      this.labelName.addClass(this.className + '-label');
      this.labelContainer = new BasicValueContainerNoDel(this.fieldValue);
    }
    NodeLabelField.prototype.currentValue = function() {
      return this.labelContainer.currentValue();
    };
    NodeLabelField.prototype.view = function() {
      var cont, label, val;
      label = this.labelName;
      cont = $('<div />');
      val = this.labelContainer.view();
      cont.addClass(this.fieldClass);
      cont.addClass(this.labelClass);
      cont.append(label);
      cont.append(val);
      return cont;
    };
    return NodeLabelField;
  })();
  NodeFilesField = (function() {
    __extends(NodeFilesField, NodeField);
    function NodeFilesField(fieldName, fieldValue, nodeId) {
      var valType;
      this.fieldName = fieldName;
      this.fieldValue = fieldValue;
      this.currentValue = __bind(this.currentValue, this);
      NodeFilesField.__super__.constructor.call(this);
      this.filesClass = 'field-files';
      valType = getType(this.fieldValue);
      this.files = valType === '[object Array]' ? this.fieldValue : [this.fieldValue];
      this.filesContainer = new FilesContainer(this.files, nodeId);
      this.origValue = this.fieldValue;
    }
    NodeFilesField.prototype.currentValue = function() {
      return this.filesContainer.currentValue();
    };
    NodeFilesField.prototype.view = function() {
      return this.filesContainer.view();
    };
    return NodeFilesField;
  })();
  NodeLinksField = (function() {
    __extends(NodeLinksField, NodeField);
    function NodeLinksField(fieldName, fieldValue) {
      var valType;
      this.fieldName = fieldName;
      this.fieldValue = fieldValue;
      this.view = __bind(this.view, this);
      NodeLinksField.__super__.constructor.call(this);
      this.linksClass = 'field-links';
      valType = getType(this.fieldValue);
      this.links = valType === '[object Object]' ? this.fieldValue : {};
      this.linksContainer = new LinksContainer(this.links);
      this.origValue = this.fieldValue;
    }
    NodeLinksField.prototype.currentValue = function() {
      return this.linksContainer.currentValue();
    };
    NodeLinksField.prototype.view = function() {
      var linksDom;
      linksDom = this.linksContainer.view();
      linksDom.addClass(this.fieldClass);
      return linksDom.addClass(this.linksClass);
    };
    return NodeLinksField;
  })();
  nodeFieldFactory = function(fieldName, fieldValue, nodeId) {
    var nodeField;
    nodeField = (function() {
      switch (fieldName) {
        case 'id':
          return new NodeIdField(fieldName, fieldValue);
        case 'label':
          return new NodeLabelField(fieldName, fieldValue);
        case 'attached_files':
          return new NodeFilesField(fieldName, fieldValue, nodeId);
        case 'links':
          return new NodeLinksField(fieldName, fieldValue);
        default:
          return new NodeJsonField(fieldName, fieldValue);
      }
    })();
    return nodeField;
  };
  root.nodeFieldFactory = nodeFieldFactory;
}).call(this);
}});
