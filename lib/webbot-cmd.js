var pkg = require('../package')
  , program = require('commander')
  , path = require('path')
  , Mocha = require('mocha')
  , scenarioConfig = require('./scenario-config')
  , mocha;

program
  .version(pkg.version)
  .usage('[options] "command with args"')
  .option('-g, --gdockey <n>', 'Google doc key')
  .option('-i, --sheetindex <n>', 'Google sheet index', parseInt, 1)
  .option('-j, --json <n>', 'Scenario file in JSON format')
  .option('-d, --jsonuri <n>', 'Scenario JSON URI to download')
  .option('-l, --loglevel <ALL|TRACE|DEBUG|INFO|WARN|ERROR|FATAL|OFF>', 'Log level (see log4js for details)', 'INFO')
  .option('-C, --no-colors', 'force disabling of colors')
  .option('-t, --timeout <ms>', 'set test-case timeout in milliseconds [2000]')
  .option('-R, --reporter <name>', 'specify the reporter to use', 'spec')
  .parse(process.argv);

mocha = new Mocha();
if (program.reporter) {
  mocha.reporter(program.reporter);
}
if (program.timeout) {
  mocha.suite.timeout(program.timeout);
}
if (!program.colors) {
  mocha.useColors(false);
}
scenarioConfig.jsonScenario = program.json;
scenarioConfig.scenarioUri = program.jsonuri;
scenarioConfig.gdocKey = program.gdockey;
scenarioConfig.sheetIndex = program.sheetindex;
mocha.files = [ path.join(__dirname, 'webbotSpec') ];
mocha.run(process.exit);