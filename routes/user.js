// (to enable advanced array functions (_.))
var _ = require('underscore');

// Create a new user, based on Fb auth data (tested)
exports.create = function (req, res, next) {
  
  var data = req.params;
  var new_user = db.child("users").child(data.screen_name);

  new_user.set({
  	id: data.id, 
  	name: data.name,
  	imageurl: data.profile_image_url,
  	username: data.screen_name,
  	score: 0,
  	//my_dares: [] -> empty arrays won't get written to Firebase
  	//dared : [] -> same as above
  	//starred: [] -> got it until now, i hope :D
  	//accomplished: [] -> how many arrays do you freaking have?!
  });

  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify({status: "success"}));
  return next();
}

// Request a data about user (tested)
exports.get = function(req, res, next) {

	var param = req.params;

	exports.getInfo(param.username, function(data) { 
		res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});

		if (data) {
  			res.end(JSON.stringify(data));
  		}
  		else {
  			var error = {error: 404, text: "requested user doesn't exist"};
  			res.end(JSON.stringify(error));
  		}

  		return next();
  	});
}

// Internal function to get information about the user (tested)
exports.getInfo = function(username, callback) {

	var user = db.child("users").child(username);

	user.once('value', function(data) {
  		callback(data.val());
	});
}

// Send notification to a user
exports.sendNotification = function(username, title, msg, action) {

	var notification = {
	  channels: [username],
	  data: {
	  	title: title,
	    alert: msg,
	    action: action
	  }
	};

	parseapp.sendPush(notification, function(err, resp){
		if (err) {
			console.log("Push notification failed with error: " + err);
		}
	});
}

// Internal function to alter score of the user (by adding score value) (tested)
exports.addScore = function(username, score) {

	exports.getInfo(username, function(data) {
		if (data) {
			var userscore = db.child("users").child(username).child("score");
			userscore.set(data.score + score);
		}
		else {
			console.log("Username " + username + " was not found!");
		}
	});
}

// Internal function to add a new dare to users' array of dares (tested)
exports.addDare = function(username, dareid, callback) {

	exports.getInfo(username, function(data) {
		if (data) {
			var dares = db.child("users").child(username).child("my_dares");

			if (!data.my_dares) {
				dares.set([dareid]);
			}
			else {
				dares.set(_.union(data.my_dares,[dareid]));
			}

			callback({status: "success"});
		}
		else {
			callback({status: "error", error: 404, text:"requested user doesn't exist"})
		}
	});	
}


// Internal function to add a new dare, sent to the user (tested)
exports.gotDared = function(username, dareid, callback) {

	exports.getInfo(username, function(data) {
		if (data) {
			var dares = db.child("users").child(username).child("dared");

			if (!data.dared) {
				dares.set([{dareid: dareid, pending: true, done: false}]);
			}
			else {
				dares.set(_.union(data.dared,[{dareid: dareid, pending: true, done: false}]));
			}

			callback({status: "success"});
		}
		else {
			callback({status: "error", error: 404, text:"requested user doesn't exist"})
		}
	});	
}

// Internal function to accept a dare request (not pending anymore) (tested)
exports.acceptDare = function(username, dareid, callback) {

	exports.getInfo(username, function(data) {
		if (data) {
			var dares = db.child("users").child(username).child("dared");

			if (data.dared) {
				var temp = data.dared;

				_.each(temp,function(elem) { 
					if (elem.dareid == dareid) {
						elem.pending = false; // accepted challenge
					}
				});

				dares.set(temp);
			}

			callback({status: "success"});
		}
		else {
			callback({status: "error", error: 404, text:"requested user doesn't exist"})
		}
	});	
}


// Internal function to reject a dare request and delete it from the list (tested)
exports.deleteDare = function(username, dareid,callback) {

	exports.getInfo(username, function(data) {
		if (data) {
			var dares = db.child("users").child(username).child("dared");

			if (data.dared) {
				dares.set(_.reject(data.dared,function(elem) { return elem.dareid == dareid}));
			}

			callback({status: "success"});
		}
		else {
			callback({status: "error", error: 404, text:"requested user doesn't exist"})
		}
	});	
}

// Internal function to add a new starred dare (tested)
exports.addStarred = function(username, dareid, callback) {

	exports.getInfo(username, function(data) {
		if (data) {
			var dares = db.child("users").child(username).child("starred");

			if (!data.starred) {
				dares.set([dareid]);
			}
			else {
				dares.set(_.union(data.starred,[dareid]));
			}

			callback({status: "success"});
		}
		else {
			callback({status: "error", error: 404, text:"requested user doesn't exist"})
		}
	});	
}

// Request to star a dare (tested)
exports.star = function(req, res, next) {

	var username = req.params.username;
	var dareid = req.params.dareid;

	exports.addStarred(username, dareid, function(data){
		res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    	res.end(JSON.stringify(data));
    	return next();
	});
}

// Internal function to remove a challenge from starred (tested)
exports.removeStarred = function(username, dareid,callback) {

	exports.getInfo(username, function(data) {
		if (data) {
			var dares = db.child("users").child(username).child("starred");

			if (data.starred) {
				dares.set(_.reject(data.starred,function(elem) { return elem == dareid}));
			}

			callback({status: "success"});
		}
		else {
			callback({status: "error", error: 404, text:"requested user doesn't exist"})
		}
	});	
}

// Request to unstar a dare (tested)
exports.unstar = function(req, res, next) {

	var username = req.params.username;
	var dareid = req.params.dareid;

	exports.removeStarred(username, dareid, function(data){
		res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    	res.end(JSON.stringify(data));
    	return next();
	});
}