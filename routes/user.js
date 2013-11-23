// Create a new user, based on Fb auth data
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

