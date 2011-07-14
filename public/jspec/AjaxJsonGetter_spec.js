(function() {
  describe('AjaxJsonGetter', function() {
    return it('should get jsivt data and pass to callback', function() {
      var dummy, dummyTest, jitLoader, testAsync;
      testAsync = jasmine.createSpy();
      dummyTest = function() {
        return alert('This should not execute');
      };
      jitLoader = new AjaxJsonGetter('/some_json', testAsync);
      dummy = new AjaxJsonGetter('/nowhere', dummyTest);
      jitLoader.getData();
      waitsFor(function() {
        return testAsync.callCount > 0;
      });
      return runs(function() {
        expect(testAsync).toHaveBeenCalled();
        return expect(testAsync.mostRecentCall.args).toEqual([
          {
            'a': 'A',
            'b': 'B'
          }
        ]);
      });
    });
  });
}).call(this);
