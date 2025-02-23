const { getPostData, hashPassword } = require("../utils/general-utils");
const { dbInsertRecord, dbGetAllRecords, dbGetRecordByFilter, dbGetAllRecordsSorted, dbDeleteRecord, dbUpdateRecord, dbSelectRecord, dbVerifyPassword } = require("../db/db-operations");


// signup a new record save user data to db
async function userSignUp(req, res, tableName)
{
    try
    {
        const body = await getPostData(req);
        if (!body)
        {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Invalid post data" }));
        }

        const parsedBody = JSON.parse(body);
        const hashedPassword = await hashPassword(parsedBody.password);
        parsedBody.password = hashedPassword.hash;
        parsedBody.salt = hashedPassword.salt;

        await dbInsertRecord(tableName, parsedBody);

        res.writeHead(201, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "New user Created", user: parsedBody }));
    }
    catch (err)
    {
        console.log(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: err.message }));
    }
}

// log user in if requirements are met
async function userLogin(req, res, tableName)
{
    try
    {
        const body = await getPostData(req);
        if (!body)
        {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Invalid post data" }));
        }
        const parsedBody = JSON.parse(body);
        const userRecord = await dbSelectRecord(tableName, "email", parsedBody.email);

        if (userRecord.length === 0) 
        {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Email not found" }));
        }
        const user = userRecord[0];
        const isPasswordVerified = await dbVerifyPassword(parsedBody.password, user.password, user.salt);

        if (isPasswordVerified)
        {
            res.writeHead(302, { "location": "/" });
            return res.end(JSON.stringify({ message: "Login is successful" }));
        }
        else 
        {
            res.writeHead(401, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Invalid Password" }));
        }
    }
    catch (err) 
    {
        console.log(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "An error occurred during login", error: err.message }));
    }
}

// delete a record from the database with the given table name and query
async function userDelete(req, res, tableName, query) 
{
    try
    {
        const deletedRecords = await dbDeleteRecord(tableName, query);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: `Users deleted:`, users: deletedRecords }));
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

// update the given key value in the given table
async function userUpdate(req, res, tableName, query)
{
    try
    {
        const updatedRecord = await dbUpdateRecord(tableName, query);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Updated record:", users: updatedRecord }));
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

// get all records with the given tableName
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

// filter records by the given filter query and table name
async function userGetByFilter(req, res, tableName, query)
{
    try
    {
        const filteredRecords = await dbGetRecordByFilter(tableName, query);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Filtered users listed:", users: filteredRecords }));
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

// sort all records in the given table with the given query key
async function userGetAllSorted(req, res, tableName, query)
{
    try
    {
        const sortValue = Object.keys(query)[0];
        const sortedRecords = await dbGetAllRecordsSorted(tableName, sortValue);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: `All users sorted by ${sortValue}:`, users: sortedRecords }));
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
    userGetAll,
    userGetByFilter,
    userGetAllSorted,
    userDelete,
    userUpdate,
    userLogin,
}
