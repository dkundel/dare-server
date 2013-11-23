
// echos
exports.accept = function (req, res, next) {
  console.log(req);
  return next();
}