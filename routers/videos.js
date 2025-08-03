const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/upload");
const { generateThumbnail } = require("../middlewares/thumbnail-generator");
const { videoUpload, videoDelete, videoGetAll, videoGet, videoGetByUserID, videoGetData, viewCountUpdate } = require("../controllers/video-controller");
const { verifyToken } = require("../middlewares/authentication");
const path = require("path");
const { allowAdmin } = require("../middlewares/allow-admin");


router.get("/", (req, res) => {
    query = req.query;
    if (query.id) {
        videoGetByUserID(req, res, query);
    }
    else {
        videoGetAll(req, res, "videos");
    }
});

router.get("/:fileName", (req, res) => {
    videoGet(req, res);
});

router.get("/data/:fileName", (req, res) => {
    videoGetData(req, res);
});

router.post("/upload", verifyToken, upload, generateThumbnail, videoUpload);

router.patch("/viewupdate/:videoId", viewCountUpdate);

router.delete("/:filename", verifyToken, videoDelete);

module.exports = router;
