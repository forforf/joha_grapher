(function() {
  var root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  describe('Binder', function() {
    return describe('Initialization', function() {
      beforeEach(function() {
        var emptyBinder;
        emptyBinder = new Binder('ItemA', 'ItemB');
        return root.emptyBinder = emptyBinder;
      });
      it('should be defined', function() {
        console.log('should be defined', emptyBinder);
        return expect(emptyBinder).toBeDefined;
      });
      it('should have labels assigned', function() {
        var labels;
        labels = emptyBinder.getLabels();
        console.log('labels', labels);
        return expect(labels).toEqual(['ItemA', 'ItemB']);
      });
      describe('Lazy Binding Initial', function() {
        beforeEach(function() {
          var lazyA, lazyAB, lazyB, lazyBA;
          lazyA = new Binder('ItemA1', 'ItemB1');
          lazyA.addA('AB1', 'Val for A1');
          root.lazyA = lazyA;
          lazyB = new Binder('ItemA2', 'ItemB2');
          lazyB.addB('AB2', 'Val for B2');
          root.lazyB = lazyB;
          lazyAB = new Binder('ItemA3', 'ItemB3');
          lazyAB.addA('AB3', 'Val for A3');
          lazyAB.addB('AB3', 'Val for B3');
          root.lazyAB = lazyAB;
          lazyBA = new Binder('ItemA4', 'ItemB4');
          lazyBA.addB('AB4', 'Val for B4');
          lazyBA.addA('AB4', 'Val for A4');
          return root.lazyBA = lazyBA;
        });
        it('should get A1', function() {
          var binds;
          binds = lazyA.getBindings('AB1');
          return expect(binds).toEqual({
            'ItemA1': 'Val for A1',
            'ItemB': void 0
          });
        });
        it('should get B2', function() {
          var binds;
          binds = lazyB.getBindings('AB2');
          return expect(binds).toEqual({
            'ItemA2': void 0,
            'ItemB2': 'Val for B2'
          });
        });
        it('should get AB3', function() {
          var binds;
          binds = lazyAB.getBindings('AB3');
          return expect(binds).toEqual({
            'ItemA3': 'Val for A3',
            'ItemB3': 'Val for B3'
          });
        });
        return it('should get AB4', function() {
          var binds;
          binds = lazyBA.getBindings('AB4');
          return expect(binds).toEqual({
            'ItemA4': 'Val for A4',
            'ItemB4': 'Val for B4'
          });
        });
      });
      return describe('Lazy Binding later', function() {
        beforeEach(function() {
          lazyA.addB('AB1', 'Val for B1');
          return lazyB.addA('AB2', 'Val for A2');
        });
        it('should get AB1', function() {
          var binds;
          binds = lazyA.getBindings('AB1');
          return expect(binds).toEqual({
            'ItemA1': 'Val for A1',
            'ItemB1': 'Val for B1'
          });
        });
        return it('should get AB2', function() {
          var binds;
          binds = lazyB.getBindings('AB2');
          return expect(binds).toEqual({
            'ItemA2': 'Val for A2',
            'ItemB2': 'Val for B2'
          });
        });
      });
    });
  });
}).call(this);
