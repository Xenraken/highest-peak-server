const crypto = require("crypto");
const jwt = require("jsonwebtoken");


function verifyToken(req, res, next)
{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token)
    {
        console.log("Access denied: No token privided");
        return res.status(401).json({ message: "Access denied: No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) =>
    {
        if (err)
        {
            console.log(`Error verifying token: ${err}`);
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
}


module.exports =
{
    verifyToken,
}