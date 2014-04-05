var url = require('url')
  , Q = require('q')
  , Imap = require('imap')
  , that;

function closeEmailServer(imap, callback) {
  imap.end();
  if (callback) {
    callback();
  }
}

function fetchEmail(step, options, searchCriteria, fetchCriteriaFunc, logger, callback) {
  var imap, mailBox, matchingEmails;
  imap = new Imap(options);
  Q().
    then(function () {
      var deferred = Q.defer();
      imap.once('ready', deferred.resolve);
      return deferred.promise;
    }).
    then(function () {
      var deferred = Q.defer();
      logger.info('#%s waiting for incoming email', step.index);
      imap.openBox('INBOX', deferred.makeNodeResolver());
      return deferred.promise;
    }).
    then(function (box) {
      var deferred = Q.defer();
      mailBox = box;
      if (searchCriteria) {
        imap.search(searchCriteria, deferred.makeNodeResolver());
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }).
    then(function (searchResult) {
      return fetchCriteriaFunc(imap, mailBox, searchResult);
    }).
    then(function (fetch) {
      if (!fetch) {
        closeEmailServer(imap);
        return;
      }
      fetch.on('message', function (msg, seqno) {
        var header, from, subject, body, msgId;
        logger.trace('fetch message event');
        matchingEmails = [];
        msg.on('body', function (stream, info) {
          var buffer;
          logger.trace('message body event');
          buffer = '';
          stream.on('data', function (chunk) {
            logger.trace('message stream data event');
            buffer += chunk.toString('utf8');
          });
          stream.once('end', function () {
            logger.trace('message stream end event');
            if (info.which === 'TEXT') {
              body = buffer;
            } else {
              header = buffer.split('\r\n');
              from = header[0].substring('From :'.length);
              subject = header[1].substring('Subject :'.length);
            }
          });
        });
        msg.once('attributes', function (attrs) {
          msgId = attrs.uid;
          logger.trace('message id :', msgId);
        });
        msg.once('end', function () {
          logger.trace('message end event');
          matchingEmails.push({
            id: msgId,
            from: from,
            subject: subject,
            body: body
          });
        });
      });
      fetch.once('error', function (err) {
        logger.error('Error :', err);
      });
      fetch.once('end', function () {
        logger.info('#%s done fetching all messages', step.index);
        imap.end();
      });
    }).
    catch(function (err) {
      closeEmailServer(imap, function () {
        callback(err);
      });
    });
  imap.once('error', function (err) {
    logger.trace('imap error event');
    closeEmailServer(imap, function () {
      callback(err);
    });
  });
  imap.once('end', function () {
    logger.trace('imap end event');
    closeEmailServer(imap, function () {
      callback(null, matchingEmails);
    });
  });
  imap.connect();
}

that = {
  build: function (webBot, step) {
    var logger = webBot.logger;
    return function (done) {
      var util = webBot.util
        , options
        , fromCriteria
        , subjectCriteria
        , bodyActivationLinkFilter
        , pollFrequency;
      logger.info('#%s start', step.index);
      options = {
        host: util.getItemParam(step, 1),
        port: parseInt(util.getItemParam(step, 2), 10),
        tls: (util.getItemParam(step, 3) || 'false').toLowerCase() === 'true',
        user: util.getItemParam(step, 4),
        password: util.getItemParam(step, 5)
      };
      fromCriteria = util.getItemParam(step, 6);
      subjectCriteria = util.getItemParam(step, 7);
      bodyActivationLinkFilter = util.getItemParam(step, 8);
      pollFrequency = parseInt(util.getItemParam(step, 9) || '10000', 10);

      function fetchCriteriaLastEmail(imap, box, searchResult) {
        if (searchResult.length) {
          return imap.fetch(searchResult, { markSeen: true, bodies: ['HEADER.FIELDS (FROM SUBJECT)', 'TEXT'] });
        } else {
          return null;
        }
      }

      function fetchActivationEmail() {
        fetchEmail(
          step,
          options,
          [ 'UNSEEN', ['HEADER', 'SUBJECT', subjectCriteria],
            ['HEADER', 'FROM', fromCriteria] ],
          fetchCriteriaLastEmail,
          logger,
          checkEmail
        );
      }

      function checkEmail(err, emails) {
        var i, email, body, matches, from, activationLink;
        if (err) {
          return done(err);
        }
        if (emails && emails.length) {
          logger.info('number of email fetched : %s', emails.length);
          for (i = emails.length; i >= 0; i--) {
            email = emails[0];
            body = email.body.split('=\r\n').join('').split('\r\n').join('');
            logger.trace('email body :', body);
            matches = body.match(new RegExp(bodyActivationLinkFilter));
            logger.trace('email body matches :', matches);
            if (matches && matches[1]) {
              activationLink = matches[1];
              break;
            }
          }
        } else {
          logger.error('no email fetched with specified criterias');
        }
        if (activationLink) {
          doActivationPage(activationLink);
        } else {
          logger.error('no activation link found : waiting for next email');
          setTimeout(fetchActivationEmail, pollFrequency);
        }
      }

      function doActivationPage(activationLink) {
        var urlSpecs;
        logger.trace('activationLink :', activationLink);
        urlSpecs = url.parse(activationLink);
        activationLink = urlSpecs.path;
        webBot.browser.site = urlSpecs.protocol + '//' + urlSpecs.hostname;
        webBot.browser.runScripts = webBot.config.runScripts;
        webBot.browser.loadCSS = webBot.config.loadCSS;
        webBot.browser.maxWait = webBot.config.maxWait;
        webBot.browser.debug = webBot.config.debug;
        webBot.browser.
          visit(activationLink).
          then(function () {
            logger.info('#%s end', step.index);
          }).
          then(done).
          catch(function (err) {
            if (webBot.browser.statusCode === 412) {
              logger.error('activation link already submitted : waiting for next email');
              setTimeout(fetchActivationEmail, pollFrequency);
              return;
            }
            done(err);
          });
      }

      fetchActivationEmail();
    };
  }
};

module.exports = that;