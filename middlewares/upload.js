const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage(
    {
        destination: function (req, file, cb)
        {
            cb(null, "uploads/");
        },
        filename: function (req, file, cb)
        {
            const ext = path.extname(file.originalname);
            cb(null, Date.now() + ext);
        }
    });
const fileFilter = (req, file, cb) =>
{
    if (file.mimetype.startsWith("video/"))
    {
        cb(null, true);
    } else
    {
        cb(new Error("Only video files are allowed"), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fieldSize: Infinity } });


module.exports = { upload: upload.single("video") }