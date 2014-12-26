var path = require('path')
  , baseDir;

baseDir = path.join(__dirname, '..', '..'); // base dir of the project

module.exports = { // Configuration for production environment
  defaults: {
    waitForDuration: 2000
  }
};