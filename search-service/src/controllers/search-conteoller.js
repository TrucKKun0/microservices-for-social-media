const logger = require("../utils/logger")
const Search = require("../models/Search")

const searchPostController  = async(req,res)=>{
    logger.info("Search Post endpoint hit")
    try{
        const {query} = req.body;
        const reqsults = await Search.find({
            $text: {$search:query}
        },
    {
        score: {$meta:"textScore"}
    }).sort({score:{$meta:"textScore"}}).limit(10);

    res.status(200).json({results:reqsults})
    }catch(error){
        logger.error("Error in Search Post endpoint", {error})
        res.status(500).json({message:"Internal Server Error"})
    }
}

module.exports = { searchPostController };