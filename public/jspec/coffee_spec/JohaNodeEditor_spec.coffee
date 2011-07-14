describe 'JohaNodeEditor', ->

  describe  'Initialization with proper data', ->
    @nodeData = {}
    @nodeEd = null
    beforeEach -> 
      @nodeData =  {
                   id: 'id-test',
                   label: 'label-test',
                   links: { 
                     'http://www.google.com': 'google',
                     'http://www.yahoo.com': 'yahoo'},
                   a_string: 'abc',
                   a_number: 42,
                   a_simple_array: ['A', 'B', 'C'],
                   a_simple_obj: { a: 'AA', b: 'BB', c: 'CC' },
                   a_complex_array: ['d', ['e', 'f'], {g: 'G'} ],
                   a_complex_obj: {h: {hh: ['i', 'j', {k: 'K'}] } }
                  }
      @nodeEd = new JohaNodeEditor(@nodeData)

    it 'provides node data', ->
      #nodeEd = new JohaNodeEditor(@nodeData)
      expect( @nodeEd.currentNodeData() ).toEqual @nodeData
    
    it 'provides the node id', ->
      expect( @nodeData.id ).toEqual 'id-test'
      expect( @nodeEd.currentNodeId() ).toEqual @nodeData.id



  describe  'Initialization with impproper data', ->
     
    it 'provides a node id if one does not exist', ->
      nodeData = {} 
      nodeEd = new JohaNodeEditor(nodeData)
      expect(nodeData.id).toEqual nodeEd.currentNodeId()
      expect( nodeData.id.length ).toEqual 36

    it 'provides a node label if one does not exist', ->
      nodeData = {} 
      nodeEd = new JohaNodeEditor(nodeData)
      expect(nodeData.label).toEqual nodeEd.currentNodeData().label
      expect(nodeData.label).toEqual 'node:' + nodeData.id
    

    #testAsync = jasmine.createSpy()
    #dummyTest = -> alert('This should not execute')
    #jitLoader = new AjaxJsonGetter('/some_json', testAsync)
    #dummy = new AjaxJsonGetter('/nowhere', dummyTest)
    #jitLoader.getData()
    #waitsFor -> 
    #  testAsync.callCount > 0
    #runs ->
    #  expect(testAsync).toHaveBeenCalled()
    #  expect(testAsync.mostRecentCall.args).toEqual [{'a': 'A', 'b': 'B'}]


