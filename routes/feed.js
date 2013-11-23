var _ = require('underscore');

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
      return (new Date(data.timestamp)).getTime();
    });


    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(array));
    return next();
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