(function() {
  var root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  describe('Binder', function() {
    return describe('Initialization', function() {
      beforeEach(function() {
        var emptyBinder;
        emptyBinder = new Binder;
        return root.emptyBinder = emptyBinder;
      });
      it('should be defined', function() {
        console.log('should be defined', emptyBinder);
        return expect(emptyBinder).toBeDefined;
      });
      describe('Lazy Binding Initial', function() {
        beforeEach(function() {
          var lazyA, lazyAB, lazyB, lazyBA, lazyBind;
          lazyA = new Binder;
          lazyA.add('AB1', 'ItemA1', 'Val for A1');
          root.lazyA = lazyA;
          lazyB = new Binder;
          lazyB.add('AB2', 'ItemB2', 'Val for B2');
          root.lazyB = lazyB;
          lazyAB = new Binder;
          lazyAB.add('AB3', 'ItemA3', 'Val for A3');
          lazyAB.add('AB3', 'ItemB3', 'Val for B3');
          root.lazyAB = lazyAB;
          lazyBA = new Binder;
          lazyBA.add('AB4', 'ItemB4', 'Val for B4');
          lazyBA.add('AB4', 'ItemA4', 'Val for A4');
          root.lazyBA = lazyBA;
          lazyBind = new Binder;
          return lazyBind.add('common', 'A', 'Val for A');
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
          lazyA.add('AB1', 'ItemB1', 'Val for B1');
          return lazyB.add('AB2', 'ItemA2', 'Val for A2');
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
