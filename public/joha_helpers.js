/* Common helper functions for joha functionality */

  //Generic Helper functions
  //http://stackoverflow.com/questions/208016/how-to-list-the-properties-of-a-javascript-object
  //for better x-browser support of keys()
function get_keys(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}  

function array_contains(a, obj) {
  var i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}

function array_remove_item(a, obj){
  var i = a.length;
  //ToDo: Provide return value? if so what?
  while (i--) {
    if (a[i] === obj) {
      a.splice(i,1);
    }
  }
}

function array_contains_all(a, subset){
  var retVal = true;
  for (var i in subset){
    var obj = subset[i]
    if ( array_contains(a, obj) ){} else { retVal = false;};
  }
  return retVal
}

function obj_key_position(obj, key){
  var i = 0;
  for (k in obj) {
    if (k == key) {
      return i;
    }
    i += 1;
  }
  return -1;
}

function jlog(label, data){
  console.log("vv " + label + " vv");
  console.log(data);
  console.log('^^ ' + label + ' ^^');
}

//-- to be able to query on .data attribute.
//-- example: assume data was set as so $('a#someLink').data('ABC', '123');
//-- usage: $('a[ABC=123]')
//-- returns the element.
// Code by James Padolsey, site: http://james.padolsey.com/javascript/a-better-data-selector-for-jquery/
(function($){
    var _dataFn = $.fn.data;
    $.fn.data = function(key, val){
        if (typeof val !== 'undefined'){ 
            $.expr.attrHandle[key] = function(elem){
                return $(elem).attr(key) || $(elem).data(key);
            };
        }
        return _dataFn.apply(this, arguments);
    };
})(jQuery);


//Detemines if an object is a jQuery object
function isjQueryObject(obj) {
  return obj instanceof jQuery;
}

function makejQueryObj(obj) {
  if (isjQueryObject(obj)) {
    return obj;
  } else {
    return jQuery(obj);
  }
}

function filterJohaUpdateData() {
  var test_list =  jQuery('.edit_updated').map(function() {
    var fieldData = {};
    console.log(this.id);
    
    //filter so we only get johaData keys
    var allData = jQuery(this).data();
    var allKeys = get_keys(allData);
    var johaKeys = allKeys.filter(function(i){
      if (i.split("__")[0] == "johaData"){
        return i
      }
    });
    for (i in johaKeys) {
      thisKey = johaKeys[i];
      fieldData[thisKey] = allData[thisKey];
    };
    
    return fieldData;
  }).get();
  return test_list;
}