
// echos
exports.accept = function (req, res, next) {
  res.send(req.params);
  return next();
}