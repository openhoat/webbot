var chai = require('chai')
  , webbot = require('../lib/webbot')
  , expect = chai.expect
  , browser, scenario;

browser = webbot.getBrowser();
scenario = webbot.getScenario();

describe('Simple web test', function () {
  after(function (done) {
    browser
      .end(done);
  });
  it('should check web page title', function (done) {
    browser
      .log('Connect to %s', scenario.config.url)
      .url(scenario.config.url)
      .log('Check page title : %s', scenario.config.title)
      .getTitle(function (err, value) {
        expect(err).to.be.undefined;
        expect(value).to.equal(scenario.config.title);
      })
      .call(done);
  });
});