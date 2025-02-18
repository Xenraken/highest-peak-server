const con = require("./db-connection");

// create a database with the given name
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

// create a table with the given name in the given database
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

// select the record and return it
function dbSelectRecord(tableName, key, value)
{
    return new Promise((resolve, reject) => 
    {
        const querySelect = `SELECT * FROM ${tableName} WHERE ${key} = ?`;
        con.query(querySelect, [value], (err, result) => 
        {
            if (err)
            {
                console.error("Error selecting data:", err);
                return reject(err);
            }
            resolve(result);
        })
    })
}

// insert the given record to the given table
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


// delete the record from the given table
function dbDeleteRecord(tableName, record) 
{
    return new Promise((resolve, reject) =>
    {
        const key = Object.keys(record)[0];
        const value = Object.values(record)[0];
        const queryDeleteRecord = `DELETE FROM ${tableName} WHERE ${key} = ?`;
        con.query(queryDeleteRecord, [value], (err, result) => 
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
            console.log("Number of records deleted: " + result.affectedRows);
            resolve(result);
        })
    })
}

// update the first given record value to the second value
function dbUpdateRecord(tableName, records)
{
    return new Promise((resolve, reject) =>
    {
        const keys = Object.keys(records);
        const values = Object.values(records);
        const givenKey = keys[0];
        const givenValue = values[0];
        const keyToUpdate = keys[1];
        const newValue = values[1];
        if (keys.length < 2)
        {
            return reject(new error("At least 2 keys required for an update."));
        }

        const queryUpdate = `UPDATE ${tableName} SET ${keyToUpdate} = ? WHERE ${givenKey} = ?`;
        con.query(queryUpdate, [newValue, givenValue], (err, result) => 
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
            dbSelectRecord(tableName, givenKey, givenValue).then((updatedRecord) => 
            {
                console.log("Number of records updated: " + result.affectedRows);
                console.log(result);
                console.log(`Updated record: ${JSON.stringify(updatedRecord[0])}`);
                resolve(updatedRecord[0]);
            }).catch(reject);
        })
    })
}

// get all the records from the given table
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
            console.log("All records listed: ");
            console.log(result);
            resolve(result);
        });
    });
}

// filter records with the given query from the given table
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

// sort the given table with the given query and return it
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

// delete the given table as a whole
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
    dbDeleteRecord,
    dbUpdateRecord,
    dbSelectRecord,
}
