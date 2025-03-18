const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/upload");
const { videoUpload, videoDelete } = require("../controllers/video-controller");
const { verifyToken } = require("../middlewares/authentication");


router.post("/upload", verifyToken, upload, videoUpload);

router.delete("/:filename", videoDelete);


module.exports = router;
