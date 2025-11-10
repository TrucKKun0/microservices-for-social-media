const express = require('express');
const router = express.Router();
const { searchPostController } = require('../controllers/search-conteoller');
const {authenticatedRequest} = require('../middlewares/authMiddleware');
router.use(authenticatedRequest);
router.get('/posts', searchPostController);

module.exports = router;