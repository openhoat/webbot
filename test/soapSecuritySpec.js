'use strict';

var path = require('path')
  , soap = require('soap')
  , util = require('util')
  , fs = require('fs')
  , WebBot = require('../lib/webbot')
  , logger = require('nice-logger').logger
  , baseDir;

baseDir = path.join(__dirname, '..');

describe('WebBot soap security', function () {
  var baseDir, httpsServer;
  baseDir = path.join(__dirname, '..');
  before(function (done) {
    var https = require('https')
      , server, myService, wsdl;
    myService = {
      StockQuoteService: {
        StockQuotePort: {
          GetLastTradePrice: function (args) {
            if (args.tickerSymbol === 'trigger error') {
              throw new Error('triggered server error');
            } else {
              return { price: 19.56 };
            }
          }
        }
      }
    };
    wsdl = fs.readFileSync(path.join(__dirname, 'stockquote-sec.wsdl'), 'utf8');
    httpsServer = https.createServer({
      key: fs.readFileSync(path.join(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.join(__dirname, 'cert.crt'))
    }, function (req, res) {
      res.end(util.format('404: Not Found : %s', req.url));
    });
    httpsServer.listen(3001);
    server = soap.listen(httpsServer, '/stockquote', myService, wsdl);
    server.authenticate = function (/*security*/) {
      console.log('authenticate :', arguments);
      console.log('this :', this);
      return true;
    };
    done();
  });
  after(function (done) {
    httpsServer.close(done);
  });
  it('should play a security soap test scenario', function (done) {
    var webBot, scenario = require('./soapScenarioSec.json');

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }

    this.timeout(10000);
    webBot = new WebBot(baseDir);
    webBot.runStepsFromJsonScenario({ jsonScenario: scenario }, completed);
  });
});