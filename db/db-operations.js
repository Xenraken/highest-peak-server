const con = require("./db-connection");
const crypto = require("crypto");

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
        const queryTableCreation = `CREATE TABLE IF NOT EXISTS ${dbName}.${tableName} 
        (id INT AUTO_INCREMENT PRIMARY KEY, 
        role VARCHAR(255) NOT NULL, 
        name VARCHAR(255) NOT NULL, 
        email VARCHAR(255) NOT NULL, 
        password VARCHAR(255) NOT NULL, 
        salt VARCHAR(255) NOT NULL)`;
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

// create the videos table if not exists
function dbCreateTableVideos(dbName)
{
    return new Promise((resolve, reject) =>
    {
        const queryTableVideosCreation = `CREATE TABLE IF NOT EXISTS ${dbName}.videos 
        (id INT AUTO_INCREMENT PRIMARY KEY, 
        user_id INT NOT NULL, 
        title VARCHAR(255) NOT NULL, 
        description TEXT, 
        file_name VARCHAR(255) NOT NULL, 
        file_path VARCHAR(500) NOT NULL, 
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        views INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES ${dbName}.users(id) ON DELETE CASCADE)`;
        con.query(queryTableVideosCreation, (err, result) =>
        {
            if (err)
            {
                console.error("Error creating table: videos", err);
                return reject(err);
            }
            console.log("Table created: videos");
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
        await dbCreateTableVideos(dbName);
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
        const queryRecordInsertion = `INSERT INTO ${tableName} (role, name, email, password, salt) VALUES (?, ?, ?, ?, ?)`;
        con.query(queryRecordInsertion, [record.role, record.name, record.email, record.password, record.salt], (err, result) => 
        {
            if (err)
            {
                console.error("Error inserting data to users table:", err);
                return reject(err);
            }
            console.log(`1 record inserted to users table ${JSON.stringify(result)}`);
            resolve(result);
        });
    });
}

// insert the given video record to the given table
function dbInsertVideoRecord(tableName, record)
{
    return new Promise((resolve, reject) =>
    {
        const queryVideoRecordInsertion = `INSERT INTO ${tableName} (user_id, title, 
        description, 
        file_name, 
        file_path, 
        upload_date, 
        views) 
        VALUES (?, ?, ?, ?, ?, NOW(), 0)`;
        const values = [record.body.user_id, record.body.title, record.body.description, record.videoFile.filename, record.videoFile.path]

        con.query(queryVideoRecordInsertion, values, (err, result) => 
        {
            if (err)
            {
                console.error("Error inserting data to videos table:", err);
                return reject(err);
            }
            console.log(`1 record inserted to videos table ${JSON.stringify(result)}`);
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
            console.log(`Record has been deleted from ${tableName}`);
            console.log("Number of records deleted: " + result.affectedRows);
            resolve(result);
        });
    });
}

// delete the video record with the given table name and filename

function dbDeleteVideoRecord(tableName, filename) 
{
    return new Promise((resolve, reject) => 
    {
        const queryDeleteVideoQuery = `DELETE FROM ${tableName} WHERE file_name = ?`;
        con.query(queryDeleteVideoQuery, [filename], (err, result) => 
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
            console.log(`Record has been deleted from ${tableName}`);
            console.log("Number of records deleted: " + result.affectedRows);
            resolve(result);
        });
    });
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
        });
    });
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

// filter records with the given key-value pair from the given tablename
function dbGetRecordByFilterValue(tableName, key, value) 
{
    return new Promise((resolve, reject) => 
    {
        const queryGetRecordByFilter = `SELECT * FROM ${tableName} WHERE ${key} = ?`;
        con.query(queryGetRecordByFilter, [value], (err, result) => 
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

// verify password return true if hashes matches else return false
function dbVerifyPassword(password, savedHash, savedSalt)
{
    return new Promise((resolve, reject) => 
    {
        try
        {
            const hash = crypto.pbkdf2Sync(password, savedSalt, 100000, 64, "sha512").toString("hex");
            if (hash === savedHash)
            {
                return resolve(true);
            }
            else
            {
                return resolve(false);
            }
        }
        catch (err)
        {
            console.log(err);
            reject(new Error("Error verifying password."));
        }
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
    dbCreateTableVideos,
    dbSetup,
    dbInsertRecord,
    dbInsertVideoRecord,
    dbGetAllRecords,
    dbGetRecordByFilter,
    dbGetRecordByFilterValue,
    dbDropTable,
    dbGetAllRecordsSorted,
    dbDeleteRecord,
    dbDeleteVideoRecord,
    dbUpdateRecord,
    dbSelectRecord,
    dbVerifyPassword,
}
