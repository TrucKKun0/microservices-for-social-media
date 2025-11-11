const Search = require("../models/Search");
const logger = require("../utils/logger");




async function handlePostCreated(event){
    logger.info("Handling post.created event", {event});
    try{
        const { postId, userId, content, createdAt } = event;
        const newSearchPost = new Search({
            postId,
            userId,
            content,
        })
await newSearchPost.save();
logger.info("Search post created successfully", {postId});

    }catch(error){
        logger.error("Error handling post.created event", {error});
    }

}

module.exports = {
    handlePostCreated,
};