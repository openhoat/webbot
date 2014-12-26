'use strict';

var chai = require('chai')
  , expect = chai.expect
//, log = util.logFactory('webbotSpec')
  , config = require('../config')
  , webbot = require('../lib/webbot');

describe('Helper', function () {

  this.timeout(10000);

  it('should start selenium server', function (done) {
    webbot
      .startSelenium(config.selenium)
      .then(function () {
        return webbot.stopSelenium(config.selenium);
      })
      .then(function (result) {
        expect(result).to.be.true;
      })
      .then(done, done);
  });

  describe('browser tests', function () {
    var options, browser;

    before(function () {
      options = {
        selenium: config.selenium,
        browser: {
          verbose: true,
          logLevel: 'verbose',
          desiredCapabilities: config.browser.desiredCapabilities
        }
      };
      return webbot
        .init(options)
        .then(function () {
          browser = webbot.getBrowser();
        });
    });

    after(function () {
      return webbot
        .stopSelenium();
    });

    it('should connect to web site', function () {
      return browser
        .url('http://www.google.com')
        .getTitle(function (err, value) {
          expect(err).to.be.undefined;
          expect(value).to.equal('Google');
        })
        .end();
    });

  });

});


