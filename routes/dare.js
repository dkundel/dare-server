
var user = require('./user');

exports.create = function (req, res, next) {
  var dare = req.params.dare;

  var target = null;

  if (typeof dare.target !== 'undefined') {
    target =  dare.target;
    delete dare.target;
  }

  var newDareRef = db.child("dares").push(dare);
  
  var dare_id = newDareRef.path.m[1];

  user.addDare(req.params.dare.creator, dare_id);

  if (target !== null) {
    user.gotDared(target, dare_id);
  }

  res.send({id: dare_id});
  return next();
}

exports.getInfo = function(dare_id, callback) {
  var dareRef = db.child("dares").child(dare_id);
  dareRef.once('value', function(data) {
    callback(data.val());
  });
}

exports.get = function(req, res, next) {
  exports.getInfo(req.params.id, function(data) {
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(data));
    return next();
  });
}

// echos
exports.accept = function (req, res, next) {
  var dare_id = req.params.id;
  var username = req.params.username;

  user.acceptDare(username, dare_id);

  res.send('Challenge Accepted!');
  return next();
}

exports.reject = function (req, res, next) {
  var dare_id = req.params.id;
  var username = req.params.username;

  user.deleteDare(username, dare_id);

  res.send('Scared?');
  return next();
}

exports.claim = function (req, res, next) {
  var dare_id = req.params.id;
  var username = req.params.username;

  exports.getInfo(dare_id, function(data) {
    var creator = data.creator;
    //request.create(dare_id, creator, username);
  });
}