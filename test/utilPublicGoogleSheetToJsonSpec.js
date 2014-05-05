'use strict';

var chai = require('chai')
  , Q = require('niceq')
  , util = require('../lib/util')
  , expect = chai.expect;

describe('util googleSheetToJson', function () {
  it('should return a json doc from public google spreadsheet', function (done) {
    this.timeout(10000);
    Q().
      niceThen(function (next) {
        util.googleSheetToJson({
          gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
          sheetIndex: 0
        }, next);
      }).
      then(function (result) {
        expect(result).to.be.ok;
        expect(result).to.be.instanceof(Array);
        expect(result).to.eql([
          {
            index: 1,
            description: 'Init browser',
            action: 'init',
            param1: 'http://localhost:3000'
          },
          {
            index: 2,
            description: 'Visit hello',
            action: 'visit',
            param1: '/hello.html'
          },
          {
            index: 3,
            description: 'Check title is Hey and h1 is Hello',
            action: 'assert',
            param1: 'expect(browser.text(\'title\')).to.equal(\'Hey\')',
            param2: 'expect(browser.text(\'h1\')).to.equal(\'Hello\')' },
          {
            index: 4,
            description: 'Check content',
            action: 'assertText',
            param1: 'body > h2',
            param2: 'this is a test' },
          {
            index: 5,
            description: 'Fill form',
            action: 'fill',
            param1: 'input[type=text]',
            param2: 'this is the value' },
          {
            index: 6,
            description: 'Submit form',
            action: 'press',
            param1: 'input[type=submit]'
          },
          {
            index: 7,
            description: 'Wait for page download',
            action: 'wait'
          },
          {
            index: 8,
            description: 'Check h1 is \'Done\'',
            action: 'assertText',
            param1: 'body > h1',
            param2: 'Done'
          },
          {
            index: 9,
            description: 'Check h2 is \'this is the value\'',
            action: 'assertText',
            param1: 'body > h2',
            param2: 'this is the value'
          },
          { index: 10,
            description: 'Ensure the test has been done in 1s max',
            action: 'assertTimeLe',
            param1: '1000'
          }
        ]);
      }).
      niceDone(done);
  });
});