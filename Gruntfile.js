'use strict';

module.exports = function (grunt) {
  var gruntConfig;
  gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      default: ['dist', 'tmp']
    },
    mkdir: {
      all: {
        options: {
          create: ['dist/reports']
        }
      }
    },
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        force: true,
        jshintrc: 'jshint.json'
      },
      src: [
        'lib/**/*.js',
        'test/**/*.js'
      ]
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/webJsonScenarioSpec.js', 'test/wsJsonScenarioSpec.js', 'test/webJsonDlScenarioSpec.js', 'test/webGdocScenarioSpec.js', 'test/wsJsonDlScenarioSpec.js', 'test/soapSpec.js']
      }
    },
    exec: {
      coverage: {
        command: './node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- --ui bdd -R spec -t 5000 test/webJsonScenarioSpec.js test/wsJsonScenarioSpec.js test/webJsonDlScenarioSpec.js test/webGdocScenarioSpec.js test/wsJsonDlScenarioSpec.js test/soapSpec.js'
      }
    }
  };
  if (grunt.option('ci')) {
    gruntConfig.jshint.options.reporter = 'checkstyle';
    gruntConfig.jshint.options.reporterOutput = 'dist/reports/jshint_checkstyle.xml';
    gruntConfig.mochaTest.test.options.reporter = 'xunit-file';
    gruntConfig.mochaTest.test.options.quiet = false;
    require('./config/default').log.colorEnabled = false;
    process.env.XUNIT_FILE = 'dist/reports/xunit.xml';
  }
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  grunt.initConfig(gruntConfig);
  grunt.registerTask('verify', ['mkdir', 'jshint']);
  grunt.registerTask('test', ['mkdir', 'mochaTest']);
  grunt.registerTask('cover', ['mkdir', 'exec:coverage']);
  grunt.registerTask('default', ['verify', 'test', 'cover']);
};