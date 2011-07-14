(function() {
  var AjaxJsonGetter, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  AjaxJsonGetter = (function() {
    function AjaxJsonGetter(srcUrl, callback) {
      this.getData = __bind(this.getData, this);      this.srcUrl = srcUrl;
      this.callback = callback;
    }
    AjaxJsonGetter.prototype.getData = function(params) {
      console.log('getting data', this.srcUrl, this.callback);
      return $j.ajax(this.srcUrl, {
        type: 'GET',
        data: params,
        dataType: 'json',
        error: __bind(function(xhr, status, error) {
          return console.error(xhr, status, error);
        }, this),
        success: __bind(function(data, status, xhr) {
          return this.callback(data);
        }, this)
      });
    };
    return AjaxJsonGetter;
  })();
  root.AjaxJsonGetter = AjaxJsonGetter;
}).call(this);
