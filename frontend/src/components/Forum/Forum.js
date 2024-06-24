import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";
import NavBar from "../NavBar/NavBar";
import { FaTrash } from 'react-icons/fa';
import CreatePostModal from '../Forum/CreatePostModal';
import "../Forum/forum.css";
import AdminHamburgerMenu from '../Admin/AdminHamburgerMenu';

const Forum = () => {
  // State variables for storing posts and modal visibility
  const [generalPosts, setGeneralPosts] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const { user, token } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGeneralPosts, setShowGeneralPosts] = useState(true);
  const [showUserPosts, setShowUserPosts] = useState(false);

  // Fetch general posts and help requests when the component mounts or showUserPosts changes
  useEffect(() => {
    if (!showUserPosts) {
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
    }
  }, [showUserPosts]);

  // Fetch user posts when showUserPosts or token changes
  useEffect(() => {
    if (showUserPosts) {
      axios.get('/api/forum/posts/user', {
        headers: { Authorization: `${token}` }
      })
      .then(response => {
        console.log("User posts retrieved from server:", response.data);
        setUserPosts(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the user posts!', error);
      });
    }
  }, [showUserPosts, token]);

  // Handle deleting a post
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/api/forum/posts/${postId}`, {
        headers: { Authorization: `${token}` }
      });
      setGeneralPosts(generalPosts.filter(post => post._id !== postId));
      setHelpRequests(helpRequests.filter(post => post._id !== postId));
      setUserPosts(userPosts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('There was an error deleting the post!', error);
    }
  };

  // Open and close modal handlers
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle creating a new post
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

  // Toggle showing user posts
  const toggleUserPosts = () => {
    setShowUserPosts(!showUserPosts);
  };

  return (
    <div>
      {user?.role === 'admin' ? <AdminHamburgerMenu /> : <NavBar />}
      <div className="forumLayout">
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
            <button 
              onClick={toggleUserPosts} 
              className="toggleButton"
            >
              {showUserPosts ? 'Show All Posts' : 'Show My Posts'}
            </button>
          </div>
        </div>
        <CreatePostModal isOpen={isModalOpen} onRequestClose={closeModal} onSubmit={handleNewPost} />
        <div className="forumPosts">
          {showUserPosts ? (
            <>
              <h2>My Posts</h2>
              {userPosts.map(post => (
                <div key={post._id} className="forumPost">
                  <div className="postContent">
                    <Link to={`/forum/posts/${post._id}`}>
                      <h2>{post.title}</h2>
                    </Link>
                    <p>{post.content}</p>
                    <div className="author">
                      By {post.authorId.name} on {new Date(post.timestamp).toLocaleString()}
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
          ) : showGeneralPosts ? (
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
    </div>
  );
};

export default Forum;
