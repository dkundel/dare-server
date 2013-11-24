var user = require('./user');

// Create a new dare (tested)
exports.create = function (req, res, next) {

  var dare = req.params;

  if (!dare.target) {
    dare.target = "";
  }
  if (!dare.promoted) {
    dare.promoted = false;
  }
  if (!dare.base64img) {
    dare.image = "/images/default.png";
  }
  else {
    var data = dare.base64img.replace(/^data:image\/png;base64,/,"");
    var timestamp = (new Date()).getTime().toString();

    require('fs').writeFileSync(__dirname+'/../public/images/'+timestamp+'.png', data, 'base64');

    dare.image = '/images/'+timestamp+'.png';
    delete dare.base64img;
  }

  var timestamp = new Date();
  var newdare = db.child("dares").push({
    creator: dare.creator,
    name: dare.name,
    description: dare.description,
    target: dare.target,
    image: dare.image,
    status: "pending",
    promoted: dare.promoted,
    timestamp: timestamp.getTime().toString()
  });

  var dare_id = newdare.path.m[1];
  user.addDare(dare.creator, dare_id, function(){});

  if (dare.target && dare.target !== "") {
    
    user.gotDared(dare.target, dare_id, function(){});

    var creator_name = db.child("users").child(dare.creator).child("name");
    creator_name.once('value', function(data) {
       user.sendNotification(dare.target,"Whooooooa!","Seems like " + data.val() + " dared you to do something. I'd defend my honor if I were you...","com.code4fun.dare.GET_DARE");
    });
  }

  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify({status: "success"}));
  return next();
}

// Internal get information (tested)
exports.getInfo = function(dare_id, callback) {
  var dareRef = db.child("dares").child(dare_id);
  dareRef.once('value', function(data) {
    callback(data.val());
  });
}

// Request to get information (tested)
exports.get = function(req, res, next) {
  exports.getInfo(req.params.id, function(data) {
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(data));
    return next();
  });
}

// Set status of the dare (tested)
exports.setStatus = function(dare_id, status) {
  var dareRef = db.child("dares").child(dare_id);
  dareRef.once('value', function(data) {
    var val = data.val();
    val.status = status;
    dareRef.set(val);
  });
}

// Accept a dare (tested)
exports.accept = function (req, res, next) {

  var dare_id = req.params.dareid;
  var username = req.params.username;

  exports.setStatus(dare_id, "accepted");
  user.acceptDare(username, dare_id, function(data) {
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(data));
    return next();
  });
}

// Reject a dare (tested)
exports.reject = function (req, res, next) {

  var dare_id = req.params.dareid;
  var username = req.params.username;

  exports.setStatus(dare_id, "rejected");
  user.deleteDare(username, dare_id, function(data) {
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(data));
    return next();
  });
}