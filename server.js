const { write, rmSync } = require("fs");
const http = require("http");
const { userSignUp, userGetAll, userGetByFilter, userGetAllSorted } = require("./controllers/user-controller");
const { dbSetup, dbUse, dbDropTable, dbCreate, dbCreateTable } = require("./db/db-operations");
const con = require("./db/db-connection");
const { url } = require("inspector");
const { parse } = require("path");

dbSetup("mydb", "users");

const server = http.createServer((req, res) => 
{
    const parsedUrl = new URL(req.url, `http://localhost:4000`);
    const path = parsedUrl.pathname;
    const query = Object.fromEntries(parsedUrl.searchParams);
    const method = req.method;
    if (path === "/" && method === "GET")
    {
        res.writeHead(200);
        res.end("Hello, I am the home page.");
    }
    else if (path === "/signup" && method === "POST")
    {
        userSignUp(req, res, "users");
    }
    else if (path === "/users" && req.method === "GET")
    {
        if (query && Object.keys(query).length > 0 && (query.id || query.name || query.email || query.password))
        {
            userGetByFilter(req, res, "users", query);
        }
        else if(query && Object.keys(query).length > 0 && (!query.id || !query.name || !query.email || !query.password))
        {
            userGetAllSorted(req, res, "users", query);
        }
        else
        {
            userGetAll(req, res, "users");
        }
    }
    else 
    {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 not found: I am not exist.");
    }
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => { console.log(`Server is running on port: ${PORT}`) });
