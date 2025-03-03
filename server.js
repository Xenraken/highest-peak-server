const { write, rmSync } = require("fs");
const express = require("express");
const app = express();
app.use(express.json());
const { url } = require("inspector");
const { parse } = require("path");
require("dotenv").config();
// db
const con = require("./db/db-connection");
const { dbSetup, dbDropTable } = require("./db/db-operations");
// routers
const users = require("./routers/users");
const auth = require("./routers/auth");
const videos = require("./routers/videos");


dbSetup("mydb", "users");

app.get("/", (req, res) => 
{
    res.status(200).send("Hello, I am the home page.");
});

app.use("/auth", auth);
app.use("/users", users);
app.use("/videos", videos);

app.use((req, res) =>
{
    res.status(404).send("404 not found: I am not exist.");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server is running on port: ${PORT}`) });
