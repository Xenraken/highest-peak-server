const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

function generateThumbnail(req, res, next) {
    if (!req.file) {
        return res.status(400).json({ error: "No video file provided." });
    }

    const videoPath = req.file.path;
    const thumbnailFileName = `${Date.now()}_thumbnail.jpg`;
    const thumbnailDir = "uploads/thumbnails";

    if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
    }

    const thumbnailPath = path.join(thumbnailDir, thumbnailFileName);

    ffmpeg(videoPath)
        .screenshots({
            count: 1,
            timestamps: ['2'],
            filename: thumbnailFileName,
            folder: thumbnailDir,
            size: "320x240"
        })
        .on("end", () => {
            req.thumbnailPath = thumbnailPath;
            next();
        })
        .on("error", (err) => {
            console.error("Thumbnail generation error:", err);
            return res.status(500).json({ error: "Failed to generate thumbnail." });
        });
}

module.exports = { generateThumbnail };