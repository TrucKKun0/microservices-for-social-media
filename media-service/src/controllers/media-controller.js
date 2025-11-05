const logger = require("../utils/logger");
const Media = require("../models/media");
const { validateCreateMedia } = require("../utils/validation");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");

const uploadMedia = async (req, res) => {
  logger.info("Upload Media Request");
  try {
    if (!req.file) {
      logger.error("No file found . Please upload a file and try again.");
      return res
        .status(400)
        .json({
          success: false,
          message: "No file found . Please upload a file and try again.",
        });
    }

    const {originalname, mimetype, buffer} = req.file;
    const userId = req.user.id;
    logger.info(`Uploading file: ${originalname}, MIME type: ${mimetype}`);
    logger.info("uploading to cloudinary starting...")
    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info("uploading to cloudinary successful.Public id", cloudinaryUploadResult.public_id);

    const newlyCreatedMedia = new Media({
        publicId: cloudinaryUploadResult.public_id,
        originalName: originalname,
        mimeType: mimetype,
        url: cloudinaryUploadResult.secure_url,
        userId: userId
    })
    await newlyCreatedMedia.save();
    res.status(201).json({ success: true, data: newlyCreatedMedia, message: "Media uploaded successfully"});
  } catch (error) {
    logger.error("Error uploading media:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error uploading media" });
  }
};
module.exports = { uploadMedia };