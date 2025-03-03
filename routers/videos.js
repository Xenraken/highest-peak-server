const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { videoUpload, } = require("../controllers/video-controller");
const { verifyToken } = require("../middlewares/authentication");


router.post("/upload", verifyToken, upload.single("video"), videoUpload);


module.exports = router;
