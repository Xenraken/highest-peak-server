
// get post data from client
function getPostData(req) 
{
    return new Promise((resolve, reject) => 
    {
        try
        {
            let body = "";
            req.on("data", (chunk) => 
            {
                body += chunk;
            });
            req.on("end", async () => 
            {
                resolve(body);
            });
        }
        catch (err)
        {
            console.log(err);
        }
    })
}

module.exports =
{
    getPostData,
}
