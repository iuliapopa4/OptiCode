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
  const [totalProblems, setTotalProblems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/profile', { headers: { Authorization: token } });
        setUserData(response.data);
        console.log('User data:', response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const checkUserStreaks = async () => {
      try {
        const response = await axios.get('/api/checkStreaks', { headers: { Authorization: token } });
        if (response.data) {
          setUserData(prevState => ({
            ...prevState,
            streaks: response.data.streaks,
            maxStreak: response.data.maxStreak
          }));
        }
      } catch (error) {
        console.error("Error checking streaks:", error);
      }
    };

    fetchUserData();
    checkUserStreaks();
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProblems = problems.filter((problem) =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate level and progress dynamically
  const getLevelAndProgress = (points) => {
    const level = Math.floor(Math.sqrt(points / 100));
    const nextLevelPoints = 100 * Math.pow(level + 1, 2);
    const currentLevelPoints = 100 * Math.pow(level, 2);
    const pointsNeeded = nextLevelPoints - points;
    const progress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    const pointsInCurrentLevel = points - currentLevelPoints;
    const pointsForNextLevel = nextLevelPoints - currentLevelPoints;
    return { level, progress, pointsInCurrentLevel, pointsForNextLevel };
  };

  const { level, progress, pointsInCurrentLevel, pointsForNextLevel } = getLevelAndProgress(userData ? userData.points : 0);

  return (
    <div className="profile-layout">
      <NavBar />
      {userData ? (
        <div className="profile-info">
          <img src={userData.avatar} alt="User Avatar" className="profile-avatar" />
          <h2>{userData.name}</h2>
          {/* Level slider */}
          <div className="level-slider">
            <div className="level-info">
              <p>Level {level}</p>
            </div>
            <div className="slider-container">
              <div className="slider-progress" style={{ width: `${progress}%` }}></div>
              <div className="slider-text">{pointsInCurrentLevel}/{pointsForNextLevel}</div>
            </div>
          </div>
          <p><MdEmail /> {userData.email}</p>
          <div className="tooltip">
            <p><FaStar /> {userData.points.toFixed(2)}</p>
            <span className="tooltip-text">Points</span>
          </div>
          <div className="tooltip">
            <p>
              <FaPuzzlePiece /> {problems.length}/{totalProblems}
            </p>
            <span className="tooltip-text">You solved {problems.length} problems out of {totalProblems}.</span>
          </div>
          <div className="streaks">
            <p>Current Streak: {userData.streaks}</p>
            <p>Max Streak: {userData.maxStreak}</p>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          {selectedProblem && (
            <ul className="submissions-section">
              {submissions.map((submission) => {
                const score = submission.score ? submission.score : "Score not available";
                const resultClass =
                  parseInt(submission.score) === 100
                    ? "result-success"
                    : parseInt(submission.score) === 0
                    ? "result-fail"
                    : "result-partial";
                return (
                  <li key={submission._id} className={resultClass}>
                    <Link to={`/submission/${submission._id}`}>
                      Submission on {new Date(submission.createdAt).toLocaleString()}
                    </Link>{" "}
                    {score}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="problems-container">
            <ul>
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <li
                    key={problem._id}
                    className={`difficulty-${problem.difficulty.toLowerCase()}`}
                  >
                    <Link to="#" onClick={() => fetchSubmissionsForProblem(problem._id)}>
                      {problem.title}
                    </Link>
                  </li>
                ))
              ) : (
                <p>No problems found.</p>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProfileLayout;
