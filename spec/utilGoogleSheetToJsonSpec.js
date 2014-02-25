var chai = require('chai')
  , Q = require('q')
  , util = require('../lib/util')
  , expect = chai.expect;

describe('util googleSheetToJson', function () {
  it('should return a json doc from google spreadsheet', function (done) {
    this.timeout(10000);
    Q().
      then(function () {
        var deferred = Q.defer();
        util.googleSheetToJson({
            gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
            sheetIndex: 0
          },
          deferred.makeNodeResolver()
        );
        return deferred.promise;
      }).
      then(function (result) {
        expect(result).to.be.ok;
        expect(result).to.be.instanceof(Array);
        expect(result).to.eql([
          { index: '1',
            action: 'init',
            param1: 'http://localhost:3000',
            param2: '' },
          { index: '2', action: 'visit', param1: '/hello.html', param2: '' },
          { index: '3',
            action: 'assert',
            param1: 'expect(browser.text(\'title\')).to.equal(\'Hey\')',
            param2: 'expect(browser.text(\'h1\')).to.equal(\'Hello\')' },
          { index: '4',
            action: 'assertText',
            param1: 'body > h2',
            param2: 'this is a test' },
          { index: '5',
            action: 'fill',
            param1: 'input[type=text]',
            param2: 'this is the value' },
          { index: '6',
            action: 'press',
            param1: 'input[type=submit]',
            param2: '' },
          { index: '7', action: 'wait', param1: '', param2: '' },
          { index: '8',
            action: 'assertText',
            param1: 'body > h1',
            param2: 'Done' },
          { index: '9',
            action: 'assertText',
            param1: 'body > h2',
            param2: 'this is the value' },
          { index: '10', action: 'assertTimeLe', param1: '500', param2: '' }
        ]);
      }).
      then(done).
      catch(done);
  });
});