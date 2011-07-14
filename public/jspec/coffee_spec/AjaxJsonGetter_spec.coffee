describe 'AjaxJsonGetter', ->

  it 'should get jsivt data and pass to callback', ->
    testAsync = jasmine.createSpy()
    dummyTest = -> alert('This should not execute')
    jitLoader = new AjaxJsonGetter('/some_json', testAsync)
    dummy = new AjaxJsonGetter('/nowhere', dummyTest)
    jitLoader.getData()
    waitsFor -> 
      testAsync.callCount > 0
    runs ->
      expect(testAsync).toHaveBeenCalled()
      expect(testAsync.mostRecentCall.args).toEqual [{'a': 'A', 'b': 'B'}]


