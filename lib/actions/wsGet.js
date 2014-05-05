'use strict';

var that;

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var request = require('request')
        , chai = require('chai')
        , util = webBot.util
        , expect = chai.expect
        , url, expectedStatusCode, expectedContentType, expectedContent, options;
      logger.info('#%s start', step.index);
      url = util.getItemParam(step, 1);
      expectedStatusCode = util.getItemParam(step, 2);
      expectedContentType = util.getItemParam(step, 3);
      expectedContent = util.getItemParam(step, 4);
      logger.info('#%s sending GET request : %s', step.index, url);
      options = {
        method: 'GET',
        uri: url
      };
      request(options, function (error, res, body) {
        var content;
        if (error) {
          done(error);
          return;
        }
        expect(res.statusCode).to.equal(expectedStatusCode);
        if (expectedContentType) {
          expect(res.headers['content-type']).to.equal(expectedContentType);
          if (expectedContent) {
            if (expectedContentType === 'application/json') {
              content = JSON.parse(body);
              expectedContent = JSON.parse(expectedContent);
            } else {
              content = body;
            }
            expect(content).to.eql(expectedContent);
          }
        }
        logger.info('#%s end', step.index);
        done();
      });
    };
  }
};

module.exports = that;