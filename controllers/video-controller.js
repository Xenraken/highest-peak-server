const { dbInsertVideoRecord } = require("../db/db-operations");
const fs = require("fs");
const path = require("path");

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
    catch (err) 
    {
        console.error("Video upload error:", err);
        return res.status(500).json({ message: "An error occurred during file upload", error: err.message });
    }
}

// delete the videofile and correresponding db record
async function videoDelete(req, res) 
{
    try 
    {
        console.log("Current working directory:", process.cwd());
        const filename = req.params.filename;
        const filePath = path.join(__dirname, "../uploads", filename);
        if (!fs.existsSync(filePath)) 
        {
            console.error("File not found")
            return res.status(404).json({ message: "File not found" });
        }

        fs.unlink(filePath, (err) =>
        {
            if (err)
            {
                console.error("Error deleting file:", err);
                return res.status(500).json({ message: "Error deleting file" });
            }

            res.status(200).json({ message: "File deleted successfully" });
        });

    } catch (err) 
    {
        console.error("Video deleting error:", err);
        return res.status(500).json({ message: "An error occurred during video upload", error: err.message });
    }

}


module.exports =
{
    videoUpload,
    videoDelete,
}