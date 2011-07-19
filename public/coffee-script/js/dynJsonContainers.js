(function() {
  var ArrayValueContainer, BasicValueContainer, KeyValue, ObjectValueContainer, RootValueContainer, ValueContainerBase, root, valueContainerFactory, _SingletonBinder;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  root.IdBinder = (function() {
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
      this.args = args;
      this.ids = {};
      this.nextId = 0;
      this.idPrefix = 'johaIdBinder-';
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
  valueContainerFactory = function(value) {
    var basicType, basicTypes, complexTypes, valType, _i, _len;
    basicTypes = ['string', 'number', 'boolean', 'undefined', 'null'];
    complexTypes = ['array', 'object'];
    valType = typeof value;
    console.log('Factory', value, valType);
    for (_i = 0, _len = basicTypes.length; _i < _len; _i++) {
      basicType = basicTypes[_i];
      if (valType === basicType) {
        return new BasicValueContainer(value, 'basic');
      }
    }
    if (valType === 'object' && value instanceof Array) {
      return new ArrayValueContainer(value, 'array');
    }
    if (valType === 'object') {
      return new ObjectValueContainer(value, 'object');
    }
    return 'valType: ' + valType + 'is unknown';
  };
  ValueContainerBase = (function() {
    function ValueContainerBase(value, containerType) {
      var idBinder;
      this.value = value;
      this.containerType = containerType;
      this.curValue = this.value;
      this.origValue = this.value;
      idBinder = root.IdBinder.get();
      this.domId = idBinder.assignId(this);
    }
    ValueContainerBase.prototype.jsonType = function() {
      return typeof this.value;
    };
    return ValueContainerBase;
  })();
  BasicValueContainer = (function() {
    __extends(BasicValueContainer, ValueContainerBase);
    function BasicValueContainer() {
      this.view = __bind(this.view, this);
      this.currentValue = __bind(this.currentValue, this);
      this.modify = __bind(this.modify, this);
      BasicValueContainer.__super__.constructor.apply(this, arguments);
    }
    BasicValueContainer.prototype.modify = function(newVal) {
      return this.curValue = newVal;
    };
    BasicValueContainer.prototype.currentValue = function() {
      return this.curValue;
    };
    BasicValueContainer.prototype.view = function() {
      var div, divHtml, edit, editHtml;
      divHtml = "<div id='" + this.domId + "-div'>" + this.curValue + "</div>";
      editHtml = "<input type'text' id='" + this.domId + "' value='" + this.curValue + "'/>";
      edit = $(editHtml);
      edit.change(__bind(function() {
        var newVal;
        console.log('CCB', this.curValue);
        newVal = $('#' + this.domId).val();
        this.modify(newVal);
        return console.log('CCB', this.curValue);
      }, this));
      div = $(divHtml);
      return div.append(edit);
    };
    return BasicValueContainer;
  })();
  ArrayValueContainer = (function() {
    __extends(ArrayValueContainer, ValueContainerBase);
    function ArrayValueContainer(value, containerType) {
      var val;
      this.value = value;
      this.containerType = containerType;
      this.currentValue = __bind(this.currentValue, this);
      this.view = __bind(this.view, this);
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
    }
    ArrayValueContainer.prototype.view = function() {
      var av, child, _i, _len, _ref;
      av = $('<div>Arrays</div>');
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        av.append(child.view());
        null;
      }
      return av;
    };
    ArrayValueContainer.prototype.currentValue = function() {
      var child, cv;
      return cv = (function() {
        var _i, _len, _ref, _results;
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.currentValue());
        }
        return _results;
      }).call(this);
    };
    return ArrayValueContainer;
  })();
  KeyValue = (function() {
    __extends(KeyValue, ValueContainerBase);
    function KeyValue(key, val) {
      this.key = key;
      this.val = val;
      this.currentValue = __bind(this.currentValue, this);
      this.view = __bind(this.view, this);
      this.keyContainer = valueContainerFactory(this.key);
      this.valContainer = valueContainerFactory(this.val);
      console.log('KV', this.val, this.valContainer, this.valContainer.view());
    }
    KeyValue.prototype.view = function() {
      var k, kv, v;
      kv = $('<div>Key-Value</div>');
      k = $('<div>Key</div>');
      kv.append(k);
      k.append(this.keyContainer.view());
      v = $('<div>Val</div>');
      kv.append(v);
      v.append(this.valContainer.view());
      return kv;
    };
    KeyValue.prototype.currentValue = function() {
      var kvVal;
      kvVal = {};
      kvVal[this.keyContainer.currentValue()] = this.valContainer.currentValue();
      return kvVal;
    };
    return KeyValue;
  })();
  ObjectValueContainer = (function() {
    __extends(ObjectValueContainer, ValueContainerBase);
    function ObjectValueContainer(objValue, containerType) {
      var key, kv, val;
      this.objValue = objValue;
      this.containerType = containerType;
      this.currentValue = __bind(this.currentValue, this);
      this.view = __bind(this.view, this);
      this.kvChildren = (function() {
        var _ref, _results;
        _ref = this.objValue;
        _results = [];
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          val = _ref[key];
          kv = {};
          kv[key] = val;
          _results.push(new KeyValue(key, val));
        }
        return _results;
      }).call(this);
      ObjectValueContainer.__super__.constructor.call(this, this.objValue);
    }
    ObjectValueContainer.prototype.view = function() {
      var kvChild, obj, _i, _len, _ref;
      obj = $('<div>Object</div>');
      _ref = this.kvChildren;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        kvChild = _ref[_i];
        obj.append(kvChild.view());
        null;
      }
      return obj;
    };
    ObjectValueContainer.prototype.currentValue = function() {
      var cv, kvChild;
      return cv = (function() {
        var _i, _len, _ref, _results;
        _ref = this.kvChildren;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          kvChild = _ref[_i];
          _results.push(kvChild.currentValue());
        }
        return _results;
      }).call(this);
    };
    return ObjectValueContainer;
  })();
  RootValueContainer = (function() {
    function RootValueContainer(value, options) {
      this.value = value;
      this.currentValue = __bind(this.currentValue, this);
      options || (options = {});
      this.injectInto = options['injectInto'] || 'data';
      console.log('root value:', this.value);
      this.valueContainer = valueContainerFactory(this.value);
      this.origValue = this.valueContainer.origValue;
    }
    RootValueContainer.prototype.view = function() {
      var domInjectInto, labelHtml, viewDom;
      labelHtml = "<span>" + 'data container' + "</span>";
      viewDom = $('<div />').append($(labelHtml));
      console.log(this.valueContainer.view());
      domInjectInto = $('#' + this.injectInto);
      domInjectInto.append(viewDom);
      return viewDom.append(this.valueContainer.view());
    };
    RootValueContainer.prototype.currentValue = function() {
      return this.valueContainer.currentValue();
    };
    return RootValueContainer;
  })();
  console.log('dynJsonContainerssss parsed');
  $(function() {
    var calcBtnDom, calcBtnHtml, x;
    console.log('Doc Ready');
    x = new RootValueContainer({
      akv: [
        'a', {
          x: 'X'
        }, ['aa', 'bb']
      ]
    });
    console.log(x.valueContainer);
    console.log(x.origValue);
    x.view();
    calcBtnHtml = "<button type='button'>Current Value</button>";
    calcBtnDom = $(calcBtnHtml);
    calcBtnDom.click(function() {
      var cv;
      cv = x.currentValue();
      console.log(cv);
      return alert(JSON.stringify(cv));
    });
    return $('body').append(calcBtnDom);
  });
  /*  
    domId = 'johaIdBinder-0'
    idBinder = root.IdBinder.get()
    valCont = idBinder.getBoundById(domId)
    valCont.modify('b')
    #x.valueContainer.modify('b')
    console.log 'Orig', x.valueContainer.origValue
    console.log 'Cur', x.valueContainer.curValue
    console.log 'Current', x.valueContainer.currentValue()
    x.view()*/
}).call(this);
