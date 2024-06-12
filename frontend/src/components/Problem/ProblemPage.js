import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CodeEditor from '../CodeEditor/CodeEditor';
import NavBar from "../NavBar/NavBar";
import './problempage.css';

const ProblemPage = () => {
  const { id: problemId } = useParams();
  const { token, user } = useContext(AuthContext);
  const [problem, setProblem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!problemId || !token) return;

      try {
        const problemResponse = await axios.get(`/api/getProblemByObjectId/${problemId}`, {
          headers: { Authorization: token }
        });
        setProblem(problemResponse.data);
      } catch (error) {
        console.error('Error fetching problem data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [problemId, token]);

  useEffect(() => {
    if (problem && token && user?._id) {
      axios.get(`/api/submissions/${user._id}/${problem._id}`, { headers: { Authorization: token } })
        .then(response => {
          setSubmissions(response.data);
        })
        .catch(error => {
          console.error('Error fetching submissions:', error);
        });
    }
  }, [problem, token, user]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    axios.post(`/api/addComment/${problemId}`, { text: newComment }, { headers: { Authorization: token } })
      .then(response => {
        setComments([response.data, ...comments]);
        setNewComment('');
      })
      .catch(error => {
        console.error('Error adding comment:', error);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="problem-page">
        <div className="problem-container">
          {problem ? (
            <div className="problem-details">
              <h1>{problem.title}</h1>
              <p>{problem.text}</p>
              <CodeEditor problemId={problem._id} testCases={problem.examples} userId={user._id} />
            </div>
          ) : (
            <p>Loading problem...</p>
          )}
        </div>
        <div className="submissions-section">
          <h2>Submissions</h2>
          <ul>
            {submissions.map((submission) => {
              const score = submission.score ? submission.score : 'Score not available';
              const resultClass = parseInt(submission.score) === 100 ? 'result-success' : parseInt(submission.score) === 0 ? 'result-fail' : 'result-partial';
              return (
                <li key={submission._id} className={resultClass}>
                  <a href={`/submission/${submission._id}`}>Submission on {new Date(submission.createdAt).toLocaleString()}</a> {score}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="comments-section">
          <h2>Comments</h2>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a comment or hint..."
            ></textarea>
            <button type="submit">Submit</button>
          </form>
          <ul>
            {comments.map((comment) => (
              <li key={comment._id}>
                <strong>{comment.userId.username}</strong> <span>{new Date(comment.createdAt).toLocaleString()}</span>
                <p>{comment.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
