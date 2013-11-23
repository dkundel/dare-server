var restify = require('restify');
var packageInfo = require('./package.json');
var config = require('./config.json');

// var user = require('./routes/user');
var dare = require('./routes/dare');
// var feed = require('./routes/feed');

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

server.get(/\/test\/?.*/, restify.serveStatic({
  directory: './public'
}));

server.post('/dare/accept/:id', dare.accept);

server.get('/dbtest', function  (req, res, next) {
	/*db.child('users').child('vlad').set({name: "Vlad", age: 12});
	db.child('users').on('value', function(snapshot) {
  		console.log(snapshot.val());
	});*/
});

server.listen(config.port, function () {
  console.log('%s listening at %s', server.name, server.url);
});