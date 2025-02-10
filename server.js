const { write } = require("fs");
const http = require("http");
const { userSignUp, userGetAll } = require("./controllers/user-controller");
const { dbSetup, dbUse, dbDropTable, dbCreate, dbCreateTable } = require("./db/db-operations");
const con = require("./db/db-connection");

dbSetup("mydb", "users");

const server = http.createServer((req, res) => 
{
    if (req.url === "/" && req.method === "GET")
    {
        res.writeHead(200);
        res.end("Hello, I am the home page.");
    }
    if (req.url === "/signup" && req.method === "POST")
    {
        userSignUp(req, res);
    }
    if (req.url === "/users" && req.method === "GET")
    {
        userGetAll(req, res);
    }
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => { console.log(`Server is running on port: ${PORT}`) });
