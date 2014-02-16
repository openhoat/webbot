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
          { index: '1', action: 'init', param1: 'http://localhost', param2: '' },
          { index: '2', action: 'visit', param1: '/hello.html', param2: '' },
          { index: '3', action: 'assert', param1: "expect(browser.text('title')).to.equal('Hey')", param2: "expect(browser.text('h1')).to.equal('Hello')" }
        ]);
      }).
      then(done).
      catch(done);
  });
});