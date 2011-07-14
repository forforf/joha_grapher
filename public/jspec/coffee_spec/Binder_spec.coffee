root = exports ? this

describe 'Binder', ->

  describe 'Initialization', ->

    beforeEach ->
      emptyBinder = new Binder #('ItemA', 'ItemB')
      root.emptyBinder = emptyBinder
      
    it 'should be defined', ->
      console.log('should be defined', emptyBinder)
      expect(emptyBinder).toBeDefined

    #it 'should have labels assigned', ->
    #  labels = emptyBinder.getLabels()
    #  console.log('labels', labels)
    #  expect(labels).toEqual ['ItemA', 'ItemB']


    describe 'Lazy Binding Initial', ->
      beforeEach ->
        lazyA = new Binder #('ItemA1', 'ItemB1')
        lazyA.add('AB1', 'ItemA1','Val for A1')
        root.lazyA = lazyA
        lazyB = new Binder #('ItemA2','ItemB2')
        lazyB.add('AB2', 'ItemB2', 'Val for B2')
        root.lazyB = lazyB
        lazyAB = new Binder #('ItemA3', 'ItemB3')
        lazyAB.add('AB3', 'ItemA3', 'Val for A3')
        lazyAB.add('AB3', 'ItemB3', 'Val for B3')
        root.lazyAB = lazyAB
        lazyBA = new Binder #('ItemA4', 'ItemB4')
        lazyBA.add('AB4', 'ItemB4', 'Val for B4')
        lazyBA.add('AB4', 'ItemA4', 'Val for A4')
        root.lazyBA = lazyBA
        lazyBind = new Binder #('foo', 'bar')
        lazyBind.add('common', 'A', 'Val for A')
        
      it 'should get A1', ->
        binds = lazyA.getBindings('AB1')
        expect(binds).toEqual {'ItemA1': 'Val for A1', 'ItemB': undefined}

      it 'should get B2', ->
        binds = lazyB.getBindings('AB2')
        expect(binds).toEqual {'ItemA2': undefined, 'ItemB2': 'Val for B2'}

      it 'should get AB3', ->
        binds = lazyAB.getBindings('AB3')
        expect(binds).toEqual {'ItemA3': 'Val for A3', 'ItemB3': 'Val for B3'}

      it 'should get AB4', ->
        binds = lazyBA.getBindings('AB4')
        expect(binds).toEqual {'ItemA4': 'Val for A4', 'ItemB4': 'Val for B4'}

    describe 'Lazy Binding later', ->
      beforeEach ->
        lazyA.add('AB1', 'ItemB1', 'Val for B1')
        lazyB.add('AB2', 'ItemA2',  'Val for A2')

      it 'should get AB1', ->
        binds = lazyA.getBindings('AB1')
        expect(binds).toEqual {'ItemA1': 'Val for A1', 'ItemB1': 'Val for B1'}

      it 'should get AB2', ->
        binds = lazyB.getBindings('AB2')
        expect(binds).toEqual {'ItemA2': 'Val for A2', 'ItemB2': 'Val for B2'}        