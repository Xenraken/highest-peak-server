const express = require("express");
const router = express.Router();
const path = require("path");


router.get("/", (req, res) => 
    {
        return res.status(200).send("Hello, I am the homepage.");
    });
    

module.exports = router;
