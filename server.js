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
const home = require("./routers/home");
const users = require("./routers/users");
const auth = require("./routers/auth");
const videos = require("./routers/videos");
const cors = require("cors");


dbSetup("mydb", "users");

app.use(cors());
app.use("/videos", videos);
app.use("/users", users);
app.use("/auth", auth);
app.use("/", home);
app.use((req, res) =>
{
    res.status(404).send("404 not found: I am not exist.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server is running on port: ${PORT}`) });
