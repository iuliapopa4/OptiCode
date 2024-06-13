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
  const [loading, setLoading] = useState(true);
  const [helpTitle, setHelpTitle] = useState('');
  const [helpContent, setHelpContent] = useState('');
  const [helpCode, setHelpCode] = useState('');

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

  const handleHelpRequestSubmit = async (e) => {
    e.preventDefault();
    if (!helpTitle.trim() || !helpContent.trim()) return;

    try {
      const response = await axios.post('/api/forum/posts/help', {
        title: helpTitle,
        content: helpContent,
        code: helpCode,
        problemId: problemId
      }, {
        headers: { Authorization: token }
      });

      console.log('Help request submitted:', response.data);
      setHelpTitle('');
      setHelpContent('');
      setHelpCode('');
    } catch (error) {
      console.error('Error submitting help request:', error);
    }
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
        <div className="help-section">
          <h2>Need Help?</h2>
          <form onSubmit={handleHelpRequestSubmit}>
            <input
              type="text"
              value={helpTitle}
              onChange={(e) => setHelpTitle(e.target.value)}
              placeholder="Title of your question"
              required
            />
            <textarea
              value={helpContent}
              onChange={(e) => setHelpContent(e.target.value)}
              placeholder="Describe your issue"
              required
            ></textarea>
            <textarea
              value={helpCode}
              onChange={(e) => setHelpCode(e.target.value)}
              placeholder="Optional: Include code"
            ></textarea>
            <button type="submit">Submit Request</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
