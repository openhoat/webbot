var path = require('path')
  , baseDir;

baseDir = path.join(__dirname, '..', '..'); // base dir of the project

module.exports = { // main configuration for all environments
  env: process.env.NODE_ENV || 'development', // effective environment
  baseDir: baseDir,
  browser: {
    logLevel: 'silent', // possible values : silent verbose
    desiredCapabilities: {
      browserName: 'phantomjs', // available values : firefox chrome phantomjs
      javascriptEnabled: true,
      platform: 'ANY',
      'phantomjs.binary.path': path.join(baseDir, 'node_modules', 'phantomjs', 'bin', 'phantomjs'),
      'phantomjs.cli.args': ['--ignore-ssl-errors=true',  '--web-security=false']
    }
  },
  selenium: {
    host: 'localhost',
    port: 4444,
    path: '/wd/hub/status',
    spawn: {stdio: 'pipe'},
    args: ['-debug']
  },
  mocha: {
    reporter: 'spec',
    timeout: 10000
  },
  defaults: {
    waitForDuration: 5000
  }
};