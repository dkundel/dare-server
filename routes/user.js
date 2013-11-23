// Create a new user, based on Fb auth data
exports.create = function (req, res, next) {
  
  var new_user = db.child("users").child("test");

  new_user.set({
  	fb_id: "?", 
  	fname: "?",
  	lname: "?",
  	imageurl: "?",
  	email: "?",
  	username: "?",
  	score: 0,
  	dares: []
  });

  res.send(req.params);
  return next();
}

