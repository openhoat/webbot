var http = require('http')
  , querystring = require('querystring')
  , util = require('../lib/util')
  , that, httpServer
  , entities;

entities = [
  {
    id: '123',
    firstName: 'John',
    lastName: 'Doe'
  }
];

that = {
  startWebServer: function (logger, callback) {
    httpServer = http.createServer(function (req, res) {
        logger.trace('incoming request : %s', req.url);
        if (req.url === '/hello.html' && req.method === 'GET') {
          webGetHello(req, res);
        } else if (req.url === '/form.html' && req.method === 'POST') {
          webPostForm(req, res);
        } else if (req.url.indexOf('/ws/contact') === 0) {
          if (req.method === 'GET') {
            wsGetContact(req, res);
          } else if (req.method === 'POST') {
            wsPostContact(req, res);
          } else if (req.method === 'PUT') {
            wsPutContact(req, res);
          } else if (req.method === 'DELETE') {
            wsDelContact(req, res);
          } else {
            res.writeHead(400);
            res.end();
          }
        } else if (req.url === '/webScenario1.json' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(require('./webScenario1.json')));
          res.end();
        } else if (req.url === '/wsScenario1.json' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(require('./wsScenario1.json')));
          res.end();
        }
      }
    );
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

function webGetHello(req, res) {
  res.write('<html><head><title>Hey</title></head><body>' +
    '<h1>Hello</h1><h2>this is a test</h2>' +
    '<form action="/form.html" method="post">' +
    '<input type="text" name="field">' +
    '<input type="submit" value="ok">' +
    '</form>' +
    '</body></html>');
  res.end();
}

function webPostForm(req, res) {
  var reqBody;
  reqBody = '';
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
}

function wsGetContact(req, res) {
  var id, result;
  id = req.url.substring('/ws/contact/'.length);
  result = entities.filter(function (item) {
    return item.id === id;
  });
  if (result && result.length) {
    result = result[0];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(result));
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
}

function wsPostContact(req, res) {
  var reqBody;
  reqBody = '';
  req.on('data', function (data) {
    reqBody += data;
  });
  req.on('end', function () {
    var params = querystring.parse(reqBody);
    if (params) {
      entities.push(params);
      res.writeHead(201);
      res.end();
    } else {
      res.writeHead(400);
      res.end();
    }
  });
}

function wsPutContact(req, res) {
  var reqBody, id, result;
  reqBody = '';
  id = req.url.substring('/ws/contact/'.length);
  result = entities.filter(function (item) {
    return item.id === id;
  });
  if (result && result.length) {
    result = result[0];
    req.on('data', function (data) {
      reqBody += data;
    });
    req.on('end', function () {
      var params = querystring.parse(reqBody);
      if (params) {
        result.firstName = params.firstName;
        result.lastName = params.lastName;
        res.writeHead(204);
        res.end();
      } else {
        res.writeHead(400);
        res.end();
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
}

function wsDelContact(req, res) {
  var id, result, index;
  id = req.url.substring('/ws/contact/'.length);
  result = entities.filter(function (item) {
    return item.id === id;
  });
  if (result && result.length) {
    result = result[0];
    index = entities.indexOf(result);
    entities.splice(index, 1);
    res.writeHead(204);
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
}