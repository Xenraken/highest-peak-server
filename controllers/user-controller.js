const { getPostData } = require("../utils/general-utils");
const { dbInsertRecord, dbGetAllRecords } = require("../db/db-operations");


// signup new user add user data to db
async function userSignUp(req, res)
{
    try
    {
        const body = await getPostData(req);
        if (!body)
        {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Invalid post data" }));
        }
        await dbInsertRecord("users", body);
        res.writeHead(201, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "New user Created", user: JSON.parse(body) }));
    }
    catch (err)
    {
        console.log(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: err.message }));
    }
}

// get all users
async function userGetAll(req, res, tableName)
{
    try
    {
        const records = await dbGetAllRecords(tableName);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "All users listed:", users: records }));
    }
    catch (err)
    {
        if (err.code === "ER_NO_SUCH_TABLE")
        {
            res.writeHead(404, { "Content-Type": "application/json" });
        }
        else
        {
            res.writeHead(500, { "Content-Type": "application/json" });
        }
        console.log(err);
        res.end(JSON.stringify({ message: err.message }));
    }
}

module.exports =
{
    userSignUp,
    userGetAll
}
