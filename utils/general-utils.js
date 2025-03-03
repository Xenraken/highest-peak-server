const crypto = require("crypto");

// get post data from client
function getPostData(req) 
{
    return new Promise((resolve, reject) => 
    {
        try
        {
            const handleData = (chunk) => 
            {
                body += chunk;
            };
            const handleEndData = () => 
            {
                req.removeAllListeners();
                resolve(body);
            }
            let body = "";
            req.on("data", handleData);
            req.on("end", handleEndData);
            req.on("error", (err) => 
            {
                reject(err);
            });
        }
        catch (err)
        {
            console.log(err);
        }
    })
}

// hash password with pbkdf25 method and return hash and salt
async function hashPassword(password)
{
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return { salt, hash };
}



module.exports =
{
    getPostData,
    hashPassword,
}
