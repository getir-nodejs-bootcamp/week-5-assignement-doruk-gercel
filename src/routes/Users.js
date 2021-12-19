const express = require("express");
const { index, create, login, resetPassword} = require("../controllers/Users");
const { createUser, createAdminUser, userLogin, userResetPassword} = require("../validations/Users");
const validate = require("../middlewares/validate");
const authenticateAdmin = require("../middlewares/authenticateAdmin");

const router = express.Router();

// Normal routes
router.route("/create-admin-user").post(validate(createAdminUser, "body"), create);
router.route("/login").post(validate(userLogin, "body"), login);
router.route("/reset-password").post(validate(userResetPassword, "body"), resetPassword);

// Admin user routes
router.route("/").get(authenticateAdmin, index);
router.route("/").post(authenticateAdmin, validate(createUser, "body"), create);

module.exports = router;
