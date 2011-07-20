(function() {
  var RootValueContainer;
  RootValueContainer = require('dynJsonContainers').RootValueContainer;
  describe('dynJsonContainers RootValueContainer', function() {
    beforeEach(function() {
      this.data1 = {
        akv: [
          'a', {
            x: 'X'
          }, ['aa', 'bb']
        ]
      };
      this.data2 = {
        a: ['aa', 'ab'],
        b: {
          ba: ['baa', 'bab'],
          bb: {
            bba: 'bbc'
          }
        }
      };
      return this.data3 = {
        a: 'AA',
        b: 'BB'
      };
    });
    it('should record the initial data correctly', function() {
      var cont;
      cont = new RootValueContainer(this.data1);
      return expect(cont.origValue).toEqual(this.data1);
    });
    return it('should calculate the current data from the dom correctly', function() {
      var cont;
      cont = new RootValueContainer(this.data1);
      return expect(cont.currentValue()).toEqual(this.data1);
    });
  });
}).call(this);
