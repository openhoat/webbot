[![Build Status](https://travis-ci.org/openhoat/webbotjs.png?branch=master)](https://travis-ci.org/openhoat/webbotjs)

## What's WebBotjs?

WebBotjs provides a beautiful way to automate web functional tests.

## Installation

To use it directly :

    # npm install -g webbotjs

To use it in your own project and write your web tests :

    # cd my-nodejs-project
    # npm install webbotjs --save

## Usage

Run a test scenario from a JSON file :

    # webbot -j ./webScenario1.json

Run a test scenario from a downloaded JSON file :

    # webbot -d http://localhost:3000/webScenario1.json

Run a test scenario from a Google Doc sheet :

    # webbot -g 0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc -i 1 -t 10000

## How it works?

1. Write a unit test with [Mocha](http://visionmedia.github.io/mocha/)
2. Specify the test scenario in JSON or a Google Doc
3. Run it :

        # mocha spec/myWebTest

4. Mocha returns 0 for a success test, and outputs info logs :

        info [2014-02-17 10:00:20.423] [webbot] - web server started.
        info [2014-02-17 10:00:20.424] [webbot] - #1 start
        info [2014-02-17 10:00:20.425] [webbot] - #1 initializing browser with site : http://localhost:3000
        info [2014-02-17 10:00:20.425] [webbot] - #1 end
        info [2014-02-17 10:00:20.426] [webbot] - #2 start
        info [2014-02-17 10:00:20.426] [webbot] - #2 visiting : /hello.html
        info [2014-02-17 10:00:20.440] [webbot] - incoming request : /hello.html
        info [2014-02-17 10:00:20.457] [webbot] - #2 browser statusCode : 200
        info [2014-02-17 10:00:20.457] [webbot] - #2 end
        html page content : <html><head><title>Hey</title></head><body><h1>Hello</h1><h2>this is a test</h2><form action="/form.html" method="post"><input type="text" name="field" /><input type="submit" value="ok" /></form></body></html>
        info [2014-02-17 10:00:20.462] [webbot] - #4 start
        info [2014-02-17 10:00:20.462] [webbot] - #4 checking assertion : expect(browser.text('title')).to.equal('Hey')
        ...
        info [2014-02-17 10:00:20.493] [webbot] - #9 end
        info [2014-02-17 10:00:20.493] [webbot] - WebBotjs test took 0,76312668 seconds
        info [2014-02-17 10:00:20.494] [webbot] - web server stopped.

5. Mocha returns 1 for a failing test :

        0 passing (81ms)
        1 failing

        1) Automate web visit should play a json web test scenario:

              AssertionError: expected 'this is the value' to equal 'this is the valuez'
              + expected - actual

              +"this is the valuez"
              -"this is the value"


## Configuration

Put a default js or json file in /config at the root of your project :

```javascript
module.exports = { // config/default.js
  log: {
    level: 'info' // error, trace, ... see --help for more informations
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
      { action: 'init', param1: 'http://localhost', param2: '' },
      { action: 'visit', param1: '/hello.html', param2: '' },
      {
        action: 'assert',
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

To specify a oAuth token (previously got from a usual 3rd party module for example) :

```javascript
        webBot.runStepsFromGdocScenario({
            gdocKey: '0AilC0U4Eb0tjdDRObHlrTDMySms2d0dGZUhWQi10Wmc',
            sheetIndex: 0,
            accessToken: 'TJSRYJ67354UZSGHS67SH3467356ZEFH'
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
- assertTimeLe : assert elapsed time since the beginning of the test does not exceed the specified duration in ms
- click : click on a hyperlink in the current page, specified by a selector
- fill : fill a form field with a value
- press : press a button
- wait : wait until the browser is ready, then go to next step
- html : log the html content of the current page
- preview : preview the current page in a real browser (end the current test scenario)

New web service actions since v0.0.8 : for more informatons look at [wsJsonScenarioSpec.js](https://github.com/openhoat/webbotjs/tree/master/spec/wsJsonScenarioSpec.js)

- wsGet : send a GET request to a web service (params : url, expected http status code, optionnal expected content type, optionnal expected content)
- wsPost : send a POST request to a web service (params : url, body data, expected http status code, optionnal expected content type, optionnal expected content)
- wsPut : send a PUT request to a web service (params : url, body data, expected http status code, optionnal expected content type, optionnal expected content)
- wsDelete : send a DELETE request to a web service (params : url, expected http status code, optionnal expected content type, optionnal expected content)

If it does not match your needs feel free to extend and contribute

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
    level: 'info'
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
      webBot.log.info('#%s start', step.index);
      param1=util.getItemParam(step, 1);
      param2=util.getItemParam(step, 2);
      // do something with param1, param2, webBot.browser (ie zombiejs), ...
      webBot.log.info('#%s end', step.index);
    };
  }
};
```

WebBotjs is mainly powered by [Zombiejs](http://zombie.labnotes.org/) and [Mocha](http://visionmedia.github.io/mocha/)

Enjoy !
