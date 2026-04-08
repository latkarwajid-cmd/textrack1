const config = require("./Config");
const jwt = require("jsonwebtoken");
const result = require("./Result");

/*
JWT Authentication Middleware
*/
function authUser(req, res, next) {

  const path = req.url;

  // Allow public auth endpoints without token
  if (path.includes("/user/login") || path.includes("/user/register")) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json(result.createResult("Token missing"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json(result.createResult("Unauthorized Access"));
  }

  try {

    const payload = jwt.verify(token, config.SECRET);

    req.user = payload; // attach decoded user

    next();

  } catch (err) {

    return res
      .status(401)
      .json(result.createResult("Invalid Token"));

  }
}


/*
Role Authorization Middleware
*/
function roleAuthorization(allowedRoles = []) {

  return (req, res, next) => {

    // Check if authUser ran first
    if (!req.user) {
      return res
        .status(401)
        .json(result.createResult("Unauthorized: No user info"));
    }

    // If admin-only route
    if (allowedRoles.length === 0) {
      if (req.user.role === "admin") {
        return next();
      }

      return res
        .status(403)
        .json(result.createResult("Admin access required"));
    }

    // Check allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json(result.createResult("Access denied"));
    }

    next();
  };
}

module.exports = { authUser, roleAuthorization };