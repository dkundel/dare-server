var restify = require('restify');
var packageInfo = require('./package.json');
var config = require('./config.json');

var user = require('./routes/user');
var dare = require('./routes/dare');
var feed = require('./routes/feed');

// WATCHOUT GLOBAL STUFF!
firebase = require('firebase');
db = new firebase(config.firebaseUrl);

var server = restify.createServer({
  name: packageInfo.name,
  version: packageInfo.version
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


// Users
server.get('/user/test/:username',user.test);
server.post('/user/create', user.create);
server.get('/user/:username', user.get);

// Dares
server.post('/dare/create', dare.create);
server.get('/dare/:id', dare.get);

server.get(/\/test\/?.*/, restify.serveStatic({
  directory: './public'
}));

server.listen(config.port, function () {
  console.log('%s listening at %s', server.name, server.url);
});