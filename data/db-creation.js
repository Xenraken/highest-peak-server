const mysql = require("mysql");

const con = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "password",
        database: "mydb"
    });

con.connect((err) => 
{
    if (err)
    {
        console.error("Can not connect: ", err);
        throw err;
    }
    console.log("Connected!");
});

con.query("CREATE DATABASE mydb", (err, result) => 
{
   if (err)
    {
        console.error("Error creating database: ", err);
        throw err;
    }
    console.log("Database Created");
});
