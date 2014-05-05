var pkg = require('../package')
  , program = require('commander')
  , path = require('path')
  , fs = require('fs')
  , Q = require('niceq')
  , Mocha = require('mocha')
  , util = require('./util')
  , WebBot = require('./webbot')
  , scenarioConfig = require('./scenario-config')
  , defaultConfig = require('../config/default')
  , logger = require('nice-logger').logger
  , mocha, baseDir, webBot;

baseDir = path.join(__dirname, '..');

program.
  version(pkg.version).
  usage('[options] "command with args"').
  option('-g, --gdockey <key>', 'google doc key').
  option('-i, --sheetindex <number>', 'google sheet index', parseInt, 1).
  option('-p, --googleaccount <login:pwd>', 'optional google account', googleAccount).
  option('-j, --json <file>', 'scenario file in JSON format').
  option('-d, --jsonuri <uri>', 'scenario JSON URI to download').
  option('-q, --resgdockey <key>', 'resource google doc key').
  option('-r, --ressheetindex <n>', 'resource google sheet index', parseInt, 1).
  option('-p, --resgoogleaccount <login:pwd>', 'optional resource google account', googleAccount).
  option('-m, --resjson <file>', 'resource file in JSON format').
  option('-u, --resjsonuri <uri>', 'resource JSON URI to download').
  option('-l, --loglevel <silly|verbose|trace|info|http|warn|error|silent>', 'log level (silent to disable)', 'info').
  option('-C, --nocolors', 'force disabling of colors').
  option('-c, --colors', 'force enabling of colors', true).
  option('-t, --timeout <ms>', 'set test-case timeout in milliseconds [20000]', parseInt, 20000).
  option('-R, --reporter <name>', 'specify the reporter to use', 'spec').
  option('-a, --actions <list>', 'custom actions list (key:path items separated by comma)', customActionList).
  option('-n, --name <name>', 'specify scenario name', 'WebBot test scenario').
  option('-z, --uniquetest', 'if set, only one global test case is generated, else each step of the scenario generates a test case').
  option('-T, --tojson', 'return a json content based on the specified gdoc scenario', false).
  parse(process.argv);

mocha = new Mocha();
if (program.reporter) {
  mocha.reporter(program.reporter);
}
if (program.timeout) {
  mocha.suite.timeout(program.timeout);
}
if (program.nocolors) {
  mocha.useColors(false);
  defaultConfig.log.colorEnabled = false;
} else if (program.colors) {
  mocha.useColors(true);
}

if (program.actions) {
  defaultConfig.actions = program.actions;
}
defaultConfig.log.level = program.loglevel;

scenarioConfig.name = process.env['WEBBOT_JOB_NAME'] || program.name;
if (program.gdockey) {
  scenarioConfig.gdocKey = program.gdockey;
  scenarioConfig.sheetIndex = program.sheetindex;
  scenarioConfig.googleAccount = program.googleaccount;
} else if (program.jsonuri) {
  scenarioConfig.scenarioUri = program.jsonuri;
} else if (program.json) {
  if (program.json.indexOf('/') !== 0) {
    scenarioConfig.jsonScenario = path.join(process.cwd(), program.json);
  } else {
    scenarioConfig.jsonScenario = program.json;
  }
}
if (program.resgdockey) {
  scenarioConfig.resGdockey = program.resgdockey;
  scenarioConfig.resSheetIndex = program.ressheetindex;
  scenarioConfig.resGoogleaccount = program.resgoogleaccount;
} else if (program.resjsonuri) {
  scenarioConfig.resScenarioUri = program.resjsonuri;
} else if (program.resjson) {
  if (program.resjson.indexOf('/') !== 0) {
    scenarioConfig.resScenario = path.join(process.cwd(), program.resjson);
  } else {
    scenarioConfig.resScenario = program.resjson;
  }
}

mocha.bail(true);
mocha.files = [ path.join(__dirname, program.uniquetest ? 'global-testcase-spec' : 'dynamic-testcase-spec') ];

Q().
  niceThen(function (next,resolve) {
    webBot = new WebBot(baseDir);
    if (webBot.initialized) {
      resolve();
    } else {
      webBot.init(next);
    }
  }).
  niceThen(function (next,resolve) {
    var resourceDoc, options;
    if (scenarioConfig.resScenario) {
      resourceDoc = JSON.parse(fs.readFileSync(scenarioConfig.resScenario));
      resolve(resourceDoc);
    } else if (scenarioConfig.resScenarioUri) {
      util.downloadJsonUri(scenarioConfig.resScenarioUri, deferred.makeNodeResolver());
    } else if (scenarioConfig.resGdockey) {
      options = {
        gdocKey: scenarioConfig.resGdockey,
        sheetIndex: scenarioConfig.resSheetIndex,
        googleAccount: scenarioConfig.resGoogleAccount
      };
      util.googleSheetToJson(options, next);
    } else {
      resolve();
    }
  }).
  then(function (resourceDoc,next) {
    var options;
    if (scenarioConfig.jsonScenario) {
      options = {
        jsonScenario: JSON.parse(fs.readFileSync(scenarioConfig.jsonScenario)),
        resources: resourceDoc
      };
      logger.trace('scenario options :', JSON.stringify(options));
      webBot.buildScenarioFromJson(options, next);
    } else if (scenarioConfig.scenarioUri) {
      options = {
        scenarioUri: scenarioConfig.scenarioUri,
        resources: resourceDoc
      };
      logger.trace('scenario options :', options);
      webBot.buildScenarioFromDlJson(options, next);
    } else if (scenarioConfig.gdocKey) {
      options = {
        gdocScenario: {
          gdocKey: scenarioConfig.gdocKey,
          sheetIndex: scenarioConfig.sheetIndex,
          googleAccount: scenarioConfig.googleAccount
        },
        resources: resourceDoc
      };
      logger.trace('scenario options :', options);
      if (program.tojson) {
        util.googleSheetToJson(options.gdocScenario, function (err, jsonDoc) {
          if (err) {
            return handleError(err);
          }
          console.log(JSON.stringify(jsonDoc, null, 2));
          process.exit(0);
          return;
        });
      } else {
        webBot.buildScenarioFromGoogleDoc(options, next);
      }
    } else {
      throw new Error("missing scenario : don't know what to play");
    }
  }).
  then(function () {
    scenarioConfig.webBot = webBot;
    mocha.run(handleResult);
  }).
  catch(handleError);

function customActionList(actions) {
  var actionLines, result;
  result = {};
  actionLines = actions.split(',');
  actionLines.forEach(function (actionLine) {
    var actionSpecs = actionLine.split(':');
    result[actionSpecs[0]] = actionSpecs[1];
  });
  return result;
}

function googleAccount(googleAccount) {
  var accountSpecs = googleAccount.split(':');
  return {
    login: accountSpecs[0],
    password: accountSpecs[1]
  };
}

function handleError(err) {
  console.error('Error :', err);
  process.exit(1);
}

function handleResult(code) {
  console.log();
  process.exit(code);
}