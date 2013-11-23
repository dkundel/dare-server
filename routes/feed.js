var _ = require('underscore');

exports.latest = function (req, res, next) {
  var daresRef = db.child("dares");

  daresRef.once('value', function(data) {
    data = data.val();
    var array = _.map(data, function(value, key){
      value.id = key;
      return value;
    });

    array = _.sortBy(array, function(data) {
      return (new Date(data.timestamp)).getTime();
    });


    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(array));
    return next();
  });
}