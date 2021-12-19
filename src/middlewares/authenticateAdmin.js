const JWT = require("jsonwebtoken");
const httpStatus = require("http-status");
const error = require("../definitions/Error")

const authenticateToken = (req, res, next) => {
  const token = req.headers?.token;
  if (!token) return res.status(httpStatus.UNAUTHORIZED).send({ message: error.LOGIN_REQUIRED });
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
    if (err) return res.status(httpStatus.FORBIDDEN).send(err);
    if (!user?._doc?.isAdmin) return res.status(httpStatus.UNAUTHORIZED).send({ message: error.ADMIN_REQUIRED });
    req.user = user?._doc;
    next();
  });
};

module.exports = authenticateToken;
