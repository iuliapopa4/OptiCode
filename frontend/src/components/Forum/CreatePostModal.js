import React, { useState, useContext } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // Adjust the import path as needed
import './forum.css';

Modal.setAppElement('#root'); // This is to avoid accessibility issues with the modal

const CreatePostModal = ({ isOpen, onRequestClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [code, setCode] = useState('');
  const { user, token } = useContext(AuthContext); // Get user information and token from the auth context

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!title || !content) {
      alert('Title and content are required.');
      return;
    }

    try {
      const response = await axios.post('/api/forum/posts', {
        title,
        content,
        code,
        authorId: user._id
      }, {
        headers: { Authorization: `${token}` } // Include the token in the request headers
      });

      onRequestClose();
      window.location.reload(); // Reload the page to show the new post
    } catch (error) {
      console.error('There was an error creating the post!', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Create New Post"
      className="modal"
      overlayClassName="overlay"
    >
      <div className="modalHeader">
        <h1>Create New Post</h1>
        <button onClick={onRequestClose} className="closeButton">
          &times;
        </button>
      </div>
      <form onSubmit={handleSubmit} className="createPostForm">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
        />
        <label htmlFor="code">Code (optional)</label>
        <textarea
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
        />
        <button type="submit">Submit</button>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
