const logger = require('../../../post-service/src/utils/logger');

const authenticatedRequest = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if(!userId){
        logger.warn('Access denied. No user ID provided in headers.');
        return res.status(401).json({
            success: false,
            message: 'Access denied. No user ID provided in headers.'
        });
    }
    req.user = {userId};
    next();

}
module.exports = {authenticatedRequest};