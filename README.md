[![Build Status](https://travis-ci.org/openhoat/webbotjs.png?branch=master)](https://travis-ci.org/openhoat/webbotjs)

## What's webbotjs?

It provides a beautiful way to automate your web tests.
All you have to do is to write a test with [Mocha](http://visionmedia.github.io/mocha/), specify the test scenario in JSON or a Google Doc, and run it.

## Test scenario from JSON :

Suppose you have a simple http server providing a hello page, the test could be :

```javascript
var path = require('path')
  , Q = require('q')
  , WebBot = require('webbotjs')
  , baseDir, webBot;

baseDir = path.join(__dirname, '..');

describe('Automate web visit', function () {
  it('should play a json web test scenario', function (done) {
    var jsonWebScenario;
    this.timeout(2000);
    webBot = new WebBot(baseDir);
    jsonWebScenario = [
      { index: '1', action: 'init', param1: 'http://localhost', param2: '' },
      { index: '2', action: 'visit', param1: '/hello.html', param2: '' },
      { index: '3', action: 'assert', param1: "expect(browser.text('title')).to.equal('Hey')", param2: "expect(browser.text('h1')).to.equal('Hello')" }
    ];
    Q().
      then(function () {
        var deferred = Q.defer();
        webBot.init(deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function () {
        var deferred = Q.defer();
        webBot.runStepsFromJsonScenario(jsonWebScenario, deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(done).
      catch(done);
  });
});
```

WebBotjs will execute all steps in the JSON array to initialize the browser, visit the page, and check the resulting html page content.

## Test scenario from Google Doc :

Now let's see the same test with a scenario written in a [simple Google Doc](https://docs.google.com/spreadsheet/pub?key=0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc&output=html) :

```javascript
var path = require('path')
  , Q = require('q')
  , WebBot = require('webbotjs')
  , baseDir, webBot;

baseDir = path.join(__dirname, '..');

describe('Automate web visit', function () {
  it('should play a google doc web test scenario', function (done) {
    this.timeout(20000);
    webBot = new WebBot(baseDir);
    Q().
      then(function () {
        var deferred = Q.defer();
        webBot.init(deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function () {
        var deferred = Q.defer();
        webBot.runStepsFromGdocScenario({
            gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
            sheetIndex: 0
          },
          deferred.makeNodeResolver()
        );
        return deferred.promise;
      }).
      then(done).
      catch(done);
  });
});
```

WebBotjs is able to download a Google Doc if it is published on the web, if an account is specified (login / password), or an oAuth token.

To specify a Google Account, simply add it to options :

```javascript
        webBot.runStepsFromGdocScenario({
            gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
            sheetIndex: 0,
            googleAccount: {
              login: 'johndoe',
              password: 'thesecret'
            }
          },
          deferred.makeNodeResolver()
        );
```

WebBotjs is mainly powered by [Zombiejs](http://zombie.labnotes.org/) and [Mocha](http://visionmedia.github.io/mocha/)

Enjoy !
