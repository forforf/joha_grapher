(function() {
  describe('JohaNodeFields', function() {
    var nodeFieldFactory, nodeFieldLib;
    nodeFieldLib = require('JohaNodeFields');
    nodeFieldFactory = nodeFieldLib.nodeFieldFactory;
    return describe('Importing', function() {
      return it('should exist', function() {
        return expect(nodeFieldFactory).toBeDefined();
      });
    });
  });
}).call(this);
