const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ForumPost = require('../models/ForumPostModel');
const authMiddleware = require('../middlewares/auth');

// Middleware to log incoming requests
router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Create a new help request for a specific problem
router.post('/posts/help', authMiddleware, async (req, res) => {
  const { title, content, code, problemId } = req.body;
  const { user } = req;

  console.log('Help post creation endpoint hit');
  console.log('Request body:', req.body);
  console.log('Authenticated user:', user);

  try {
    const newPost = new ForumPost({
      title,
      content,
      code,
      problemId,
      type: 'help',
      authorId: user._id,
      timestamp: new Date()
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new general forum post
router.post('/posts', authMiddleware, async (req, res) => {
  const { title, content, code } = req.body;
  const { user } = req;

  console.log('General post creation endpoint hit');
  console.log('Request body:', req.body);
  console.log('Authenticated user:', user);

  try {
    const newPost = new ForumPost({
      title,
      content,
      code,
      type: 'general',
      authorId: user._id,
      timestamp: new Date()
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all posts by the logged-in user
router.get('/posts/user', authMiddleware, async (req, res) => {
  console.log('Get user posts endpoint hit');
  try {
    const userId = req.user._id; // Ensure to use req.user._id which is an ObjectId
    console.log('Authenticated user ID:', userId); // Log the user ID
    console.log('Type of user ID:', typeof userId); // Log the type of user ID
    const userPosts = await ForumPost.find({ authorId: userId }).populate('authorId', 'name');
    console.log('User posts retrieved:', userPosts); // Log the retrieved posts
    res.status(200).json(userPosts);
  } catch (error) {
    console.error('Error retrieving user posts:', error); // Log the error
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Get all general posts
router.get('/posts/general', async (req, res) => {
  console.log('Get all general posts endpoint hit');
  try {
    const posts = await ForumPost.find({ type: 'general' }).populate('authorId', 'name');
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get the count of general posts
router.get('/posts/count/general', async (req, res) => {
  console.log('Get general posts count endpoint hit');
  try {
    const count = await ForumPost.countDocuments({ type: 'general' });
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all help requests
router.get('/posts/help', async (req, res) => {
  console.log('Get all help posts endpoint hit');
  try {
    const posts = await ForumPost.find({ type: 'help' }).populate('authorId', 'name');
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get the count of help posts
router.get('/posts/count/help', async (req, res) => {
  console.log('Get help posts count endpoint hit');
  try {
    const count = await ForumPost.countDocuments({ type: 'help' });
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific forum post by ID
router.get('/posts/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Get post by ID endpoint hit');
  try {
    const post = await ForumPost.findById(id).populate('authorId', 'name').populate('comments.authorId', 'name');
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a comment to a forum post
router.post('/posts/:id/comments', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content, code } = req.body;
  const { user } = req;

  console.log('Add comment to post endpoint hit');
  console.log('Request body:', req.body);
  console.log('Authenticated user:', user);

  try {
    const post = await ForumPost.findById(id);
    post.comments.push({
      content: content || '',
      code: code || '',
      authorId: user._id,
      timestamp: new Date()
    });
    await post.save();
    const populatedPost = await ForumPost.findById(id).populate('authorId', 'name').populate('comments.authorId', 'name');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a forum post
router.delete('/posts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  console.log('Delete post endpoint hit');
  console.log('Request params:', req.params);
  console.log('Authenticated user:', user);

  try {
    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the author of the post or an admin
    if (post.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await ForumPost.findByIdAndDelete(id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a comment from a forum post
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params;
  const { user } = req;

  console.log('Delete comment from post endpoint hit');
  console.log('Request params:', req.params);
  console.log('Authenticated user:', user);

  try {
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the index of the comment to be deleted
    const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = post.comments[commentIndex];
    // Check if the user is the author of the comment or an admin
    if (comment.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Use splice to remove the comment from the array
    post.comments.splice(commentIndex, 1);
    await post.save();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
