const logger = require("../utils/logger")
const Search = require("../models/Search")

const searchPostController  = async(req,res)=>{
    logger.info("Search Post endpoint hit")
    try{
        const {query} = req.query;
        const cacheKey = `search:${query}`;

        // Check cache first
        const cachedResults = await req.redisClient.get(cacheKey);
        if(cachedResults){
            logger.info("Returning cached search results");
            return res.status(200).json({results: JSON.parse(cachedResults)});
        }

        const results = await Search.find({
            $text: {$search:query}
        },
    {
        score: {$meta:"textScore"}
    }).sort({score:{$meta:"textScore"}}).limit(10);
    await req.redisClient.setex(cacheKey,300,JSON.stringify(results));
    res.status(200).json({results:results})
    }catch(error){
        logger.error("Error in Search Post endpoint", {error})
        res.status(500).json({message:"Internal Server Error"})
    }
}

module.exports = { searchPostController };