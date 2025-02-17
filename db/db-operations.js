const con = require("./db-connection");

// create database and create a table if not exists
function dbCreate(dbName)
{
    return new Promise((resolve, reject) =>
    {
        const queryCreation = `CREATE DATABASE IF NOT EXISTS ${dbName}`
        con.query(queryCreation, (err, result) => 
        {
            if (err)
            {
                console.error(`Error creating database: ${dbName}`, err);
                return reject(err);
            }
            console.log(`Database created: ${dbName}`);
            resolve(result);
        });
    });
}

// select given db to use
function dbUse(dbName)
{
    return new Promise((resolve, reject) =>
    {
        const queryUse = `USE ${dbName}`;
        con.query(queryUse, (err, result) => 
        {
            if (err)
            {
                console.error(`Error using database: ${dbName}`, err);
                return reject(err);
            }
            console.log(`Using database: ${dbName}`);
            resolve(result);
        });
    });
}

// Create a table with the given name
function dbCreateTable(dbName, tableName) 
{
    return new Promise((resolve, reject) =>
    {
        const queryTableCreation = `CREATE TABLE IF NOT EXISTS ${dbName}.${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)`;
        con.query(queryTableCreation, (err, result) =>
        {
            if (err)
            {
                console.error(`Error creating table: ${tableName}`, err);
                return reject(err);
            }
            console.log(`Table created: ${tableName}`);
            resolve(result);
        });
    });
}

// call dbCreate and dbCreateTable (needed for global asyncing)
async function dbSetup(dbName, tableName)
{
    try
    {
        await dbCreate(dbName);
        await dbUse(dbName);
        await dbCreateTable(dbName, tableName);
        console.log("Database and table setup is successful");

    } catch (err)
    {
        console.error("Error during database setup: ", err);
    }
}

// insert a given data to db
function dbInsertRecord(tableName, record) 
{
    return new Promise((resolve, reject) => 
    {
        const parsedRecord = JSON.parse(record);
        const queryRecordInsertion = `INSERT INTO ${tableName} (name, email, password) VALUES (?, ?, ?)`;

        con.query(queryRecordInsertion, [parsedRecord.name, parsedRecord.email, parsedRecord.password], (err, result) => 
        {
            if (err)
            {
                console.error("Error inserting data:", err);
                return reject(err);
            }
            console.log(`1 record inserted ${JSON.stringify(result)}`);
            resolve(result);
        });
    });
}

// get all records from a table
function dbGetAllRecords(tableName)
{
    return new Promise((resolve, reject) =>
    {
        const queryGettingAllRecords = `SELECT * FROM ${tableName}`;
        con.query(queryGettingAllRecords, (err, result, field) => 
        {
            if (err)
            {
                if (err.code === "ER_NO_SUCH_TABLE")
                {
                    return reject(new Error(`There is no such table: ${tableName}`));
                }
                console.error("Error getting table:", err);
                return reject(err);
            }
            console.log(result);
            resolve(result);
        });
    });
}

// filter data from a table
function dbGetRecordByFilter(tableName, query) 
{
    return new Promise((resolve, reject) => 
    {
        const filterColumn = Object.keys(query)[0];
        const filterValue = Object.values(query)[0];
        const queryGetRecordByFilter = `SELECT * FROM ${tableName} WHERE ${filterColumn} = ?`;
        con.query(queryGetRecordByFilter, [filterValue], (err, result) => 
        {
            if (err) 
            {
                if (err.code === "ER_NO_SUCH_TABLE")
                {
                    return reject(new Error(`There is no such table: ${tableName}`));
                }
                console.error("Error getting record by filter", err);
                return reject(err);
            }
            console.log(result);
            resolve(result);
        });
    });
}

function dbGetAllRecordsSorted(tableName, query) 
{
    return new Promise((resolve, reject) => 
    {
        const queryGettingAllRecordsSorted = `SELECT * FROM ${tableName} ORDER BY ${query}`;
        con.query(queryGettingAllRecordsSorted, (err, result) => 
        {
            if (err) 
            {
                if (err.code === "ER_NO_SUCH_TABLE")
                {
                    return reject(new Error(`There is no such table: ${tableName}`));
                }
                console.error("Error getting sorted records", err);
                return reject(err);
            }
            console.log(result);
            resolve(result);
        })
    })
}

// delete a table as a whole
function dbDropTable(tableName) 
{
    return new Promise((resolve, reject) =>
    {
        const queryDropTable = `DROP TABLE ${tableName}`;
        con.query(queryDropTable, (err, result) =>
        {
            if (err)
            {
                console.error("Error dropping table", err);
                return reject(err);
            }
            console.log(result);
            resolve(result);
        });
    });
}

module.exports =
{
    dbCreate,
    dbUse,
    dbCreateTable,
    dbSetup,
    dbInsertRecord,
    dbGetAllRecords,
    dbGetRecordByFilter,
    dbDropTable,
    dbGetAllRecordsSorted,
}
