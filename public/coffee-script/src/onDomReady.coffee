root = exports ? this
console.log 'onDomReady Script Loaded'
JohaNodeEditor = require('JohaNodeEditor').JohaNodeEditor

#root.$jjq = $
$ ->
  console.log('JohaNode Doc Ready')
  nodeData = {akv: ['a', {x: 'X'}, ['aa', 'bb']]}
  newNode = new JohaNodeEditor nodeData
  domData = newNode.view()
  console.log( 'domData:', domData )
  
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
