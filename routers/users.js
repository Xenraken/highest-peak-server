const express = require("express");
const router = express.Router();
const { userGetAllSorted, userGetByFilter, userGetAll, userDelete, userUpdate } = require("../controllers/user-controller");
const { authenticateToken } = require("../middlewares/authentication");

router.get("/", (req, res) =>
{
    const query = req.query;

    if (Object.keys(query).length > 0)
    {
        if (query.id || query.name || query.email || query.password)
        {
            userGetByFilter(req, res, "users", query);
        } else
        {
            userGetAllSorted(req, res, "users", query);
        }
    } else
    {
        userGetAll(req, res, "users");
    }
});

router.delete("/", (req, res) => 
{
    const query = req.query;

    if (Object.keys(query).length === 0)
    {
        return res.status(400).send("400 Bad Request: Invalid query parameters provided.");
    }

    if (query.id || query.name || query.email || query.password)
    {
        userDelete(req, res, "users", query);
    }
});

router.patch("/users", (req, res) =>
{
    const query = req.query;

    if (!query || Object.keys(query).length < 1)
    {
        return res.status(400).send("400 Bad Request: Invalid query parameters provided.");
    }

    if (Object.keys(query).length < 3)
    {
        userUpdate(req, res, "users", query);
    }
});


module.exports = router;
