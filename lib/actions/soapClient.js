'use strict';

var that;


that = {
  build: function (webBot, step) {
    var util = require('util')
      , fs = require('fs')
      , constants = require('constants')
      , https = require('https')
      , _ = require('lodash')
      , soap = require('soap')
      , logger = webBot.logger;

    function SoapCustomSecurity(username, password, keyPath, certPath, defaults) {
      this.username = username;
      this.password = password;
      this.key = fs.readFileSync(keyPath);
      this.cert = fs.readFileSync(certPath);
      this.defaults = {};
      _.merge(this.defaults, defaults);
    }

    SoapCustomSecurity.prototype.toXML = function (/*headers*/) {
      return '';
    };

    SoapCustomSecurity.prototype.addHeaders = function (headers) {
      headers.Authorization = util.format('Basic %s', new Buffer(util.format('%s:%s', this.username, this.password)).toString('base64'));
    };

    SoapCustomSecurity.prototype.addOptions = function (options) {
      options.key = this.key;
      options.cert = this.cert;
      _.merge(options, this.defaults);
      options.agent = new https.Agent(options);
    };

    return function (done) {
      var chai = require('chai')
        , Q = require('niceq')
        , tmp = require('tmp')
        , request = require('request')
        , expect = chai.expect
        , util = webBot.util
        , wsdlUrl, contextName, securityMode, wsdlFile;
      logger.info('#%s start', step.index);
      wsdlUrl = util.getItemParam(step, 1);
      contextName = util.getItemParam(step, 2) || 'soapClient';
      securityMode = util.getItemParam(step, 3);
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      Q().
        niceThen(function (next, resolve) {
          if (!/^http/.test(wsdlUrl)) {
            wsdlFile = wsdlUrl;
            resolve();
          } else {
            Q().
              niceThen(function (next) {
                tmp.file({
                  prefix: 'webbot-',
                  postfix: '.wsdl'
                }, next);
              }).
              spread(function (file) {
                var deferred = Q.defer()
                  , options;
                wsdlFile = file;
                options = {
                  url: wsdlUrl,
                  method: 'GET',
                  strictSSL: false
                };
                switch (securityMode) {
                  case 'ssl':
                    (function () {
                      var keyPath, certPath;
                      keyPath = util.getItemParam(step, 4);
                      certPath = util.getItemParam(step, 5);
                      options.key = fs.readFileSync(keyPath);
                      options.cert = fs.readFileSync(certPath);
                    })();
                    break;
                  case 'custom':
                    (function () {
                      var keyPath, certPath;
                      keyPath = util.getItemParam(step, 6);
                      certPath = util.getItemParam(step, 7);
                      options.key = fs.readFileSync(keyPath);
                      options.cert = fs.readFileSync(certPath);
                    })();
                    break;
                }
                request(options, function (err, res, body) {
                  if (err) {
                    deferred.reject(err);
                    return;
                  }
                  expect(res.statusCode).to.equal(200);
                  deferred.resolve(body);
                });
                return deferred.promise;
              }).
              niceThen(function (data, next) {
                logger.info('#%s storing wsdl to temp file : %s', step.index, wsdlFile);
                fs.writeFile(wsdlFile, data, next);
              }).
              niceDone(next);
          }
        }).
        niceThen(function (next) {
          logger.info('#%s creating soap client : %s', step.index, wsdlUrl);
          soap.createClient(wsdlFile, next);
        }).
        then(function (client) {
          expect(client).to.be.ok;
          if (securityMode) {
            (function () {
              var username, password, keyPath, certPath;
              securityMode = securityMode.toLowerCase();
              logger.info('#%s using security mode : %s', step.index, securityMode);
              switch (securityMode) {
                case 'basic':
                  username = util.getItemParam(step, 4);
                  password = util.getItemParam(step, 5);
                  client.addSoapHeader({ Security: { username: username, password: password } });
                  client.setSecurity(new soap.BasicAuthSecurity(username, password));
                  break;
                case 'ssl':
                  keyPath = util.getItemParam(step, 4);
                  certPath = util.getItemParam(step, 5);
                  //client.addSoapHeader({ Security: 'ssl' });
                  client.setSecurity(new soap.ClientSSLSecurity(keyPath, certPath, {
                    rejectUnauthorized: false,
                    strictSSL: false,
                    secureOptions: constants.SSL_OP_NO_TLSv1_2
                  }));
                  break;
                case 'custom':
                  username = util.getItemParam(step, 4);
                  password = util.getItemParam(step, 5);
                  keyPath = util.getItemParam(step, 6);
                  certPath = util.getItemParam(step, 7);
                  client.addSoapHeader({ Security: { username: username, password: password } });
                  client.setSecurity(new SoapCustomSecurity(username, password, keyPath, certPath));
                  break;
              }
            })();
          }
          webBot.context[contextName] = client;
          logger.info('#%s end', step.index);
        }).
        niceDone(done);
    };
  }
};

module.exports = that;