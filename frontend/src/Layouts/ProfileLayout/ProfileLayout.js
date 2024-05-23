import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./profilelayout.css";
import NavBar from "../../components/NavBar/NavBar";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { FaPuzzlePiece } from "react-icons/fa6";

const ProfileLayout = () => {
  const { token, user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [totalProblems, setTotalProblems] = useState(0); // New state for total problems

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/profile', { headers: { Authorization: token } });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [token]);

  useEffect(() => {
    const fetchTotalProblems = async () => {
      try {
        const response = await axios.get('/api/totalProblems', { headers: { Authorization: token } });
        setTotalProblems(response.data.totalProblems);
      } catch (error) {
        console.error("Error fetching total problems:", error);
      }
    };

    fetchTotalProblems();
  }, [token]);

  useEffect(() => {
    const fetchUserProblems = async () => {
      try {
        const response = await axios.get(`/api/subUser/${user._id}`, { headers: { Authorization: token } });
        setProblems(response.data.problems || []);
      } catch (error) {
        console.error("Error fetching user problems:", error);
        setProblems([]); 
      }
    };

    if (user) {
      fetchUserProblems();
    }
  }, [token, user]);

  const fetchSubmissionsForProblem = async (problemId) => {
    if (selectedProblem === problemId) {
      // Toggle off if the same problem is clicked again
      setSelectedProblem(null);
      setSubmissions([]);
      return;
    }
    try {
      const response = await axios.get(`/api/submissions/${user._id}/${problemId}`, { headers: { Authorization: token } });
      setSubmissions(response.data);
      setSelectedProblem(problemId);
    } catch (error) {
      console.error("Error fetching submissions for problem:", error);
    }
  };

  

  return (
    <div className="profile-layout">
      <NavBar />
      {userData ? (
        <div className="profile-info">
          <img src={userData.avatar} alt="User Avatar" className="profile-avatar" />
          <h2>{userData.name}</h2>
          <p><MdEmail />   {userData.email}</p>
          <div className="tooltip">
            <p><FaStar /> {userData.points}</p>
          <span className="tooltip-text">Points</span>
          </div>
          <div className="tooltip">
            <p>
              <FaPuzzlePiece /> {problems.length}/{totalProblems}
            </p>
            <span className="tooltip-text">You solved {problems.length} problems out of {totalProblems}.</span>
          </div>
          <ul>
            {problems.length > 0 ? problems.map(problem => (
              <li key={problem._id}>
                <Link to="#" onClick={() => fetchSubmissionsForProblem(problem._id)}>{problem.title}</Link>
              </li>
            )) : <p>No problems found.</p>}
          </ul>
          {selectedProblem && (
            <>
              <ul className="submissions-section">
                {submissions.map(submission => {
                  const score = submission.score ? submission.score : 'Score not available';
                  const resultClass = parseInt(submission.score) === 100 ? 'result-success' : parseInt(submission.score) === 0 ? 'result-fail' : 'result-partial';
                  return (
                    <li key={submission._id} className={resultClass}>
                      <Link to={`/submission/${submission._id}`}>Submission on {new Date(submission.createdAt).toLocaleString()}</Link> {score}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProfileLayout;
