'use strict';

var chai = require('chai')
  , expect = chai.expect
  , util = require('hw-util')
  , log = util.logFactory('webbotSpec')
  , config = require('../config')
  , webbot = require('../lib/webbot');

describe('Helper', function () {
  var serverPort = 3999;

  this.timeout(30000);

  xit('should start selenium server', function (done) {
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

  describe('simple local web test', function () {
    var browser, testHttpServer
      , options = {
        selenium: config.selenium,
        browser: {
          verbose: true,
          logLevel: 'verbose',
          desiredCapabilities: config.browser.desiredCapabilities
        }
      };

    before(function () {
      return util
        .startHttpServer({port: serverPort})
        .then(function (httpServer) {
          testHttpServer = httpServer;
        })
        .then(function () {
          log.trace('args :', arguments);
          return webbot
            .init(options)
            .then(function () {
              browser = webbot.getBrowser();
            });
        });
    });

    after(function () {
      return webbot
        .stopSelenium()
        .then(function () {
          return util.stopHttpServer({httpServer: testHttpServer});
        });
    });

    it('should connect to local demo web site', function () {
      return browser
        .url(util.format('http://localhost:%s/hello', serverPort))
        .waitForText('h1', 'Path')
        .waitForText('h2', '/hello')
        .end();
    });

  });

});
