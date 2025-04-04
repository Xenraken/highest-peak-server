const { error } = require("console");
const crypto = require("crypto");
const fs = require('fs').promises;
const path = require('path');

// get post data from client
function getPostData(req) 
{
    return new Promise((resolve, reject) => 
    {
        try
        {
            const handleData = (chunk) => 
            {
                body += chunk;
            };
            const handleEndData = () => 
            {
                req.removeAllListeners();
                resolve(body);
            }
            let body = "";
            req.on("data", handleData);
            req.on("end", handleEndData);
            req.on("error", (err) => 
            {
                reject(err);
            });
        }
        catch (err)
        {
            console.log(err);
        }
    })
}

// hash password with pbkdf25 method and return hash and salt
async function hashPassword(password)
{
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return { salt, hash };
}


// get all videos using the given path
async function getVideos(videoUploadPath) 
{
    try
    {
        if (!videoUploadPath)
        {
            throw new Error("Error getting videos: Invalid upload path");
        }

        const files = await fs.readdir(videoUploadPath);

        return files.map((video) =>
        ({
            name: video,
            url: `/videos/${video}`
        }));

    } catch (err) 
    {
        console.error("Error getting videos:", err);
        throw new Error(`Error getting videos: ${err.message}`);
    }
}

// get a single video using the given path and file name
async function getSingleVideo(videoUploadPath, fileName) 
{
    try 
    {
        if (!videoUploadPath)
        {
            throw new Error("Error getting video: Invalid upload path");
        }
        if (!fileName)
        {
            throw new Error("Error getting video: Invalid filename");
        }

        const filePath = path.join(videoUploadPath, fileName);
        const stats = await fs.stat(filePath);

        if (!stats.isFile())
        {
            throw new Error("Error getting video: Specified path is not a file.");
        }
        const file = await fs.readFile(filePath);
        return file;
    }
    catch (err) 
    {
        console.error("Error getting video:", err);
        throw new Error(`Error getting video: ${err.message}`);
    }
}


module.exports =
{
    getPostData,
    hashPassword,
    getVideos,
    getSingleVideo
}
