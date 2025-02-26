const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

router.post("/signup", (req, res) =>
{
    userController.userSignUp(req, res, "users");
});

router.post("/login", (req, res) =>
{
    userController.userLogin(req, res, "users");
});

module.exports = router;