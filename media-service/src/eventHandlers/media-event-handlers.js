const Media = require("../models/media");
const { deleteMediafromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handlePostDeleted =  async (event)=>{
    console.log(event,"Event ");
    const { mediaIds } = event;
    // Here you can add logic to handle the mediaIds, e.g., delete media from database or cloud storage
    try{
       logger.info(`Handling post.deleted event for mediaIds: ${mediaIds}`);
        const mediaToDelete = await Media.find({_id: {$in:mediaIds}});
        for (const media of mediaToDelete){
            logger.info(`Deleting media with id: ${media._id} and publicId: ${media.publicId}`);
            await deleteMediafromCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);
            logger.info(`Successfully deleted media with id: ${media._id}`);
        }
        logger.info(`Completed handling post.deleted event for mediaIds: ${mediaIds}`);
    }catch(error){
        console.error("Error handling post.deleted event:", error);
    }
    
}
module.exports = { handlePostDeleted };