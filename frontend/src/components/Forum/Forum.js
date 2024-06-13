import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";
import NavBar from "../NavBar/NavBar";
import { FaTrash } from 'react-icons/fa';
import CreatePostModal from '../Forum/CreatePostModal';
import "../Forum/forum.css"

const Forum = () => {
  const [generalPosts, setGeneralPosts] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const { user, token } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGeneralPosts, setShowGeneralPosts] = useState(true);

  useEffect(() => {
    axios.get('/api/forum/posts/general')
      .then(response => {
        console.log("General posts retrieved from server:", response.data);
        setGeneralPosts(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the general posts!', error);
      });

    axios.get('/api/forum/posts/help')
      .then(response => {
        console.log("Help requests retrieved from server:", response.data);
        setHelpRequests(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the help requests!', error);
      });
  }, []);

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/api/forum/posts/${postId}`, {
        headers: { Authorization: `${token}` }
      });
      setGeneralPosts(generalPosts.filter(post => post._id !== postId));
      setHelpRequests(helpRequests.filter(post => post._id !== postId));
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
      setGeneralPosts([response.data, ...generalPosts]);
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
        <div className="button-group">
          <button onClick={openModal} className="newPostButton">Create New Post</button>
          <button 
            onClick={() => setShowGeneralPosts(!showGeneralPosts)} 
            className="toggleButton"
          >
            {showGeneralPosts ? 'Show Help Requests' : 'Show General Posts'}
          </button>
        </div>
      </div>
      <CreatePostModal isOpen={isModalOpen} onRequestClose={closeModal} onSubmit={handleNewPost} />
      <div className="forumPosts">
        {showGeneralPosts ? (
          <>
            <h2>General Posts</h2>
            {generalPosts.map(post => (
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
          </>
        ) : (
          <>
            <h2>Help Requests</h2>
            {helpRequests.map(post => (
              <div key={post._id} className="forumPost">
                <div className="postContent">
                  <Link to={`/forum/posts/help/${post._id}`}>
                    <h2>{post.title}</h2>
                  </Link>
                  <p>{post.content}</p>
                  {post.problemId && (
                    <div className="problem-link">
                      <Link to={`/problems/${post.problemId._id}`}>
                        {post.problemId.title}
                      </Link>
                    </div>
                  )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Forum;
