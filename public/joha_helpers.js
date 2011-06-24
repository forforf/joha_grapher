(function() {
  var __hasProp = Object.prototype.hasOwnProperty;
  window.get_keys = function(obj) {
    var key, keys, _results;
    _results = [];
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      _results.push(keys = key);
    }
    return _results;
  };
  window.get_values = function(obj) {
    var key, val, _results;
    _results = [];
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      val = obj[key];
      _results.push(obj[key]);
    }
    return _results;
  };
  window.deep_equiv = function(obj1, obj2) {
    var str_obj1, str_obj2;
    str_obj1 = JSON.stringify(obj1);
    str_obj2 = JSON.stringify(obj2);
    return str_obj1 === str_obj2;
  };
  window.equiv = function(obj1, obj2) {
    if (obj1 === obj2) {
      return true;
    } else {
      if (deep_equiv(obj1, obj2)) {
        return true;
      }
    }
    return false;
  };
  window.array_contains = function(a, obj) {
    var item, _i, _len;
    for (_i = 0, _len = a.length; _i < _len; _i++) {
      item = a[_i];
      if (equiv(item, obj)) {
        return true;
      }
    }
    return false;
  };
  window.array_remove_item = function(a, obj) {
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
  window.array_contains_all = function(a, subset) {
    var item, retVal, _i, _len;
    retVal = true;
    for (_i = 0, _len = subset.length; _i < _len; _i++) {
      item = subset[_i];
      if (!array_contains(a, item)) {
        retVal = false;
      }
    }
    return retVal;
  };
  window.obj_key_position = function(obj, key) {
    var i, k;
    i = 0;
    for (k in obj) {
      if (deep_equiv(k, key)) {
        return i;
      }
      i += 1;
    }
  };
  window.objSize = function(obj) {
    var key, size;
    size = 0;
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      size++;
    }
    return size;
  };
  window.isjQueryObject = function(obj) {
    return obj instanceof jQuery;
  };
  window.makejQueryObj = function(obj) {
    if (isjQueryObject(obj)) {
      return obj;
    } else {
      return jQuery(obj);
    }
  };
  window.filterJohaData = function(jQSelector) {
    var johaData;
    return johaData = jQuery(jQSelector).map(function() {
    var filterData = {};
    console.log('filtering Joha data');
    console.log(this.id);
    console.log(jQuery(this).data());
    
    //filter so we only get johaData keys
    var allData = jQuery(this).data();
    var allKeys = get_keys(allData);
    var johaKeys = allKeys.filter(function(i){
      if (i.split("__")[0] == "johaData"){
        return i
      }
    });
    for (var i in johaKeys) {
      thisKey = johaKeys[i];
      filterData[thisKey] = allData[thisKey];
    };
    
    return filterData;
  }).get();;
  };
}).call(this);
