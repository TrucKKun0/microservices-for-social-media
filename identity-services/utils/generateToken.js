const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/refreshToken');

const generateToken = async ( user)=>{
 const accessToken = jwt.sign({
    userId : user._id,
    username : user.username,
 },process.env.JWT_SECRET,{expiresIn:'15m'});


 //generate refresh token
 const refreshToken = crypto.randomBytes(40).toString('hex');
 const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); //refresh token expires at  7 days validity

    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt
    })
    return {accessToken,refreshToken};
}

module.exports = {generateToken};