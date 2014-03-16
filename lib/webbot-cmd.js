var pkg = require('../package')
  , program = require('commander')
  , path = require('path')
  , fs = require('fs')
  , Q = require('q')
  , WebBot = require('./webbot')
  , Mocha = require('mocha')
  , scenarioConfig = require('./scenario-config')
  , defaultConfig = require('../config/default')
  , logger = require('hw-logger').logger
  , mocha, baseDir, webBot;

baseDir = path.join(__dirname, '..');

program.
  version(pkg.version).
  usage('[options] "command with args"').
  option('-g, --gdockey <n>', 'google doc key').
  option('-i, --sheetindex <n>', 'google sheet index', parseInt, 1).
  option('-p, --googleaccount <login:pwd>', 'optional Google account', googleAccount).
  option('-j, --json <n>', 'scenario file in JSON format').
  option('-d, --jsonuri <n>', 'scenario JSON URI to download').
  option('-m, --resjson <n>', 'resource file in JSON format').
  option('-u, --resjsonuri <n>', 'resource JSON URI to download').
  option('-q, --ressheetindex <n>', 'resource google sheet index', parseInt, 1).
  option('-l, --loglevel <silly|verbose|trace|info|http|warn|error|silent>', 'log level (silent to disable)', 'info').
  option('-C, --nocolors', 'force disabling of colors').
  option('-c, --colors', 'force enabling of colors', true).
  option('-t, --timeout <ms>', 'set test-case timeout in milliseconds [2000]').
  option('-R, --reporter <name>', 'specify the reporter to use', 'spec').
  option('-a, --actions <list>', 'custom actions list (key:path items separated by comma)', customActionList).
  option('-n, --name <name>', 'specify scenario name', 'WebBot test scenario').
  option('-z, --uniquetest', 'if set, only one global test case is generated, else each step of the scenario generates a test case').
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

mocha.bail(true);
mocha.files = [ path.join(__dirname, program.uniquetest ? 'global-testcase-spec' : 'dynamic-testcase-spec') ];

Q().
  then(function () {
    var deferred = Q.defer();
    webBot = new WebBot(baseDir);
    if (webBot.initialized) {
      deferred.resolve();
    } else {
      webBot.init(deferred.makeNodeResolver());
    }
    return deferred.promise;
  }).
  then(function () {
    var deferred = Q.defer()
      , options
      , next;
    next = deferred.makeNodeResolver();
    if (scenarioConfig.jsonScenario) {
      options = JSON.parse(fs.readFileSync(scenarioConfig.jsonScenario));
      logger.trace('scenario options :', JSON.stringify(options));
      webBot.buildScenarioFromJson(options, next);
    } else if (scenarioConfig.scenarioUri) {
      options = scenarioConfig.scenarioUri;
      logger.trace('scenario options :', options);
      webBot.buildScenarioFromDlJson(options, next);
    } else if (scenarioConfig.gdocKey) {
      options = {
        gdocKey: scenarioConfig.gdocKey,
        sheetIndex: scenarioConfig.sheetIndex,
        googleAccount: scenarioConfig.googleAccount
      };
      logger.trace('scenario options :', options);
      webBot.buildScenarioFromGoogleDoc(options, next);
    } else {
      throw new Error("missing scenario : don't know what to play");
    }
    next();
    return deferred.promise;
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