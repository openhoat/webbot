module.exports = function (grunt) {
  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      default: ['dist']
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
        jshintrc: 'jshint.json',
        force: true
      },
      all: [
        'lib/**/*.js',
        'app.js'
      ]
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        //src: ['spec/**/*Spec.js']
        src: [ 'spec/webJsonScenarioSpec.js' ]
      }
    }
  };
  if (grunt.option('ci')) {
    gruntConfig.jshint.options.reporter = 'checkstyle';
    gruntConfig.jshint.options.reporterOutput = 'dist/reports/jshint_checkstyle.xml';
    gruntConfig.mochaTest.test.options.reporter = 'xunit-file';
    gruntConfig.mochaTest.test.options.quiet = true;
    process.env.XUNIT_FILE = 'dist/reports/xunit.xml';
  }
  grunt.initConfig(gruntConfig);
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('verify', ['mkdir', 'jshint']);
  grunt.registerTask('test', ['mkdir', 'mochaTest']);
  grunt.registerTask('default', ['verify', 'test']);
};