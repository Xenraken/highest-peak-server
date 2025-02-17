
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
