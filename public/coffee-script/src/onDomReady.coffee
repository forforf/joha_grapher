root = exports ? this
console.log 'onDomReady Script Loaded'
JohaNodeEditor = require('JohaNodeEditor').JohaNodeEditor

#root.$jjq = $
$ ->
  console.log('JohaNode Doc Ready')
  #nodeData = {akv: ['a', {x: 'X'}, ['aa', 'bb']]}
  
  nodeData =  {
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

  nodeData = {
               id: 'id-test2',
	       label: 'short basic data test',
	       a_string: 'abc',
	       a_number: 42,
	       a_boolean: true
	     }

  newNode = new JohaNodeEditor nodeData
  domData = newNode.view()
  console.log( 'domData:', domData )
  $('#data').append(domData)
  
###
#Working with dynJsonContainers
dynJson = require 'dynJsonContainers'
root.RootValueContainer = dynJson.RootValueContainer
root.$j = $

#JNE = require 'JohaNodeEditor'

$ ->
  console.log($)
  #JohaNodeEditor = JNE.JohaNodeEditor
  console.log('Doc Ready')
  x = new RootValueContainer {akv: ['a', {x: 'X'}, ['aa', 'bb']]}
  console.log x.valueContainer
  console.log x.origValue
  x.view()
  calcBtnHtml = "<button type='button'>Current Value</button>"
  calcBtnDom = $(calcBtnHtml)
  calcBtnDom.click ->
    cv = x.currentValue()
    console.log cv
    alert JSON.stringify(cv)
  $('body').append(calcBtnDom)
