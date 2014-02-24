var path = require('path')
  , Q = require('q')
  , WebBot = require('../lib/web-bot')
  , specUtil = require('./spec-util')
  , baseDir, webBot;

baseDir = path.join(__dirname, '..');

describe('Automate web service test', function () {
  afterEach(function (done) {
    specUtil.stopWebServer(webBot.logger, done);
  });
  it('should play a json web test scenario', function (done) {
    var jsonWebScenario;
    this.timeout(2000);
    webBot = new WebBot(baseDir);
    jsonWebScenario = [
      { action: 'wsGet', param1: 'http://localhost:3000/ws/contact/123', param2: 200, param3: 'application/json', param4: '{ "id": "123", "firstName" : "John", "lastName" : "Doe" }' },
      { action: 'wsGet', param1: 'http://localhost:3000/ws/contact/124', param2: 404 },
      { action: 'wsPost', param1: 'http://localhost:3000/ws/contact', param2: 'id=124&firstName=Jack&lastName=Russell', param3: 201 },
      { action: 'wsGet', param1: 'http://localhost:3000/ws/contact/124', param2: 200, param3: 'application/json', param4: '{ "id": "124", "firstName" : "Jack", "lastName" : "Russell" }' },
      { action: 'wsPut', param1: 'http://localhost:3000/ws/contact/123', param2: 'firstName=Jennifer&lastName=Lopez', param3: 204 },
      { action: 'wsGet', param1: 'http://localhost:3000/ws/contact/123', param2: 200, param3: 'application/json', param4: '{ "id": "123", "firstName" : "Jennifer", "lastName" : "Lopez" }' },
      { action: 'wsDelete', param1: 'http://localhost:3000/ws/contact/123', param2: 204 },
      { action: 'wsGet', param1: 'http://localhost:3000/ws/contact/124', param2: 200, param3: 'application/json', param4: '{ "id": "124", "firstName" : "Jack", "lastName" : "Russell" }' },
      { action: 'wsGet', param1: 'http://localhost:3000/ws/contact/123', param2: 404 }
    ];
    Q().
      then(function () {
        var deferred = Q.defer();
        webBot.init(deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function () {
        var deferred = Q.defer();
        specUtil.startWebServer(webBot.logger, deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function () {
        var deferred = Q.defer();
        webBot.runStepsFromJsonScenario(jsonWebScenario, deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(completed).
      catch(completed);

    function completed(err) {
      var elapsedTime = webBot.elapsedTime();
      webBot.logger.info('WebBotjs test took %s seconds', elapsedTime);
      done(err);
    }
  });
});