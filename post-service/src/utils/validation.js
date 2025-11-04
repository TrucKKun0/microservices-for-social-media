const joi = require('joi');

const validateCreatePost = (data)=>{
    const schema = joi.object({
        content: joi.string().max(1000).required()
    })
    return schema.validate(data);
}


module.exports = {validateCreatePost};