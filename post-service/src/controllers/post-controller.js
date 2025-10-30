constlogger = require('../utils/logger');
const Post = require('../models/Post');
const logger = require('../utils/logger');

const createPost = async (req, res) => {
    logger.info('Creating a new post');
    try{
        const {content,mediaIds} = req.body;
        const newlyCreatedPost = new Post({
            user : req.user.userId,
            content,
            media: mediaIds || []
        });
        await  newlyCreatedPost.save();
        logger.info('Post created successfully with id:', newlyCreatedPost._id);
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: newlyCreatedPost
            
        });
    }catch(error){
        logger.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating the post',
        });
    }

}
const getAllPosts = (req, res) => {
    logger.info('Fetching all posts');
    try{

    }catch(error){
        logger.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts',
        });
    }

}
const getPost = (req, res) => {
    logger.info(`Fetching post with id: ${req.params.id}`);
    try{

    }catch(error){
        logger.error('Error fetching post:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching post',
        });
    }

}
const deletePost = (req, res) => {
    logger.info(`Deleting post with id: ${req.params.id}`);
    try{

    }catch(error){
        logger.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting post',
        });
    }

}

module.exports = {
    createPost,
    getAllPosts,
    getPost,
    deletePost
}
