var that;

that = {
  build: function (webBot, step) {
    return function () {
      var Q = require('q')
        , request = require('request')
        , chai = require('chai')
        , logger = webBot.logger
        , util = webBot.util
        , expect = chai.expect
        , deferred = Q.defer()
        , url, reqBody, expectedStatusCode, expectedContentType, expectedContent, options;
      logger.info('#%s start', step.index);
      url = util.getItemParam(step, 1);
      reqBody = util.getItemParam(step, 2);
      expectedStatusCode = util.getItemParam(step, 3);
      expectedContentType = util.getItemParam(step, 4);
      expectedContent = util.getItemParam(step, 5);
      logger.info('#%s sending POST request : %s', step.index, url);
      options = {
        method: 'POST',
        uri: url,
        body: reqBody
      };
      request(options, function (error, res, body) {
        var content;
        if (error) {
          return deferred.reject(error);
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
        deferred.resolve();
      });
      return deferred.promise;
    };
  }
};

module.exports = that;