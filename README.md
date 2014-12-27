[![Build Status](https://travis-ci.org/openhoat/webbot.png?branch=master)](https://travis-ci.org/openhoat/webbot)
[![NPM version](https://badge.fury.io/js/webbot.svg)](http://badge.fury.io/js/webbot)

## What's WebBot?

WebBot provides a beautiful way to automate web functional tests.

## Features :

- Works with embedded phantomjs browser, any installed usual browser, or any available selenium grid hub
- Provides a clean frame to separate config data and scenario
- Provides a simple command line to execute web tests, easily integrate them into a CI, and create industrial testing projects
- Provides a browser object augmented with useful methods (see [client-commands.js](https://github.com/openhoat/webbot/blob/master/lib/client-commands.js))

## Installation :

    # npm install -g webbot

## Usage :

### Create a test project :

    # mkdir myproject && cd myproject

### Create expected directory structure :

- scenarii (this is where to place test scripts)
    - mywebtest.js
- config (optionnal place for test scripts configurations)
    - default (default environment)
        - mywebtest.[js|json]
    - live (an environment called 'live')
        - mywebtest.[js|json] (will override default config)

Example of directory structure :

- [config](https://github.com/openhoat/webbot/tree/master/config/scenarii)
- [scenarii](https://github.com/openhoat/webbot/tree/master/scenarii)

### Play WebBot :

    # webbot -e live -s mywebtest

Result :

      webbot:info webbot - using browser : phantomjs [platform : ANY] +0ms

      Simple web test
      webbot:info browser - #1 - Connect to http://www.google.com +1s
      webbot:info browser - #2 - Check page title : Google +827ms
        ✓ should home page (1782ms)


      1 passing (2s)

### Command line options :

- --dir (-d) : base directory of scenarii and configuration files, it should respect directory structure (default : current dir)
- --env (-e) : environnement name to use for configuration, it should be a child of config directory where to find configuration json files (example : live)
- --scenario (-s) : scenario to execute, it should be placed under scenarii directory (example : mywebtest)
- --options (-o) : webdriver browser options, in JSON string format, as specified in [WebdriverIO](http://webdriver.io/guide.html) remote options
- --commands (-c) : extra client commands module to register, it should be a collection of functions to add to the browser object as specified in [WebdriverIO custom commands](http://www.webdriver.io/guide/usage/customcommands.html) (example : lib/myCustomCommands)
- --loglevel (-l) : log level to enable (error|warn|info|debug|trace)

WebBot is mainly powered by [WebdriverIO](http://webdriver.io/) and [Mocha](http://visionmedia.github.io/mocha/)

Enjoy !
