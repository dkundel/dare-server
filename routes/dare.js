var user = require('./user');

// Tester function extravaganza
exports.test = function (req, res, next) {
  var param = req.params;
  exports.accept(param.username, 4);
}

// Create a new dare (tested)
exports.create = function (req, res, next) {
  var dare = req.params;

  var newDareRef = db.child("dares").push(dare);
  var dare_id = newDareRef.path.m[1];

  user.addDare(dare.creator, dare_id);

  if (dare.target) {
    // TODO: Check if target exists!!!
    user.gotDared(dare.target, dare_id);
  }

  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(dare));
  return next();
}

// Internal get information (tested)
exports.getInfo = function(dare_id, callback) {
  var dareRef = db.child("dares").child(dare_id);
  dareRef.once('value', function(data) {
    callback(data.val());
  });
}

// Request to get information (tested)
exports.get = function(req, res, next) {
  exports.getInfo(req.params.id, function(data) {
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(data));
    return next();
  });
}

// Redundant?
/*
// Accept a dare
exports.accept = function (req, res, next) {
  var dare_id = req.params.id;
  var username = req.params.username;

  user.acceptDare(username, dare_id);

  res.send('Challenge Accepted!');
  return next();
}

// Reject a dare
exports.reject = function (req, res, next) {
  var dare_id = req.params.id;
  var username = req.params.username;

  user.deleteDare(username, dare_id);

  res.send('Scared?');
  return next();
}

// Claim that you completed dare
exports.claim = function (req, res, next) {
  var dare_id = req.params.id;
  var username = req.params.username;

  exports.getInfo(dare_id, function(data) {
    var creator = data.creator;
    //request.create(dare_id, creator, username);
  });
}
*/