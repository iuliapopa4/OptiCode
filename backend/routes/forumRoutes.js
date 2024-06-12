const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPostModel');
const authMiddleware = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// Create a new forum post
router.post('/posts', authMiddleware, async (req, res) => {
  const { title, content, code } = req.body;
  const { user } = req;

  try {
    const newPost = new ForumPost({ title, content, code, authorId: user._id, timestamp: new Date() });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all forum posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await ForumPost.find().populate('authorId', 'name');
    console.log('Posts retrieved:', posts);
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific forum post by ID
router.get('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await ForumPost.findById(id).populate('authorId', 'name').populate('comments.authorId', 'name');
    console.log('Post retrieved:', post);
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

  try {
    const post = await ForumPost.findById(id);
    post.comments.push({ content, code, authorId: user._id, timestamp: new Date() });
    await post.save();
    const populatedPost = await ForumPost.findById(id).populate('authorId', 'name').populate('comments.authorId', 'name');
    console.log('Updated post with new comment:', populatedPost);
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a forum post
router.delete('/posts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  try {
    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== user._id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await post.remove();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a comment from a forum post
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params;
  const { user } = req;

  try {
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.authorId.toString() !== user._id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    comment.remove();
    await post.save();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
