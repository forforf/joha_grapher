RootValueContainer = require('dynJsonContainers').RootValueContainer

describe 'dynJsonContainers RootValueContainer', ->
  beforeEach ->
    @data1 = {akv: ['a', {x: 'X'}, ['aa', 'bb']]}
    @data2 = {a: ['aa', 'ab'], b: { ba: ['baa', 'bab'], bb: {bba: 'bbc'}}}
    @data3 = {a: 'AA', b: 'BB'}
  
  it 'should record the initial data correctly', ->
    cont = new RootValueContainer(@data1)
    expect(cont.origValue).toEqual @data1

  it 'should calculate the current data from the dom correctly', ->
    cont = new RootValueContainer(@data1)
    expect( cont.currentValue() ).toEqual @data1

