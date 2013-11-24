var _ = require('underscore');
var user = require('./user');

exports.toArray = function(data) {
  return _.map(data, function(value, key){
    value.id = key;
    return value;
  });
}

exports.latest = function (req, res, next) {
  var daresRef = db.child("dares");

  daresRef.once('value', function(data) {
    var array = exports.toArray(data.val());

    array = _.sortBy(array, function(data) {
      return -1*data.timestamp;
    });

    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(array));
    return next();
  });
}

exports.latestPersonalized = function (req, res, next) {
  var username = req.params.username;
  var daresRef = db.child("dares");

  daresRef.once('value', function(data) {
    var array = exports.toArray(data.val());

    array = _.sortBy(array, function(data) {
      return -1*data.timestamp;
    });

    var userRef = db.child("users").child(username);
    userRef.once('value', function(data) {
      data = data.val();
      if (data) {
        array = _.map(array, function(dare){
          dare.starred = _.contains(data.starred, dare.id);
          var accepted = _.map(data.dared, function(value) {
            if (value.dareid == dare.id && value.pending == false) {
              return value.dareid;
            }
          });
          dare.accepted = (accepted.length != 0);
          return dare;
        });
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify(array));
        return next(); 
      }
    });
    
  });
}

exports.promoted = function (req, res, next) {
  var daresRef = db.child("dares");
  daresRef.once('value', function(data){
    var array = exports.toArray(data.val());

    array = _.reject(array, function(data){
      return (!data.promoted);
    });

    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(array));
    return next();
  });
}

exports.inbox = function (req, res, next) {
  var username = req.params.username;

  var userRef = db.child("users").child(username);

  userRef.once('value', function(data){
    var response = {};
    response.dared = [];
    response.confirm = [];
    data = data.val();

    var daresRef = db.child("dares");

    daresRef.once('value', function(dares) {
      dares = dares.val();
      if (data.dared && data.dared.length > 0) {
        var daresArray = _.map(dares, function(value, key) {
          value.id = key;
          return value;
        });
        response.dared = _.reject(daresArray, function(dare) {
          return _.contains(data.dared, dare.id);
        });
      }

      var confirmRef = db.child("requests").child(username);
      confirmRef.once('value', function(requests) {
        requests = requests.val();
        if (requests) {
          response.dared = _.map(requests, function(r) {
            if (dares[r.dare]) {
              r.dareInfo = dares[r.dare];
              r.dareInfo.id = r.dare;
            }
            return r;
          });
        }

        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        console.log(response);
        res.end(JSON.stringify(response));
        return next();
      });
    });
  });
}

exports.starred = function (req, res, next) {
  var username = req.params.username;

  var userRef = db.child("users").child(username);

  userRef.once('value', function(data){
    data = data.val();

    if (!data) {
      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      var error = {error: 404, text: "requested user doesn't exist"};
      res.end(JSON.stringify(error));
      return next();
    }

    var daresRef = db.child("dares");

    daresRef.once('value', function(dares) {
      dares = dares.val();

      var response = _.map(data.starred, function(d) {
        var dare = dares[d];
        dare.id = d;
        dare.starred = true;
        var accepted = _.map(data.dared, function(value) {
            if (value.dareid == dare.id && value.pending == false) {
              return value.dareid;
            }
          });
        dare.accepted = (accepted.length != 0);
        return dare;
      });

      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify(response));
      return next();
    });
  });
}