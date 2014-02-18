var http = require('http')
  , querystring = require('querystring')
  , util = require('../lib/util')
  , that, httpServer;

that = {
  startWebServer: function (logger, callback) {
    httpServer = http.createServer(function (req, res) {
      var reqBody = '';
      logger.trace('incoming request : %s', req.url);
      if (req.url === '/form.html' && req.method === 'POST') {
        req.on('data', function (data) {
          reqBody += data;
        });
        req.on('end', function () {
          var params = querystring.parse(reqBody);
          res.write('<html><head><title>Form submitted</title></head><body>' +
            '<h1>Done</h1>' +
            util.format('<h2>%s</h2>', params.field) +
            '</body></html>');
          res.end();
        });
      } else if (req.url === '/hello.html') {
        res.write('<html><head><title>Hey</title></head><body>' +
          '<h1>Hello</h1><h2>this is a test</h2>' +
          '<form action="/form.html" method="post">' +
          '<input type="text" name="field">' +
          '<input type="submit" value="ok">' +
          '</form>' +
          '</body></html>');
        res.end();
      }
    });
    httpServer.listen(3000, function (err) {
      if (err) {
        return callback(err);
      }
      logger.info('web server started.');
      callback();
    });
  },
  stopWebServer: function (logger, callback) {
    httpServer.close(function () {
      logger.info('web server stopped.');
      callback();
    });
  }
};

module.exports = that;