var restify = require('restify');
var Parse = require('node-parse-api').Parse;
var packageInfo = require('./package.json');
var config = require('./config.json');

var user = require('./routes/user');
var dare = require('./routes/dare');
var feed = require('./routes/feed');
var request = require('./routes/request');

// WATCHOUT GLOBAL STUFF!
firebase = require('firebase');
db = new firebase(config.firebaseUrl);
parseapp = new Parse(config.parseAppId, config.parseMasterKey);

var server = restify.createServer({
  name: packageInfo.name,
  version: packageInfo.version
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Users
server.get('/user/:username', user.get);
server.post('/user/create', user.create);
server.post('/user/star', user.star);
server.post('/user/unstar', user.unstar);

// Dares
server.post('/dare/create', dare.create);
server.get('/dare/:id', dare.get);
server.post('/dare/accept',dare.accept);
server.post('/dare/reject',dare.reject);

server.get('/feed/latest', feed.latest);
server.get('/feed/promoted', feed.promoted);
server.get('/feed/inbox/:username', feed.inbox);

server.post('/request/done', request.done);
server.post('/request/confirm', request.confirm);

server.get(/\/test\/?.*/, restify.serveStatic({
  directory: './public'
}));

server.listen(config.port, function () {
  console.log('%s listening at %s', server.name, server.url);
});