(function() {
  var Binder, Singleton, root;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  Singleton = (function() {
    var instance;
    function Singleton() {}
    instance = null;
    Singleton.get = function() {
      if (!(this.instance != null)) {
        instance = new this;
        instance.init();
      }
      return instance;
    };
    Singleton.prototype.init = function(name) {
      if (name == null) {
        name = "unknown";
      }
      return console.log("" + name + " initialized");
    };
    return Singleton;
  })();
  Binder = (function() {
    var binderData, initA, initB, _ref;
    __extends(Binder, Singleton);
    function Binder(labelA, labelB) {
      this.labelA = labelA;
      this.labelB = labelB;
    }
    binderData = {};
    _ref = [{}, {}], initA = _ref[0], initB = _ref[1];
    Binder.prototype.dataA = initA;
    Binder.prototype.dataB = initB;
    Binder.prototype.addA = function(aKey, aVal) {
      return this.dataA[aKey] = aVal;
    };
    Binder.prototype.addB = function(bKey, bVal) {
      return this.dataB[bKey] = bVal;
    };
    Binder.prototype.add = function(bindKey, label, val) {
      var addData;
      addData = {};
      addData[label] = val;
      return binderData[bindKey] = addData;
    };
    Binder.prototype.getBindings = function(keyData) {
      var a, b, newResult, result;
      result = {};
      newResult = binderData;
      a = this.dataA[keyData];
      b = this.dataB[keyData];
      result[this.labelA] = a;
      result[this.labelB] = b;
      result['new'] = binderData;
      return result;
    };
    Binder.prototype.getLabels = function() {
      return [this.labelA, this.labelB];
    };
    return Binder;
  })();
  root.Binder = Binder;
}).call(this);
