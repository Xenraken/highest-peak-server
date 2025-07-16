const { userInfo } = require("os");
const { dbInsertVideoRecord, dbDeleteVideoRecord, dbGetAllRecords, dbGetRecordByFilterValue, dbGetVideoDataWithUserName } = require("../db/db-operations");
const { getVideos, getSingleVideo } = require("../utils/general-utils");
const fs = require("fs");
const path = require("path");

// upload the given video file to db
async function videoUpload(req, res) {
    try {
        const body = req.body;
        const videoFile = req.file;

        if (!body) {
            return res.status(400).json({ message: "Request body not found" });
        }
        if (!videoFile) {
            return res.status(400).json({ message: "File not found" });
        }
        const record =
        {
            body: body,
            videoFile: videoFile
        }
        await dbInsertVideoRecord("videos", record);
        return res.status(201).json({ message: "File upload is successful", record });
    }
    catch (err) {
        console.error("Video upload error:", err);
        return res.status(500).json({ message: "An error occurred during file upload", error: err.message });
    }
}

// delete the videofile and correresponding db record
async function videoDelete(req, res) {
    try {
        console.log("Current working directory:", process.cwd());
        const filename = req.params.filename;
        const filePath = path.join(__dirname, "../uploads", filename);
        if (!fs.existsSync(filePath)) {
            console.error("File not found")
            return res.status(404).json({ message: "File not found" });
        }

        fs.unlink(filePath, async (err) => {
            if (err) {
                console.error("Error deleting file:", err);
                return res.status(500).json({ message: "Error deleting file" });
            }
            await dbDeleteVideoRecord("videos", filename);
            res.status(200).json({ message: "File deleted successfully" });
        });

    }
    catch (err) {
        console.error("Video deleting error:", err);
        return res.status(500).json({ message: "An error occurred during video upload", error: err.message });
    }
}

async function videoGetAll(req, res, tableName) {
    try {
        const videoFiles = await getVideos(path.join(__dirname, '..', 'uploads'));
        const dbVideoRecords = await dbGetAllRecords(tableName);

        const videos = videoFiles.map((file) => {
            const record = dbVideoRecords.find((record) => {
                return file.name === record.file_name;

            });

            return record ? { ...file, ...record } : null;
        }).filter(Boolean);

        return res.status(200).json({ message: "All video records listed", videos });
    }
    catch (err) {
        console.error("Error getting all videos:", err);
        return res.status(500).json({ message: "Error getting all videos", error: err.message });
    }
}

// get the physical video with the given url param
async function videoGet(req, res) {
    try {
        const fileName = req.params.fileName;
        const dbVideoRecord = await dbGetRecordByFilterValue("videos", "file_name", fileName);
        const videoBuffer = await getSingleVideo(path.join(__dirname, '..', 'uploads'), fileName);

        res.setHeader("Content-type", "video/mp4");
        return res.send(videoBuffer);
    }
    catch (err) {
        console.error("Error getting video:", err);
        return res.status(500).json({ message: "Error getting video", error: err.message });
    }
}

// get a single video data with the given url param
async function videoGetData(req, res) {
    try {
        const fileName = req.params.fileName;
        const dbVideoRecord = await dbGetVideoDataWithUserName(fileName, "videos", "users");

        return res.status(200).json({ message: "Video data:", dbVideoRecord });
    }
    catch (err) {
        console.error("Error getting video data:", err);
        return res.status(500).json({ message: "Error getting video data", error: err.message });
    }
}

async function videoGetByUserID(req, res, query) {
    try {
        if (!query.id) {
            console.error("Error getting videos associated with this user ID");
            return res.status(400).json({ message: "User ID not found" });
        }
        const dbVideoRecords = await dbGetRecordByFilterValue("videos", "user_id", query.id);
        console.log(`All record listed by user ID: ${query.id}:`, dbVideoRecords);
        return res.status(200).json({ message: `All record listed by user ID: ${query.id}:`, dbVideoRecords });
    }
    catch (err) {
        console.error("Error getting video by ID:", err);
        return res.status(500).json({ message: "Error getting video", error: err.message });
    }
}

module.exports =
{
    videoUpload,
    videoDelete,
    videoGetAll,
    videoGet,
    videoGetByUserID,
    videoGetData
}
