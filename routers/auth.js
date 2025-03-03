const express = require("express");
const router = express.Router();
const { userSignup, userLogin } = require("../controllers/user-controller");
const { authenticateToken } = require("../middlewares/authentication");

router.post("/signup", (req, res) =>
{
    userSignup(req, res, "users");
});

router.post("/login", (req, res) =>
{
    userLogin(req, res, "users");
});

module.exports = router;