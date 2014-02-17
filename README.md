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

## Configuration

Put a default js or json file in /config at the root of your project :

```javascript
module.exports = { // config/default.js
  log: {
    level: 'INFO' // ERROR, TRACE, ... see log4js for more information
  },
  browser: { // Default values, feel free to change
    runScripts: true,
    loadCSS: false,
    maxWait: 3 * 60,
    debug: false
  }
};
```

## Test scenario from JSON :

Suppose you have a simple http server providing a hello page, the test could be :

```javascript
var WebBot = require('webbotjs') // spec/myJsonSpec.js
  , webBot;

describe('Automate web visit', function () {
  it('should play a json web test scenario', function (done) {
    var jsonWebScenario;
    this.timeout(2000);
    webBot = new WebBot(__dirname);
    jsonWebScenario = [
      { index: '1', action: 'init', param1: 'http://localhost', param2: '' },
      { index: '2', action: 'visit', param1: '/hello.html', param2: '' },
      {
        index: '3', action: 'assert',
        param1: "expect(browser.text('title')).to.equal('Hey')",
        param2: "expect(browser.text('h1')).to.equal('Hello')"
      }
    ];
    webBot.runStepsFromJsonScenario(jsonWebScenario, function(err) {
        ...
    });
  });
});
```

WebBotjs will execute all steps in the JSON array to initialize the browser, visit the page, and check the resulting html page content.

## Test scenario from Google Doc :

Now let's see the same test with a scenario written in a [simple Google Doc](https://docs.google.com/spreadsheet/pub?key=0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc&output=html) :

```javascript
var WebBot = require('webbotjs') // spec/myGdocSpec.js
  , webBot;

describe('Automate web visit', function () {
  it('should play a google doc web test scenario', function (done) {
    this.timeout(20000);
    webBot = new WebBot(__dirname);
    webBot.runStepsFromGdocScenario({
        gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
        sheetIndex: 0
      }, function(err) {
        ...
      });
  });
});
```

WebBotjs is able to download a Google Doc if it is published on the web, if an account is specified (login / password), or if an oAuth token is specified.

To specify a Google Account, simply add it to options :

```javascript
        webBot.runStepsFromGdocScenario({
            gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
            sheetIndex: 0,
            googleAccount: {
              login: 'johndoe',
              password: 'thesecret'
            }
          }, function(err) {
            ...
          });
```

Test samples are provided in /spec : [webJsonScenarioSpec](https://github.com/openhoat/webbotjs/tree/master/spec/webJsonScenarioSpec.js) [webGdocScenarioSpec](https://github.com/openhoat/webbotjs/tree/master/spec/webGdocScenarioSpec.js)

## Actions

An action is a component defined by a name and a js file.

The action is execute from its name, and optionnal parameters.

Look at the examples in [/lib/actions](https://github.com/openhoat/webbotjs/tree/master/lib/actions) for more information.

Default provided actions :

- init : initialize the headless browser with a web site base url
- visit : browse an URI path of the web site
- assert : assert something given with any parameters using mocha syntax
- assertText : assert a selector text content is equal to an expected string
- click : click on a hyperlink in the current page, specified by a selector
- html : log the html content of the current page
- preview : preview the current page in a real browser (end the current test scenario)

More actions are coming soon...

## Extend

To extend WebBotjs, feel free to create new actions and add them at runtime for your custom scenario.

```javascript
    webBot = new WebBot(baseDir);
    webBot.addAction('myAction',path.join(__dirname, 'lib','my-action.js'));
    webBot.init(...); ...
```

Or simply add it in /config/default.js|json :

```javascript
var path = require('path');
module.exports = {
  log: {
    level: 'INFO'
  },
  actions: {
    myAction: path.join(__dirname, '..', 'lib', 'actions', 'my-action.js')
  }
};
```

Action my-action.js should implement :

```javascript
module.exports = { // lib/actions/my-action.js
  init: function() {},
  build: function (webBot, step) {
    return function () { // This function will be called during the execution of the test
      var param1, param2;
      webBot.logger.info('#%s start', step.index);
      param1=util.getItemParam(step, 1);
      param2=util.getItemParam(step, 2);
      // do something with param1, param2, webBot.browser (ie zombiejs), ...
      webBot.logger.info('#%s end', step.index);
    };
  }
};
```

WebBotjs is mainly powered by [Zombiejs](http://zombie.labnotes.org/) and [Mocha](http://visionmedia.github.io/mocha/)

Enjoy !
