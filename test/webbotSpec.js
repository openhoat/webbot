'use strict';

var chai = require('chai')
  , expect = chai.expect
  , util = require('hw-util')
  , log = util.logFactory('webbotSpec')
  , config = require('../config')
  , webbot = require('../lib/webbot');

describe('Helper', function () {
  var serverPort = 3999;

  this.timeout(10000);

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

  describe('browser tests', function () {
    var http = require('http')
      , httpServer
      , options, browser;

    before(function (done) {
      options = {
        selenium: config.selenium,
        browser: {
          verbose: true,
          logLevel: 'verbose',
          desiredCapabilities: config.browser.desiredCapabilities
        }
      };
      webbot
        .init(options)
        .then(function () {
          browser = webbot.getBrowser();
        })
        .then(function () {
          log.info('creating http server');
          httpServer = http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<html><body><h1>hello</h1></body></html>');
          });
          expect(httpServer).to.be.ok;
          httpServer.listen(serverPort, function (err) {
            expect(err).to.be.undefined;
            log.info('http server ready');
            done();
          });
        });
    });

    after(function (done) {
      webbot
        .stopSelenium()
        .then(function () {
          log.info('closing http server');
          expect(httpServer).to.be.ok;
          httpServer.close(function () {
            log.info('http server closed');
            done();
          });
        });
    });

    it('should connect to local demo web site', function () {
      return browser
        .url(util.format('http://localhost:%s/', serverPort))
        .getText('h1', function (err, value) {
          if (err) {
            log.error(err);
          }
          expect(err).to.be.undefined;
          log.trace('value :', value);
          expect(value).to.equal('hello');
        })
        .end();
    });

  });

});


