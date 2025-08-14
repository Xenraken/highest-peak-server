const { dbInsertCommentRecord, dbGetRecordByFilterValue } = require("../db/db-operations");


// upload the given comment data to db
async function commentUpload(req, res) {
    try {
        const commentData = req.body;
        if (!commentData) {
            return res.status(400).json({ message: "Request body not found" });
        }
        await dbInsertCommentRecord(commentData);
        console.log("1 record inserted to comments table", commentData);
        return res.status(201).json({ message: "Comment upload is successful", commentData });
    }
    catch (err) {
        console.error("Comment upload error:", err)
        return res.status(500).json({ message: "An error occurred during comment upload", error: err.message });
    }
}

// get comments by video or user id depending on the request
async function commentGetById(req, res) {
    try {
        const { videoId, userId } = req.query;
        let commentData;
        let whichId;
        if (videoId) {
            commentData = await dbGetRecordByFilterValue("comments", "video_id", videoId);
            whichId = "video ID";
        }
        else if (userId) {
            commentData = await dbGetRecordByFilterValue("comments", "user_id", userId);
            whichId = "user ID";
        }
        else {
            return res.status(400).json({ message: "Missing videoId or userId" });
        }

        if (!commentData || commentData.length === 0) {
            return res.status(200).json({
                comments: [],
                message: "No comments yet"
            });
        }
        console.log(`Comments filtered and listed by ${whichId}:`, commentData);
        return res.status(200).json({
            comments: commentData,
            message: `Comments filtered and listed by ${whichId}`
        });
    }
    catch (err) {
        console.error(`Error during getting comments by ID`, err);
        return res.status(500).json({ message: `Error during getting comments by ID` })
    }
}


module.exports =
{
    commentUpload,
    commentGetById
}
