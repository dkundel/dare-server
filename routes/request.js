var user = require('./user');
var _ = require('underscore');

exports.notifyCreator = function(dare_id, creator, hero) {

}

exports.notifyUser = function(dare_id, hero, creator) {

}

exports.done = function (req, res, next) {
  var dare_id = req.params.id;
  var username = req.params.username;

  var dareRef = db.child("dares").child(dare_id);

  dareRef.once('value', function(data){
    data = data.val();
    var creator = data.creator;

    var requestRef = db.child("requests").child(creator);

    requestRef.once('value', function(data){
      data = data.val();
      var newRequest = {
        hero: username,
        dare: dare_id,
        creator: creator
      };
      data.push(newRequest);
      requestRef.set(data);

      // send push notification
      exports.notifyCreator(newRequest.dare_id, newRequest.creator, newRequest.hero);

      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify(newRequest));
      return next();
    });
  });
}

exports.confirm = function (req, res, next) {
  var dare_id = req.params.dare;
  var hero = req.params.hero;
  var creator = req.params.creator;

  var requestRef = db.child("requests").child(creator);
  requestRef.once('value', function(data) {
    data = data.val();

    var confirmedDare;

    data = _.reject(data, function(request) {
      if (request.dare == dare_id && request.hero == hero && request.creator == creator)
        confirmedDare = request;
        return true;
      }
      return false;
    });

    requestRef.set(data);

    user.addScore(hero, 50);
    exports.notifyUser(dare_id, hero, creator);

    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(confirmedDare));
    return next();
  });
}