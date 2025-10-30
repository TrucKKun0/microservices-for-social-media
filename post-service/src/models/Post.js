const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content:{
        type:String,
        required:true
    },
    mediaUrls:[{
        type:String
    }],
    createdAt:{
        type:Date,
        default:Date.now
    }

},{timestamps:true});

//because we will be having different service for searching posts
PostSchema.index({ createdAt: 'text' });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;