'use strict';

var chai = require('chai')
  , path = require('path')
  , Q = require('niceq')
  , fs = require('fs')
  , util = require('../lib/util')
  , expect = chai.expect;

describe('WebBot util jsonToCsv', function () {
  it('should return csv content from json doc', function (done) {
    Q().
      niceThen(function (next) {
        util.jsonToCsv(path.join(__dirname, 'webScenario.json'), next);
      }).
      then(function (csv) {
        var expected;
        expect(csv).to.be.ok;
        expect(typeof csv).to.equal('string');
        expected = fs.readFileSync(path.join(__dirname, 'webScenario.csv'), 'utf-8');
        expect(csv).to.equal(expected);
        done();
      }).
      catch(done);
  });
});