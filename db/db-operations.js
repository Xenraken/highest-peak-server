const con = require("./db-connection");
const crypto = require("crypto");

// create a database with the given name
function dbCreate(dbName) {
  return new Promise((resolve, reject) => {
    const queryCreation = `CREATE DATABASE IF NOT EXISTS ${dbName}`;
    con.query(queryCreation, (err, result) => {
      if (err) {
        console.error(`Error creating database: ${dbName}`, err);
        return reject(err);
      }
      console.log(`Database created: ${dbName}`);
      resolve(result);
    });
  });
}

// select given db to use
function dbUse(dbName) {
  return new Promise((resolve, reject) => {
    const queryUse = `USE ${dbName}`;
    con.query(queryUse, (err, result) => {
      if (err) {
        console.error(`Error using database: ${dbName}`, err);
        return reject(err);
      }
      console.log(`Using database: ${dbName}`);
      resolve(result);
    });
  });
}

// create a table with the given name in the given database
function dbCreateTable(dbName, tableName) {
  return new Promise((resolve, reject) => {
    const queryTableCreation = `CREATE TABLE IF NOT EXISTS ${dbName}.${tableName} 
        (id INT AUTO_INCREMENT PRIMARY KEY, 
        role VARCHAR(255) NOT NULL, 
        name VARCHAR(255) NOT NULL, 
        email VARCHAR(255) NOT NULL UNIQUE, 
        password VARCHAR(255) NOT NULL, 
        salt VARCHAR(255) NOT NULL,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    con.query(queryTableCreation, (err, result) => {
      if (err) {
        console.error(`Error creating table: ${tableName}`, err);
        return reject(err);
      }
      console.log(`Table created: ${tableName}`);
      resolve(result);
    });
  });
}

// create the videos table if not exists
function dbCreateTableVideos(dbName) {
  return new Promise((resolve, reject) => {
    const queryTableVideosCreation = `CREATE TABLE IF NOT EXISTS ${dbName}.videos 
        (id INT AUTO_INCREMENT PRIMARY KEY, 
        user_id INT NOT NULL,
        user_name VARCHAR(255) NOT NULL, 
        title VARCHAR(255) NOT NULL, 
        description TEXT, 
        file_name VARCHAR(255) NOT NULL, 
        file_path VARCHAR(500) NOT NULL,
        thumbnail_path VARCHAR(255), 
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        views INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES ${dbName}.users(id) ON DELETE CASCADE
        )`;
    con.query(queryTableVideosCreation, (err, result) => {
      if (err) {
        console.error("Error creating table: videos", err);
        return reject(err);
      }
      console.log("Table created: videos");
      resolve(result);
    });
  });
}

// create the comments table if not exists
function dbCreateTableComments(dbName) {
  return new Promise((resolve, reject) => {
    const queryTableCommentsCreation = `
    CREATE TABLE IF NOT EXISTS ${dbName}.comments 
    (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    video_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    comment VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES ${dbName}.users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES ${dbName}.videos(id) ON DELETE CASCADE
    )`;
    con.query(queryTableCommentsCreation, (err, result) => {
      if (err) {
        console.error("Error creating table: comments", err);
        return reject(err);
      }
      console.log("Table created: comments");
      resolve(result);
    })
  })
}

// call dbCreate and dbCreateTable (needed for global asyncing)
async function dbSetup(dbName, tableName) {
  try {
    await dbCreate(dbName);
    await dbUse(dbName);
    await dbCreateTable(dbName, tableName);
    await dbCreateTableVideos(dbName);
    await dbCreateTableComments(dbName)
    console.log("Database and table setup is successful");
  }
  catch (err) {
    console.error("Error during database setup: ", err);
  }
}

// select the record and return it
function dbSelectRecord(tableName, key, value) {
  return new Promise((resolve, reject) => {
    const querySelect = `SELECT * FROM ${tableName} WHERE ${key} = ?`;
    con.query(querySelect, [value], (err, result) => {
      if (err) {
        console.error("Error selecting data:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
}

// insert the given record to the given table
function dbInsertRecord(tableName, record) {
  return new Promise((resolve, reject) => {
    const queryRecordInsertion = `INSERT INTO ${tableName} (
      role,
      name,
      email,
      password,
      salt,
      creation_date)
      VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
      record.role,
      record.name,
      record.email,
      record.password,
      record.salt,
      new Date()
    ]
    con.query(
      queryRecordInsertion,
      values,
      (err, result) => {
        if (err) {
          console.error("Error inserting data to users table:", err);
          return reject(err);
        }
        console.log(
          `1 record inserted to users table ${JSON.stringify(result)}`
        );
        resolve(result);
      }
    );
  });
}

// insert the given video record to the given table
function dbInsertVideoRecord(tableName, record) {
  return new Promise((resolve, reject) => {
    const queryVideoRecordInsertion = `INSERT INTO ${tableName} (
      user_id,
      user_name,
      title,
      description,
      file_name,
      file_path,
      thumbnail_path,
      upload_date,
      views)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      record.body.user_id,
      record.body.user_name,
      record.body.title,
      record.body.description,
      record.videoFile.filename,
      record.videoFile.path,
      record.thumbnailPath,
      new Date(),
      0
    ];

    con.query(queryVideoRecordInsertion, values, (err, result) => {
      if (err) {
        console.error("Error inserting data to videos table:", err);
        return reject(err);
      }
      console.log(`1 record inserted to videos table ${JSON.stringify(result)}`);
      resolve(result);
    });
  });
}


// update wiev count
function dbViewCountUpdate(videoId) {
  return new Promise((resolve, reject) => {
    const queryViewUpdate = "UPDATE videos SET views = views + 1 WHERE id = ?"
    con.query(queryViewUpdate, [videoId], (err, result) => {
      if (err) {
        console.error("Error updating view count:", err);
        return reject(err);
      }
      console.log("View count updated");
      resolve(result);
    })
  })
}



// insert the given comment record to comment table
function dbInsertCommentRecord(record) {
  return new Promise((resolve, reject) => {
    const queryCommentRecordInsertion = `INSERT INTO comments (
      user_id,
      video_id,
      user_name,
      comment,
      upload_date) 
      VALUES(?, ?, ?, ?, ?)`;
    const values = [
      record.userId,
      record.videoId,
      record.userName,
      record.comment,
      new Date()
    ];
    con.query(queryCommentRecordInsertion, values, (err, result) => {
      if (err) {
        console.error("Error inserting data to comments table:", err)
        return reject(err);
      }
      console.log(`1 record inserted to comments table ${JSON.stringify(result)}`)
      resolve(result);
    });
  });
}

// delete the record from the given table
function dbDeleteRecord(tableName, record) {
  return new Promise((resolve, reject) => {
    const key = Object.keys(record)[0];
    const value = Object.values(record)[0];
    const queryDeleteRecord = `DELETE FROM ${tableName} WHERE ${key} = ?`;
    con.query(queryDeleteRecord, [value], (err, result) => {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE") {
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
function dbDeleteVideoRecord(tableName, filename) {
  return new Promise((resolve, reject) => {
    const queryDeleteVideoQuery = `DELETE FROM ${tableName} WHERE file_name = ?`;
    con.query(queryDeleteVideoQuery, [filename], (err, result) => {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE") {
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
function dbUpdateRecord(tableName, records) {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(records);
    const values = Object.values(records);
    const givenKey = keys[0];
    const givenValue = values[0];
    const keyToUpdate = keys[1];
    const newValue = values[1];
    if (keys.length < 2) {
      return reject(new error("At least 2 keys required for an update."));
    }

    const queryUpdate = `UPDATE ${tableName} SET ${keyToUpdate} = ? WHERE ${givenKey} = ?`;
    con.query(queryUpdate, [newValue, givenValue], (err, result) => {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE") {
          return reject(new Error(`There is no such table: ${tableName}`));
        }
        console.error("Error getting table:", err);
        return reject(err);
      }
      dbSelectRecord(tableName, givenKey, givenValue)
        .then((updatedRecord) => {
          console.log("Number of records updated: " + result.affectedRows);
          console.log(result);
          console.log(`Updated record: ${JSON.stringify(updatedRecord[0])}`);
          resolve(updatedRecord[0]);
        })
        .catch(reject);
    });
  });
}

// get all the records from the given table
function dbGetAllRecords(tableName) {
  return new Promise((resolve, reject) => {
    const queryGettingAllRecords = `SELECT * FROM ${tableName}`;
    con.query(queryGettingAllRecords, (err, result, field) => {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE") {
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
function dbGetRecordByFilter(tableName, query) {
  return new Promise((resolve, reject) => {
    const filterColumn = Object.keys(query)[0];
    const filterValue = Object.values(query)[0];
    const queryGetRecordByFilter = `SELECT * FROM ${tableName} WHERE ${filterColumn} = ?`;
    con.query(queryGetRecordByFilter, [filterValue], (err, result) => {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE") {
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
function dbGetRecordByFilterValue(tableName, key, value) {
  return new Promise((resolve, reject) => {
    const queryGetRecordByFilter = `SELECT * FROM ${tableName} WHERE ${key} = ?`;
    con.query(queryGetRecordByFilter, [value], (err, result) => {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE") {
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
function dbGetAllRecordsSorted(tableName, query) {
  return new Promise((resolve, reject) => {
    const queryGettingAllRecordsSorted = `SELECT * FROM ${tableName} ORDER BY ${query}`;
    con.query(queryGettingAllRecordsSorted, (err, result) => {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE") {
          return reject(new Error(`There is no such table: ${tableName}`));
        }
        console.error("Error getting sorted records", err);
        return reject(err);
      }
      console.log(result);
      resolve(result);
    });
  });
}

// verify password return true if hashes matches else return false
function dbVerifyPassword(password, savedHash, savedSalt) {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto
        .pbkdf2Sync(password, savedSalt, 100000, 64, "sha512")
        .toString("hex");
      if (hash === savedHash) {
        return resolve(true);
      } else {
        return resolve(false);
      }
    }
    catch (err) {
      console.log(err);
      reject(new Error("Error verifying password."));
    }
  });
}

// merge the videos and users tables add "user_name" record to videos table
function dbGetVideoDataWithUserName(fileName, videos, users) {
  return new Promise((resolve, reject) => {
    try {
      const queryMergeTables = `
      SELECT 
        ${videos}.*, 
        ${users}.name AS user_name 
      FROM ${videos}
      JOIN ${users} ON ${videos}.user_id = ${users}.id
      WHERE ${videos}.file_name = ?
    `;

      con.query(queryMergeTables, [fileName], (err, results) => {
        if (err) {
          console.error("Error during merging tables", err);
          return reject(err);
        }
        resolve(results || null);
      });
    }
    catch (err) {
      console.error("Error during merging tables:", err);
      reject(new Error("Error during merging tables:"));
    }
  });
}

// delete the given table as a whole
function dbDropTable(tableName) {
  return new Promise((resolve, reject) => {
    const queryDropTable = `DROP TABLE ${tableName}`;
    con.query(queryDropTable, (err, result) => {
      if (err) {
        console.error("Error dropping table", err);
        return reject(err);
      }
      console.log(result);
      resolve(result);
    });
  });
}

module.exports = {
  dbCreate,
  dbUse,
  dbCreateTable,
  dbCreateTableVideos,
  dbCreateTableComments,
  dbSetup,
  dbInsertRecord,
  dbInsertVideoRecord,
  dbViewCountUpdate,
  dbInsertCommentRecord,
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
  dbGetVideoDataWithUserName
};
