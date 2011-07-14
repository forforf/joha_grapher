(function() {
  var Binder, Singleton, deepExtend, root;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
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
    var binderData;
    __extends(Binder, Singleton);
    function Binder() {}
    binderData = {};
    Binder.prototype.add = function(bindKey, label, val) {
      var addData, bindData;
      addData = {};
      addData[label] = val;
      bindData = binderData[bindKey] || {};
      return binderData[bindKey] = deepExtend(bindData, addData);
    };
    Binder.prototype.getBindings = function(commonKey) {
      return binderData[commonKey];
    };
    Binder.prototype.getLabels = function(commonKey) {
      var binderObj, labels;
      binderObj = binderData[commonKey];
      return labels = (function() {
        var _results;
        _results = [];
        for (labels in binderObj) {
          _results.push(labels);
        }
        return _results;
      })();
    };
    return Binder;
  })();
  root.Binder = Binder;
}).call(this);
