import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import { useNavigate } from 'react-router-dom';
import { FaRegSmileBeam, FaTasks, FaUsers, FaChartLine, FaCodeBranch } from 'react-icons/fa';
import "./homelayout.css";

const HomeLayout = () => {
  const navigate = useNavigate();
  const goProblems = () => {
    navigate('/problems');
  }

  return (
    <div className="homeLayout">
      <NavBar />
  
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
        <div className="feature">
          <FaChartLine className="icon" />
          <h2>Progress Tracking</h2>
          <p>Track your coding progress and improvement over time.</p>
        </div>
        <div className="feature">
          <FaCodeBranch className="icon" />
          <h2>Collaborative Coding</h2>
          <p>Work on coding problems together with friends and peers.</p>
        </div>
      </div>
  
      <div className="ctaSection">
        <h2 onClick={goProblems}>Ready to Start Your Coding Journey?</h2>
      </div>

    </div>
  );
};

export default HomeLayout;
