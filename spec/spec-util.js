var http = require('http')
  , that, httpServer;

that = {
  startWebServer: function (logger, callback) {
    httpServer = http.createServer(function (req, res) {
      if (req.url === '/hello.html') {
        res.write('<html><head><title>Hey</title></head><body><h1>Hello</h1><h2>this is a test</h2></body></html>');
      }
      res.end();
    });
    httpServer.listen(3000, function () {
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