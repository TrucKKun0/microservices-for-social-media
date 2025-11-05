constlogger = require('../utils/logger');
const Post = require('../models/Post');
const logger = require('../utils/logger');
const {validateCreatePost} = require('../utils/validation');

async function invalidatePostCache(req,input){
    const cacheKey = `post:${input}`;
    await req.redisClient.del(cacheKey);
    const keys = await req.redisClient.keys('posts:*');
    if(keys.length > 0){
        await req.redisClient.del(keys);
    }
}


const createPost = async (req, res) => {
    logger.info('Creating a new post end point hit');
    try{
        const {error} = validateCreatePost(req.body);
        if(error){
            logger.warn(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        const {content,mediaIds} = req.body;
        const newlyCreatedPost = new Post({
            user : req.user.userId,
            content,
            media: mediaIds || []
        });
        await  newlyCreatedPost.save();
        await invalidatePostCache(req,newlyCreatedPost._id.toString());
        logger.info(`Post created successfully with id: ${newlyCreatedPost._id}`);
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: newlyCreatedPost

        });
    }catch(error){
        logger.error(`Error creating post: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error creating the post',
        });
    }

}
const getAllPosts = async (req, res) => {
    logger.info('Fetching all posts');
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cacheKey);
        if(cachedPosts){
            logger.info('Serving posts from cache');
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedPosts),
                message: 'Posts fetched successfully from cache',
            });
        }
        const posts = await Post.find().sort({createdAt:-1}).skip(startIndex).limit(limit);
        const totalPosts = await Post.countDocuments();
        const result = {
            posts,
            currentPage: page,
        totalPages : Math.ceil(totalPosts / limit),
        totalPosts: totalPosts
    };
    //save to redis cache
    await req.redisClient.setex(cacheKey,300,JSON.stringify(result)); //cache for 5 minutes
    logger.info('Posts fetched successfully');
    res.status(200).json({
        success: true,
        data: result,
        message: 'Posts fetched successfully',
    });


    }catch(error){
        logger.error(`Error fetching posts: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts',
        });
    }

}
const getPost = async (req, res) => {
    logger.info(`Fetching post with id: ${req.params.id}`);
    try{
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cacheKey);
        if(cachedPost){
            return res.status(200).json(JSON.parse(cachedPost));
        }
        const singlePost = await Post.findById(postId);
        if(!singlePost){
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }
        await req.redisClient.setex(cacheKey,300,JSON.stringify(singlePost));
        res.status(200).json({
            success: true,
            data: singlePost,
            message: 'Post fetched successfully',
        });
    }catch(error){
        logger.error(`Error fetching post: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching post',
        });
    }

}
const deletePost =async (req, res) => {
    logger.info(`Deleting post with id: ${req.params.id}`);
    try{
        const postId = req.params.id;
        const deletePost = await Post.findByIdAndDelete(postId);
        if(!deletePost){
            return res.json({
                success: false,
                message: 'Post not found',
            })
        }
        await invalidatePostCache(req,postId);
        res.json({
            success: true,
            message: 'Post deleted successfully',
        });

    }catch(error){
        logger.error(`Error deleting post: ${error.message}`);
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
