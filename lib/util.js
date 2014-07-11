'use strict';

var hwUtil = require('hw-util')
  , GoogleSpreadsheet = require('google-spreadsheet')
  , Q = require('niceq')
  , request = require('request')
  , fs = require('fs')
  , util;

util = {
  assertTemplate: 'assertFunc = function(chai, expect, args) { %s };',
  downloadJsonUri: function (uri, callback) {
    Q().
      niceThen(function (next) {
        request({ method: 'GET', uri: uri }, next);
      }).
      spread(function (res, body) {
        if (res.statusCode !== 200) {
          throw new Error(res.statusCode);
        }
        callback(null, JSON.parse(body));
      }).
      catch(callback);
  },
  execAssertFunc: function (browser, jsCode, args) {
    var chai = require('chai')
      , expect = chai.expect
      , assertFunc;
    eval(util.format(util.assertTemplate, jsCode));
    return assertFunc(chai, expect, args);
  },
  forEachItemParam: function (item, callback) {
    var key, index;
    for (key in item) {
      if (item.hasOwnProperty(key) && key.indexOf('param') === 0) {
        index = parseInt(key.substring('param'.length), 10);
        callback(index, item[key]);
      }
    }
  },
  getItemParam: function (item, index) {
    return item[util.format('param%s', index)];
  },
  googleSheetToJson: function (options, callback) {
    var sheetIndex
      , authorization
      , spreadsheet;
    options = options || {};
    sheetIndex = options.sheetIndex || 0;
    if (typeof options.accessToken === 'string') {
      authorization = { type: 'Bearer', value: options.accessToken };
    }
    Q().
      niceThen(function (next, resolve) {
        spreadsheet = new GoogleSpreadsheet(options.gdocKey, authorization);
        if (typeof options.googleAccount === 'object') {
          spreadsheet.setAuth(options.googleAccount.login, options.googleAccount.password, next);
        } else {
          resolve();
        }
      }).
      niceThen(function (next) {
        spreadsheet.getInfo(next);
      }).
      niceThen(function (sheetInfo, next) {
        var worksheet;
        if (!sheetInfo || !sheetInfo.worksheets || !sheetInfo.worksheets[sheetIndex]) {
          throw 'No worksheet!';
        }
        worksheet = sheetInfo.worksheets[sheetIndex];
        worksheet.getRows(next);
      }).
      then(function (rows) {
        var jsonDoc = [];
        rows.forEach(function (row) {
          var jsonRow, resultRow;
          jsonRow = JSON.parse(JSON.stringify(row)); // Keep only json valid datas
          resultRow = {};
          Object.keys(jsonRow).
            filter(function (key) { // Filter metadata names to drop
              return ['_xml', 'id', 'title', 'content', '_links'].indexOf(key) === -1;
            }).
            forEach(function (key) { // Keep only real datas
              if (jsonRow[key] != '') {
                if (key === 'index') {
                  resultRow[key] = parseInt(jsonRow[key], 10);
                } else {
                  resultRow[key] = jsonRow[key];
                }
              }
            });
          jsonDoc.push(resultRow);
        });
        callback(null, jsonDoc);
      }).
      catch(callback);
  },
  scenarioStepGetOptions: function (step) {
    if (typeof step.options !== 'string') {
      return [];
    }
    return step.options.split(',');
  },
  scenarioStepHasOption: function (step, optionName) {
    return util.scenarioStepGetOptions(step).indexOf(optionName) !== -1;
  },
  actionErrorHandler: function (webBot, step, done) {
    return function (err) {
      if (err) {
        if (util.scenarioStepHasOption(step, 'noerror')) {
          webBot.logger.error(err);
        } else {
          done(err);
          return;
        }
      }
      done();
    };
  },
  computeResources: function (resources, logger) {
    var varRe , codeRe, key, resource, match, envVarValue;
    varRe = new RegExp('\\${[\\s]*([\\w]*)[\\s]*}');
    codeRe = new RegExp('{{[\\s]*(.+)[\\s]*}}');
    for (key in resources) {
      logger.trace('checking resource :', key);
      resource = resources[key];
      match = resource.match(codeRe);
      if (match) {
        logger.trace('resource \'%s\' has code references', key);
        resources[key] = eval(match[1]);
        logger.trace('resource \'%s\' computed', key);
      } else {
        match = resource.match(varRe);
        if (match) {
          logger.trace('resource \'%s\' has environment variable references', key);
          envVarValue = process.env[match[1]];
          if (envVarValue) {
            resources[key] = resource.replace(match[0], envVarValue);
            logger.trace('resource \'%s\' computed', key);
          } else {
            logger.error('environment variable \'%s\' is not defined!', match[1]);
          }
        }
      }
    }
  },
  populateResourcesForParam: function (resources, index, param, logger) {
    var paramSequences, key, resource, replacement, matches, re, dynParamIndex, dynFunc, dynParams;
    if (typeof resources !== 'object' || !resources) {
      return param;
    }
    re = new RegExp('{{[\\s]*[\\w]+[\\s]*}}');
    if (!param.match(re)) {
      return param;
    }
    logger.trace('populating resources for param : %s', param);
    paramSequences = {};
    for (key in resources) {
      console.log('key :', key);
      resource = resources[key];
      re = new RegExp('{{[\\s]*' + key + '[\\s]*}}');
      if (!param.match(re)) {
        continue;
      }
      replacement = null;
      if (typeof resource === 'object' && resource instanceof Array) {
        replacement = resource[Math.floor(Math.random() * resource.length)];
      } else if (typeof resource === 'string') {
        matches = resource.match(/(random|sequence)\((.*)\)/);
        if (matches) {
          dynFunc = matches[1];
          dynParams = matches[2].split(',');
          switch (dynFunc) {
            case 'random':
              dynParamIndex = Math.floor(Math.random() * dynParams.length);
              break;
            case 'sequence':
              dynParamIndex = paramSequences[index];
              if (typeof dynParamIndex === 'undefined') {
                dynParamIndex = 0;
              }
              paramSequences[index] = (dynParamIndex + 1) % dynParams.length;
              break;
            default:
              throw new Error(util.format('Bad resource format for param #%s [%s]', index, param));
          }
          replacement = dynParams[dynParamIndex];
        }
        if (replacement === null) {
          replacement = resource;
        }
      } else {
        continue;
      }
      logger.trace('replacing "%s" var with "%s" in param%s', key, replacement, index);
      param = param.replace(re, replacement);
    }
    logger.trace('resulting param%s :', index, param);
    return param;
  },
  jsonToCsv: function (json, callback) {
    var fieldSep = ',';
    Q().
      niceThen(function (next, resolve) {
        if (typeof json === 'string') {
          fs.readFile(json, 'utf-8', next);
        } else {
          resolve(json);
        }
      }).
      then(function (jsonDoc) {
        var csv, maxParam, line, i;
        if (typeof jsonDoc === 'string') {
          jsonDoc = JSON.parse(jsonDoc);
        }
        csv = [];
        maxParam = 0;
        jsonDoc.forEach(function (item, index) {
          line = util.format('"%s"', (index + 1));
          line += fieldSep;
          line += util.format('"%s"', typeof item.description === 'undefined' ? '' : item.description);
          line += fieldSep;
          line += util.format('"%s"', typeof item.action === 'undefined' ? '' : item.action);
          line += fieldSep;
          line += util.format('"%s"', typeof item.options === 'undefined' ? '' : item.options);
          i = 0;
          while (true) {
            if (typeof item['param' + (i + 1)] === 'undefined') {
              break;
            }
            line += fieldSep;
            line += util.format('"%s"', item['param' + (++i)]);
          }
          maxParam = Math.max(maxParam, i);
          csv.push(line);
        });
        line = '';
        ['Index', 'Description', 'Action', 'Options'].forEach(function (item) {
          if (line) {
            line += fieldSep;
          }
          line += util.format('"%s"', item);
        });
        for (i = 1; i <= maxParam; i++) {
          line += util.format('%s"Param%s"', fieldSep, i);
        }
        csv.splice(0, 0, line);
        callback(null, csv.join('\n'));
      }).
      catch(callback);
  }
};

hwUtil.extend(util, hwUtil);

module.exports = util;