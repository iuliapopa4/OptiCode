const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentsController');
const auth = require("../middlewares/auth");

router.post('/addComment/:problemId', auth, commentController.addComment);
router.get('/comments/:problemId', auth, commentController.getComments);

module.exports = router;
