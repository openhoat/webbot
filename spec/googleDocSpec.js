var util = require('util')
  , chai = require('chai')
  , expect = chai.expect
  , Q = require('q')
  , dgpUtil = require('../lib/dgp-util');

describe('Google Sheet To Json', function () {
  it('should return a json doc from google spreadsheet', function (done) {
    this.timeout(30000);
    Q().
      then(function () {
        var deferred = Q.defer();
        dgpUtil.googleSheetToJson({
            gdocKey: '0AilC0U4Eb0tjdGEwR1RDTlRrbnVHbUVBWjBSVHk5OVE',
            sheetIndex: 0
          },
          deferred.makeNodeResolver()
        );
        return deferred.promise;
      }).
      then(function (jsonDoc) {
        console.log('jsonDoc :', jsonDoc);
        expect(jsonDoc).to.be.ok;
        expect(typeof jsonDoc).to.equal('object');
        expect(jsonDoc instanceof Array).to.be.true;
        expect(jsonDoc.length).to.be.ok;
        expect(jsonDoc[0]['firstname']).to.be.ok;
        expect(jsonDoc[0]['lastname']).to.be.ok;
        expect(jsonDoc[0]['age']).to.be.ok;
      }).
      then(done).
      catch(done);
  });
});