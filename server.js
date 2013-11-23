var restify = require('restify');
var packageInfo = require('./package.json');
var config = require('./config.json');

var server = restify.createServer({
  name: packageInfo.name,
  version: packageInfo.version
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

var firebase = require('firebase');
var db = new firebase(config.firebaseUrl);

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.get('/dbtest', function  (req, res, next) {
	/*db.child('users').child('vlad').set({name: "Vlad", age: 12});
	db.child('users').on('value', function(snapshot) {
  		console.log(snapshot.val());
	});*/
});

server.listen(config.port, function () {
  console.log('%s listening at %s', server.name, server.url);
});