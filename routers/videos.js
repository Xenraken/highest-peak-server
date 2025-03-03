const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { videoUpload, } = require("../controllers/video-controller");


router.post("/upload", upload.single("video"), videoUpload);


module.exports = router;
