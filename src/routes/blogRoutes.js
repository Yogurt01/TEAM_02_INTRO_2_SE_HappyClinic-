const express = require('express');
const blogController = require('../controllers/blogController');
const router = express.Router();

// Display all blog posts
router.get('/', blogController.getAllPosts);

// Show create post form
router.get('/create', blogController.getCreatePost);

// Handle create post
router.post('/create', blogController.createPost);

module.exports = router;
