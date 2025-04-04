const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/upload");
const { videoUpload, videoDelete, videoGetAll, videoGet } = require("../controllers/video-controller");
const { verifyToken } = require("../middlewares/authentication");
const path = require("path");
const { allowAdmin } = require("../middlewares/allow-admin");


router.get("/", videoGetAll);

router.get("/:fileName", (req, res) => 
{
    videoGet(req, res);
});

router.post("/upload", verifyToken, allowAdmin, upload, videoUpload);

router.delete("/:filename", videoDelete);


module.exports = router;
