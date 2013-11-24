var user = require('./user');
var _ = require('underscore');

exports.notifyCreator = function(creator, hero) {

  var hero_name = db.child("users").child(hero).child("name");

  hero_name.once('value', function(data) {
     user.sendNotification(hero,"Dare accomplished!",data.val() + " claimed to complete your dare. Click to check the validity.","com.code4fun.dare.FIN_DARE");
  });
}

exports.notifyUser = function(creator, hero, dareid) {

  var creator_name = db.child("users").child(creator).child("name");

  creator_name.once('value', function(data) {
     user.sendNotification(creator,"Congratulations!",data.val() + " has confirmed, that you successfully finished his dare! You received 5 experience points :)","com.code4fun.dare.DARE_SCORE");
  });
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

      if (!data) {
        data = [];
      }
      
      var newRequest = {
        hero: username,
        dare: dare_id,
        creator: creator
      };
      data.push(newRequest);
      requestRef.set(data);

      // send push notification
      exports.notifyCreator(newRequest.creator,newRequest.hero);
      exports.notifyUser(newRequest.creator,newRequest.hero,newRequest.dare);

      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify(newRequest));
      return next();
    });
  });
}

exports.confirm = function (req, res, next) {
  var dare_id = req.params.dareid;
  var hero = req.params.hero;
  var creator = req.params.creator;

  var requestRef = db.child("requests").child(creator);
  requestRef.once('value', function(data) {
    data = data.val();

    var confirmedDare;

    data = _.reject(data, function(request) {
      if (request.dare == dare_id && request.hero == hero && request.creator == creator) {
        confirmedDare = request;
        return true;
      }
      return false;
    });

    requestRef.set(data);

    user.addScore(hero, 5);

     // Add to accomplished
    user.getInfo(hero, function(param) {
      if (param) {
        var dares = db.child("users").child(hero).child("accomplished");

        if (!param.accomplished) {
          dares.set([dare_id]);
        }
        else {
          dares.set(_.union(param.accomplished,[dare_id]));
        }
      }
      else {
        console.log("Can't add to accomplished! Username " + hero + " doesn't exist.");
      }
    }); 

    exports.notifyUser(creator,hero,dare_id);

    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(confirmedDare));
    return next();
  });
}