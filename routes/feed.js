var _ = require('underscore');

exports.latest = function (req, res, next) {
  var daresRef = db.child("dares");

  daresRef.once('value', function(data) {
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(data.val()));
    return next();
  });
}