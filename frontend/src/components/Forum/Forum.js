import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";
import NavBar from "../NavBar/NavBar";
import { FaTrash } from 'react-icons/fa';
import CreatePostModal from '../Forum/CreatePostModal';
import "../Forum/forum.css"

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const { user, token } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios.get('/api/forum/posts')
      .then(response => {
        console.log("Posts retrieved from server:", response.data);
        setPosts(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the forum posts!', error);
      });
  }, []);

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/api/forum/posts/${postId}`, {
        headers: { Authorization: `${token}` }
      });
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('There was an error deleting the post!', error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNewPost = async (title, content, code) => {
    try {
      const response = await axios.post('/api/forum/posts', {
        title,
        content,
        code,
        authorId: user._id
      }, {
        headers: { Authorization: `${token}` }
      });
      setPosts([response.data, ...posts]);
      closeModal();
    } catch (error) {
      console.error('There was an error creating the post!', error);
    }
  };

  return (
    <div className="forumLayout">
      <NavBar />
      <div className="forumHeader">
        <h1>Forum</h1>
        <button onClick={openModal} className="newPostButton">Create New Post</button>
      </div>
      <CreatePostModal isOpen={isModalOpen} onRequestClose={closeModal} onSubmit={handleNewPost} />
      <div className="forumPosts">
        {posts.map(post => (
          <div key={post._id} className="forumPost">
            <div className="postContent">
              <Link to={`/forum/posts/${post._id}`}>
                <h2>{post.title}</h2>
              </Link>
              <p>{post.content}</p>
              <div className="author">
                {post.authorId ? `By ${post.authorId.name}` : 'Unknown Author'} on {new Date(post.timestamp).toLocaleString()}
              </div>
            </div>
            {(user && (user._id === post.authorId._id || user.role === 'admin')) && (
              <button onClick={() => handleDeletePost(post._id)} className="deleteButton">
                <FaTrash /> 
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
