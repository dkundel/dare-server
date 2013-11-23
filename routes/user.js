// (to enable union() function)
var _ = require('underscore');

// Tester function extravaganza
exports.test = function (req, res, next) {
	var param = req.params;
	exports.addDare(param.username, 2);
}

// Create a new user, based on Fb auth data (tested)
exports.create = function (req, res, next) {
  
  var data = req.params;
  var new_user = db.child("users").child(data.username);

  new_user.set({
  	fb_id: data.fb_id, 
  	fname: data.fname,
  	lname: data.lname,
  	imageurl: data.imageurl,
  	email: data.email,
  	username: data.username,
  	score: 0
  	//dares: [] -> empty arrays won't get written to Firebase
  });

  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(data));
  return next();
}

// Request a data about user (tested)
exports.get = function(req, res, next) {

	var param = req.params;

	exports.getInfo(param.username, function(data) { 
		res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});

		console.log(data);
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

// Internal function to alter score of the user (by adding score value) (tested)
exports.addScore = function(username, score) {

	var userscore = db.child("users").child(username).child("score");

	userscore.once('value',function(data) {
		userscore.set(data.val() + score);
	});
}

// Internal function to add a new dare to users' array of dares (tested)
exports.addDare = function(username, dareid) {

	var dares = db.child("users").child(username).child("dares");
	
	dares.once('value', function(data) {
		if (!data.val()) {
			dares.set([dareid]);
		}
		else {
			dares.set(_.union(data.val(),[dareid]));
		}
	});
}