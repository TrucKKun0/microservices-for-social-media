const cloudinary = require('cloudinary').v2;
const logger = require('./logger');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
})

const uploadMediaToCloudinary = async (file)=>{
 return new Promise((resolve,reject)=>{
    const uploadStream = cloudinary.uploader.upload_stream(
        {
            resource_type: 'auto'
        },
        (error,result)=>{
            if(error){
                logger.error('Cloudinary Upload Error:', error);
                return reject(error);
            }
            resolve(result);
        }
    )
    uploadStream.end(file.buffer);
 })

}

const deleteMediafromCloudinary = async(publicId)=>{
    try{
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info('Cloudinary Deletion Successful:', publicId);
        return result;

    }catch(error){
        logger.error('Cloudinary Deletion Error:', error);
        throw error;
    }
}

module.exports = {uploadMediaToCloudinary, deleteMediafromCloudinary};