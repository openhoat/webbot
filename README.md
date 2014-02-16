[![Build Status](https://travis-ci.org/openhoat/webbotjs.png?branch=master)](https://travis-ci.org/openhoat/webbotjs)

## What's webbotjs?

It provides a beautiful way to automate your web tests.

## Installation

    # cd my-nodejs-project
    # npm install webbotjs --save

## How it works?

1. Write a unit test with [Mocha](http://visionmedia.github.io/mocha/)
2. Specify the test scenario in JSON or a Google Doc
3. Run it :

        # mocha spec/myWebTest

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
      {
        index: '3', action: 'assert',
        param1: "expect(browser.text('title')).to.equal('Hey')",
        param2: "expect(browser.text('h1')).to.equal('Hello')"
      }
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

## Actions

An action is a component defined by a name and a js file.
The action is execute from its name, and optionnal parameters.
Look at the examples in [lib/actions](https://github.com/openhoat/webbotjs/tree/master/lib/actions) for more information.

Default provided actions :

- init : initialize the headless browser with a web site base url
- visit : browse an URI path of the web site
- assert : assert something given with any parameters using mocha syntax
- assertText : assert a selector text content is equal to an expected string
- click : click on a hyperlink in the current page, specified by a selector
- html : log the html content of the current page
- preview : preview the current page in a real browser (end the current test scenario)

## Extend

To extend WebBotjs, feel free to create new actions and add them to WebBot, between constructor call and init().

```javascript
    webBot = new WebBot(baseDir);
    webBot.addAction('myAction',path.join(__dirname, 'lib','my-action.js'));
    webBot.init(...); ...
```

Or simply add it in your config file :

```javascript
var path = require('path')
  , config = {
  log: {
    level: 'INFO'
  },
  actions: {
    myAction: path.join(__dirname, '..', 'lib', 'actions', 'my-action.js')
  }
};
module.exports = config;
```

WebBotjs is mainly powered by [Zombiejs](http://zombie.labnotes.org/) and [Mocha](http://visionmedia.github.io/mocha/)

Enjoy !
