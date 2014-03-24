var hwUtil = require('hw-util')
  , GoogleSpreadsheet = require('google-spreadsheet')
  , Q = require('q')
  , request = require('request')
  , util;

util = {
  assertTemplate: "(function() { var chai = require('chai'), expect = chai.expect; %s; })();",
  downloadJsonUri: function (uri, callback) {
    Q().
      then(function () {
        var deferred = Q.defer();
        request({ method: 'GET', uri: uri }, deferred.makeNodeResolver());
        return deferred.promise;
      }).
      spread(function (res, body) {
        if (res.statusCode !== 200) {
          throw new Error(res.statusCode);
        }
        callback(null, JSON.parse(body));
      }).
      catch(callback);
  },
  execAssertFunc: function (browser, jsCode) {
    eval(util.format(util.assertTemplate, jsCode));
  },
  forEachItemParam: function (item, callback) {
    var index, param;
    index = 1;
    while (true) {
      param = util.getItemParam(item, index);
      if (!param) {
        break;
      }
      callback(index, param);
      index++;
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
      then(function () {
        var deferred = Q.defer();
        spreadsheet = new GoogleSpreadsheet(options.gdocKey, authorization);
        if (typeof options.googleAccount === 'object') {
          spreadsheet.setAuth(options.googleAccount.login, options.googleAccount.password, deferred.makeNodeResolver());
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      }).
      then(function () {
        var deferred = Q.defer();
        spreadsheet.getInfo(deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function (sheetInfo) {
        var deferred = Q.defer()
          , worksheet;
        if (!sheetInfo || !sheetInfo.worksheets || !sheetInfo.worksheets[sheetIndex]) {
          throw 'No worksheet!';
        }
        worksheet = sheetInfo.worksheets[sheetIndex];
        worksheet.getRows(deferred.makeNodeResolver());
        return deferred.promise;
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
  }
};

hwUtil.extend(util, hwUtil);

module.exports = util;