var chai = require('chai')
  , webbot = require('../lib/webbot')
  , expect = chai.expect
  , browser, config;

describe('Simple web test', function () {

  before(function (done) {
    browser = webbot.getBrowser();
    config = {};
    config.scenario = webbot.getScenario().config;
    webbot.addBrowserCommands(browser, done);
  });

  after(function (done) {
    browser
      .end(done);
  });

  it('should home page', function (done) {
    browser
      .log('Connect to %s', config.scenario.url)
      .url(config.scenario.url)
      .log('Check page title : %s', config.scenario.title)
      .getTitle(function (err, value) {
        expect(err).to.be.undefined;
        expect(value).to.equal(config.scenario.title);
      })
      .call(done);
  });
});