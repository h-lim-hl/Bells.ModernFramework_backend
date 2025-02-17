function authenticateStaff(req, res, next) {
  if (req.user == null) return res.sendStatus(401);
  if (!req.user.role) return res.sendStatus(403);
  
  next();
}

module.exports = authenticateStaff;