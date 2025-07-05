const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/upload");
const { videoUpload, videoDelete, videoGetAll, videoGet, videoGetByUserID, videoGetData } = require("../controllers/video-controller");
const { verifyToken } = require("../middlewares/authentication");
const path = require("path");
const { allowAdmin } = require("../middlewares/allow-admin");


router.get("/", (req, res) => 
{
    query = req.query;
    if (query.id)
    {
        videoGetByUserID(req, res, query);
    }
    else
    {
        videoGetAll(req, res, "videos");
    }
});

router.get("/:fileName", (req, res) => 
{
    videoGet(req, res);
});

router.get("/data/:fileName", (req, res) => 
{
    videoGetData(req, res);
});

router.post("/upload", verifyToken, upload, videoUpload);

router.delete("/:filename", verifyToken, videoDelete);


module.exports = router;
