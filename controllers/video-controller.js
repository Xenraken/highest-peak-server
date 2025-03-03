const { dbInsertVideoRecord } = require("../db/db-operations");

// upload the given video file to db
async function videoUpload(req, res)
{
    try
    {
        const body = req.body;
        const videoFile = req.file;

        if (!body)
        {
            return res.status(400).json({ message: "Request body not found" });
        }
        if (!videoFile)
        {
            return res.status(400).json({ message: "Video file not found" });
        }
        const record =
        {
            body: body,
            videoFile: videoFile
        }

        await dbInsertVideoRecord("videos", record);
        return res.status(201).json({ message: "Video upload is successful", record });
    }
    catch (err) 
    {
        console.error("Video upload error:", err);
        return res.status(500).json({ message: "An error occurred during video upload", error: err.message });
    }
}





module.exports =
{
    videoUpload,
}