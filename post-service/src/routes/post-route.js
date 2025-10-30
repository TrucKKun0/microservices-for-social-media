const express = require('express');
const router = express.Router();
const{createPost,getAllPosts,getPost,deletePost} = require('../controllers/post-controller');
const {authenticatedRequest} = require('../middlewares/authMiddleware');
//middleware to parse JSON bodies -> this will tell if the user is an authenticated user or not


router.use(authenticatedRequest);

router.post('/create-post', createPost);

module.exports = router;