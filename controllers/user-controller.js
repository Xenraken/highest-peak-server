const { getPostData } = require("../utils/general-utils");
const { dbInsertRecord, dbGetAllRecords } = require("../db/db-operations");


// signup new user add user data to db
async function userSignUp(req, res)
{
    try
    {
        const body = await getPostData(req);
        await dbInsertRecord("users", body);
        res.writeHead(201, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "New user Created", user: JSON.parse(body) }));
    }
    catch (err)
    {
        console.log(err);
    }
}

// get all users
async function userGetAll(req, res)
{
    try
    {
        const records = await dbGetAllRecords("users");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "All users listed:", users: records }));
    }
    catch (err) 
    {
        console.log(err);
    }
}

module.exports =
{
    userSignUp,
    userGetAll
}
