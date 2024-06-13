import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import NavBar from '../NavBar/NavBar';
import { FaTrash } from 'react-icons/fa';
import './helppost.css';

const HelpPost = () => {
  const { id: postId } = useParams();
  const { token, user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [problem, setProblem] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newCode, setNewCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/forum/posts/${postId}`, { headers: { Authorization: `${token}` } })
      .then(response => {
        setPost(response.data);
        setComments(response.data.comments);
        if (response.data.problemId) {
          return axios.get(`/api/getProblemByObjectId/${response.data.problemId}`, { headers: { Authorization: `${token}` } });
        }
      })
      .then(response => {
        if (response) setProblem(response.data);
      })
      .catch(error => {
        console.error('Error fetching post or problem details:', error.response ? error.response.data : error);
      });
  }, [postId, token]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !newCode.trim()) return;

    try {
      const response = await axios.post(`/api/forum/posts/${postId}/comments`, {
        content: newComment,
        code: newCode,
        authorId: user._id
      }, {
        headers: { Authorization: `${token}` }
      });
      setComments(response.data.comments);
      setNewComment('');
      setNewCode('');
    } catch (error) {
      console.error('There was an error submitting your comment!', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/forum/posts/${postId}/comments/${commentId}`, {
        headers: { Authorization: `${token}` }
      });
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('There was an error deleting the comment!', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(`/api/forum/posts/${postId}`, {
        headers: { Authorization: `${token}` }
      });
      navigate('/forum');
    } catch (error) {
      console.error('There was an error deleting the post!', error);
    }
  };

  if (!post) {
    return <div>Loading help post details...</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="help-post-container">
        <div className="section-wrapper">
          {problem && (
            <div className="problem-details">
              <Link to={`/problems/${problem._id}`}>{problem.title}</Link>
            </div>
          )}
          <div className="post-details">
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            {post.code && (
              <div className="code-snippet">
                <pre><code>{post.code}</code></pre>
              </div>
            )}
            <p><strong>By:</strong> {post.authorId.name} on {new Date(post.timestamp).toLocaleString()}</p>
            {(user && (user._id === post.authorId._id || user.role === 'admin')) && (
              <button onClick={handleDeletePost} className="deleteButton">
                <FaTrash /> Delete Post
              </button>
            )}
          </div>
        </div>
        <div className="comment-section section-wrapper">
          <h3>Comments</h3>
          {comments.map(comment => (
            <div key={comment._id} className="comment">
              <div className="commentContentWrapper">
                <div className="commentAuthor">{comment.authorId && (comment.authorId.username || comment.authorId.name) ? comment.authorId.username || comment.authorId.name : 'Unknown Author'}</div>
                <div className="commentContent">{comment.content}</div>
                {comment.code && (
                  <div className="codeBlock">
                    <pre><code>{comment.code}</code></pre>
                  </div>
                )}
                <div className="commentTimestamp">{new Date(comment.timestamp).toLocaleString()}</div>
              </div>
              {(user && (user._id === comment.authorId._id || user.role === 'admin')) && (
                <button onClick={() => handleDeleteComment(comment._id)} className="deleteButton">
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          <form onSubmit={handleCommentSubmit} className="commentForm">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
            ></textarea>
            <textarea
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Add code (optional)"
            ></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelpPost;
