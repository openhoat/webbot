var chai = require('chai')
  , expect = chai.expect
  , Browser = require('zombie')
  , Q = require('q')
  , dgpUtil = require('../lib/dgp-util')
  , config = require('../config');

config.baseUrl = 'https://secure.rectech.u-post.fr';
config.authenticationBasic = { login: 'digiposte', pwd: 'Digi_Pass' };
config.account = {
  login: 'openhoat',
  password: [ 7, 1, 7, 3, 6, 6 ]
};

describe('Dgp web', function () {
  it('should authenticate and show safebox page', function (done) {
    this.timeout(60000);
    var browser;
    browser = new Browser({
      site: config.baseUrl,
      runScripts: true,
      loadCSS: false,
      debug: false
    });
    Q().
      then(function () {
        var deferred = Q.defer();
        dgpUtil.dgpWebDoAuth(browser, config, deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function () {
        var welcomeMessageSelector;
        console.log('checking welcome page user name');
        welcomeMessageSelector = '#remote > .block > .block-content > p > span.name';
        console.log('welcome message :', browser.text(welcomeMessageSelector));
        expect(browser.text(welcomeMessageSelector).toUpperCase()).to.equal('OLIVIERzz');
      }).
      then(function () {
        var deferred = Q.defer();
        console.log('clicking on "Coffre" link');
        browser.clickLink('#content-zone .dashboard .recapCoffre .hd a', deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function () {
        console.log('checking "Coffre" page content');
        expect(browser.text('#documents_form > h1')).to.equal('Coffre');
        expect(browser.text('#coffre_vide h2')).to.equal('Votre coffre ne contient aucun élément');
      }).
      then(done).
      catch(done);
  });
});