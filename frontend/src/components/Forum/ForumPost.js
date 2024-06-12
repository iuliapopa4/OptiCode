import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import NavBar from "../NavBar/NavBar";
import { FaTrash } from 'react-icons/fa';
import "../Forum/forum.css";

const ForumPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [code, setCode] = useState('');
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !token) return;

    axios.get(`/api/forum/posts/${id}`, {
      headers: { Authorization: `${token}` }
    })
    .then(response => {
      console.log("Post retrieved from server:", response.data);
      setPost(response.data);
    })
    .catch(error => {
      console.error('There was an error fetching the forum post!', error);
    });
  }, [id, token]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() && !code.trim()) return; // Check if both comment and code are empty

    try {
      const response = await axios.post(`/api/forum/posts/${id}/comments`, {
        content: comment,
        code: code,
        authorId: user._id
      }, {
        headers: { Authorization: `${token}` }
      });
      console.log("Comment submitted, updated post:", response.data);
      setPost(response.data);
      setComment('');
      setCode('');
    } catch (error) {
      console.error('There was an error submitting your comment!', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/forum/posts/${id}/comments/${commentId}`, {
        headers: { Authorization: `${token}` }
      });
      setPost({
        ...post,
        comments: post.comments.filter(comment => comment._id !== commentId)
      });
    } catch (error) {
      console.error('There was an error deleting the comment!', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(`/api/forum/posts/${id}`, {
        headers: { Authorization: `${token}` }
      });
      navigate('/forum');
    } catch (error) {
      console.error('There was an error deleting the post!', error);
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="forumLayout">
      <NavBar />
      <div className="forumHeader">
        <h1>{post.title}</h1>
        <p>By {post.authorId && (post.authorId.username || post.authorId.name) ? post.authorId.username || post.authorId.name : 'Unknown Author'} on {new Date(post.timestamp).toLocaleString()}</p>
        {(user && (user._id === post.authorId._id || user.role === 'admin')) && (
          <button onClick={handleDeletePost} className="deleteButton">
            <FaTrash />
          </button>
        )}
      </div>
      <div className="forumPost">
        <p>{post.content}</p>
        {post.code && (
          <div className="codeBlock">
            <pre><code>{post.code}</code></pre>
          </div>
        )}
      </div>
      <div className="commentSection">
        <h3>Comments:</h3>
        {post.comments.map(comment => (
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
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment"></textarea>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Add code"></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ForumPost;
