const { write, rmSync } = require("fs");
const express = require("express");
const { userSignUp, userGetAll, userGetByFilter, userGetAllSorted, userDelete, userUpdate, userLogin } = require("./controllers/user-controller");
const { dbSetup, dbUse, dbDropTable, dbCreate, dbCreateTable } = require("./db/db-operations");
const con = require("./db/db-connection");
const { url } = require("inspector");
const { parse } = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
dbSetup("mydb", "users");

app.get("/", (req, res) => 
{
    res.status(200).send("Hello, I am the home page.");
});

app.post("/signup", (req, res) =>
{
    userSignUp(req, res, "users");
});

app.post("/login", (req, res) =>
{
    userLogin(req, res, "users");
});

app.get("/users", (req, res) =>
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

app.delete("/users", (req, res) =>
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

app.patch("/users", (req, res) =>
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

app.use((req, res) =>
{
    res.status(404).send("404 not found: I am not exist.");
});

// dbDropTable("users");

app.listen(PORT, () => { console.log(`Server is running on port: ${PORT}`) });
