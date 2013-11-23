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

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.listen(config.port, function () {
  console.log('%s listening at %s', server.name, server.url);
});