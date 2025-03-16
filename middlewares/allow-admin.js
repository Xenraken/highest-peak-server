

// make res admin only
function allowAdmin(req, res, next)
{
    if (req.user.role === "admin")
    {
        return next();
    }

    return res.status(403).json({ message: "Admin only action" });

}


module.exports =
{
    allowAdmin,
}