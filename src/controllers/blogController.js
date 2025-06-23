const BlogPost = require('../models/blogPost');

// Get all blog posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ date: -1 });
    res.render('blog/index', { posts });
  } catch (err) {
    res.status(500).send('Error fetching posts');
  }
};

// Show form to create a new post
exports.getCreatePost = (req, res) => {
  res.render('blog/create');
};

// Create a new blog post
exports.createPost = async (req, res) => {
  const { title, content, author } = req.body;
  const newPost = new BlogPost({ title, content, author });

  try {
    await newPost.save();
    res.redirect('/blog');
  } catch (err) {
    res.status(500).send('Error saving the post');
  }
};
