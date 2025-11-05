const express = require('express');
const router = express.Router();
const {authenticatedRequest} = require('../middlewares/authMiddleware');
const {uploadMedia} = require('../controllers/media-controller');
const multer = require('multer');
const logger = require('../utils/logger');
const { error } = require('winston');

router.use(authenticatedRequest);

const upload = multer.memoryStorage({
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('file');


router.post('/upload',(req,res,next)=>{
    upload(req,res,(err)=>{
        if(err instanceof multer.MulterError){
            logger.error('Multer Upload Error:', err);
            return res.status(400).json({ success: false, message: "Error uploading file",error: err.message,stack: err.stack });
        }else if(err){
            logger.error('Unknown Upload Error:', err);
            return res.status(500).json({ success: false, message: "Unknown error uploading file",error: err.message,stack: err.stack });
        }
        if(!req.file){
            logger.error('No file provided in the request');
            return  res.status(400).json({ success: false, message: "No file provided in the request" });
        }
        next();
    })
}, uploadMedia);



module.exports = router;