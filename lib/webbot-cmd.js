var pkg = require('../package')
  , program = require('commander')
  , path = require('path')
  , Mocha = require('mocha')
  , log = require('./webbot').log
  , scenarioConfig = require('./scenario-config')
  , defaultConfig = require('../config/default')
  , mocha;

program.
  version(pkg.version).
  usage('[options] "command with args"').
  option('-g, --gdockey <n>', 'Google doc key').
  option('-i, --sheetindex <n>', 'Google sheet index', parseInt, 1).
  option('-p, --googleaccount <login:pwd>', 'Optional Google account', googleAccount).
  option('-j, --json <n>', 'Scenario file in JSON format').
  option('-d, --jsonuri <n>', 'Scenario JSON URI to download').
  option('-l, --loglevel <silly|verbose|trace|info|http|warn|error|silent>', 'Log level (silent to disable)', 'info').
  option('-C, --nocolors', 'force disabling of colors').
  option('-c, --colors', 'force enabling of colors', true).
  option('-t, --timeout <ms>', 'set test-case timeout in milliseconds [2000]').
  option('-R, --reporter <name>', 'specify the reporter to use', 'json').
  option('-a, --actions <list>', 'custom actions list (key:path items separated by comma)', customActionList).
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
} else if (program.colors) {
  mocha.useColors(true);
}

if (program.actions) {
  defaultConfig.actions = program.actions;
}
defaultConfig.log.level = program.loglevel;
if (program.nocolors) {
  log.disableColor();
}

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

mocha.files = [ path.join(__dirname, 'webbotSpec') ];

mocha.run(process.exit);

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