import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import { useNavigate } from 'react-router-dom';
import { FaRegSmileBeam, FaTasks, FaUsers } from 'react-icons/fa';
import "./homelayout.css";

const HomeLayout = () => {
  const navigate = useNavigate();
  const goProblems = () => {
    navigate('/problems');
  }

  return (
    <div className="homeLayout">
      <NavBar />
      <div className="heroSection">
        <h1>Unlock Your Coding Potential</h1>
        <p>Master coding by solving fun challenges and tracking your progress!</p>
        <button className="start" onClick={goProblems}>Start Coding</button>
      </div>
      <div className="featuresSection">
        <div className="feature">
          <FaRegSmileBeam className="icon" />
          <h2>Instant Feedback</h2>
          <p>Get instant feedback on your code to learn and improve faster.</p>
        </div>
        <div className="feature">
          <FaTasks className="icon" />
          <h2>Variety of Challenges</h2>
          <p>From beginners to advanced, solve problems across a range of difficulties.</p>
        </div>
        <div className="feature">
          <FaUsers className="icon" />
          <h2>Leaderboard</h2>
          <p>Compete with friends and coders worldwide. Climb the leaderboard!</p>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
