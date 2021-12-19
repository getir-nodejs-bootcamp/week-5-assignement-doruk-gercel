const hs = require("http-status");
const { list, insert, findOne } = require("../services/Users");
const { passwordToHash, generateJWTAccessToken, generateJWTRefreshToken } = require("../scripts/utils/helper");
const eventEmitter = require("../scripts/utils/events/EventEmitter");
const error = require("../definitions/Error")

const index = (req, res) => {
  list()
    .then((userList) => {
      if (!userList) res.status(hs.INTERNAL_SERVER_ERROR).send({ error: error.INTERNAL_ERROR});
      res.status(hs.OK).send(userList);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const create = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  insert(req.body)
    .then((createdUser) => {
      if (!createdUser) res.status(hs.INTERNAL_SERVER_ERROR).send({ error: error.INTERNAL_ERROR});
      res.status(hs.OK).send(createdUser);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const login = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  findOne(req.body)
    .then((user) => {
      if (!user) return res.status(hs.NOT_FOUND).send({ message: error.USER_NOT_EXIST});
      user = {
        ...user.toObject(),
        tokens: {
          access_token: generateJWTAccessToken(user),
          refresh_token: generateJWTRefreshToken(user),
        },
      };
      delete user.password;
      res.status(hs.OK).send(user);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

// HOMEWORK!!!
const resetPassword = (req, res) => {
  // Generate password
  const newPassword = uuid.v4()?.split("-")[0] || `usr-${new Date().getTime()}`;
  modify({ email: req.body.email }, { password: passwordToHash(newPassword) })
    .then((updatedUser) => {
      if (!updatedUser)
        return res.status(hs.NOT_FOUND).send({
          error: error.USER_NOT_EXIST
        });
      // Send mail
      eventEmitter.emit("send_email", {
        to: updatedUser.email,
        subject: "Password Reset Request",
        html: `Your one time password is ${newPassword}<br/> Please change this password after login.`
      });
      res.status(hs.OK).send({ message: "Generated password sent to email." });
    })
    .catch(() => {
      res.status(hs.INTERNAL_SERVER_ERROR).send({ error: error.INTERNAL_ERROR });
    });
};

module.exports = {
  index,
  create,
  login,
  resetPassword
};
