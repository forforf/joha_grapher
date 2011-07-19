root = exports ? this
dynJson = require 'dynJsonContainers'
root.RootValueContainer = dynJson.RootValueContainer
#console.log('onDomReady parsed')
$ ->
  console.log('Doc Ready')
  console.log  root
  x = new RootValueContainer {akv: ['a', {x: 'X'}, ['aa', 'bb']]} 
  #x = new RootValueContainer 'a'
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
###  
  domId = 'johaIdBinder-0'
  idBinder = root.IdBinder.get()
  valCont = idBinder.getBoundById(domId)
  valCont.modify('b')
  #x.valueContainer.modify('b')
  console.log 'Orig', x.valueContainer.origValue
  console.log 'Cur', x.valueContainer.curValue
  console.log 'Current', x.valueContainer.currentValue()
  x.view()

