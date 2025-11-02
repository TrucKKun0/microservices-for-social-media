const joi = require('joi');

const validateCreatePost = (data)=>{
    const schema = joi.object({
        title: joi.string().min(3).max(100).required(),
        content: joi.string().min(1000).required(),
        author: joi.string().required()
    })
    return schema.validate(data);
}


module.exports = {validateCreatePost};