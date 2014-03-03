var that;

that = {
  build: function (webBot, step) {
    return function () {
      var Q = require('q')
        , request = require('request')
        , chai = require('chai')
        , log = webBot.log
        , util = webBot.util
        , expect = chai.expect
        , deferred = Q.defer()
        , url, expectedStatusCode, expectedContentType, expectedContent, options;
      log.info('#%s start', step.index);
      url = util.getItemParam(step, 1);
      expectedStatusCode = util.getItemParam(step, 2);
      expectedContentType = util.getItemParam(step, 3);
      expectedContent = util.getItemParam(step, 4);
      log.info('#%s sending GET request : %s', step.index, url);
      options = {
        method: 'GET',
        uri: url
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