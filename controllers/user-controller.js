const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/general-utils");
const { dbInsertRecord, dbGetAllRecords, dbGetRecordByFilter, dbGetAllRecordsSorted, dbDeleteRecord, dbUpdateRecord, dbSelectRecord, dbVerifyPassword } = require("../db/db-operations");
const { parse } = require("dotenv");

// signup a new record save user data to db
async function userSignup(req, res, tableName)
{
    try
    {
        const parsedBody = await req.body;
        if (!parsedBody || !parsedBody.name || !parsedBody.email || !parsedBody.password)
        {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "All fields must be filled" }));
        }

        const hashedPassword = await hashPassword(parsedBody.password);
        parsedBody.password = hashedPassword.hash;
        parsedBody.salt = hashedPassword.salt;

        parsedBody.role = "user";

        await dbInsertRecord(tableName, parsedBody);

        res.writeHead(201, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
            message: "New user Created", user: {
                id: parsedBody.id,
                role: parsedBody.role,
                name: parsedBody.name,
                email: parsedBody.email
            }
        }));
    }
    catch (err)
    {
        console.log(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: err.message }));
    }
}

// log user in if requirements are met and return a jwt-token to client
async function userLogin(req, res, tableName)
{
    try
    {
        const parsedBody = await req.body;
        if (!parsedBody || !parsedBody.email || !parsedBody.password)
        {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Email and password fields must be filled" }));
        }

        const userRecord = await dbSelectRecord(tableName, "email", parsedBody.email);

        if (userRecord.length === 0) 
        {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "No account has been found with this email" }));
        }
        const user = userRecord[0];
        const isPasswordVerified = await dbVerifyPassword(parsedBody.password, user.password, user.salt);

        if (!isPasswordVerified)
        {
            res.writeHead(401, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Incorrect password" }));
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )
        return res.status(200).json(
            {
                message: "Login successful",
                name: user.name,
                id: user.id,
                role: user.role,
                token: token
            });
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
        const user = req.user;
        if (!user || !user.id || !user.role)
        {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        if (query.role) 
        {
            return res.status(403).json({ message: "Unauthorize: Roles can not be updated" });
        }

        if (req.user.role === "admin" || req.user.id === parseInt(query.id))
        {
            const updatedRecord = await dbUpdateRecord(tableName, query);
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({
                message: "Updated record:", users: {
                    id: updatedRecord.id,
                    name: updatedRecord.name,
                    email: updatedRecord.email
                }
            }));
        }
        return res.status(403).json({ message: "Unauthorized: Can not update other users" });
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
        const mappedRecords = records.map(({ password, salt, ...user }) => user);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "All users listed:", users: mappedRecords }));
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
        const mappedRecords = filteredRecords.map(({ password, salt, ...user }) => user);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Filtered users listed:", users: mappedRecords }));
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
        const mappedRecords = sortedRecords.map(({ password, salt, ...user }) => user);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: `All users sorted by ${sortValue}:`, users: mappedRecords }));
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
    userSignup,
    userGetAll,
    userGetByFilter,
    userGetAllSorted,
    userDelete,
    userUpdate,
    userLogin,
}
