const express = require("express");
const { verifyToken } = require("../middlewares/authentication");
const router = express.Router();
const { commentUpload, commentGetById } = require("../controllers/comment-controller");



router.post("/upload", verifyToken, commentUpload);

router.get("/", commentGetById);


module.exports = router;