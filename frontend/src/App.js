import React, { useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ActivateLayout from "./Layouts/ActivateLayout/ActivateLayout";
import AuthLayout from "./Layouts/AuthLayout/AuthLayout";
import ProfileLayout from "./Layouts/ProfileLayout/ProfileLayout";
import HomeLayout from "./Layouts/HomeLayout/HomeLayout";
import ResetLayout from "./Layouts/ResetLayout/ResetLayout";
import ProblemPage from "./components/Problem/ProblemPage";
import ProblemList from "./components/Problem/ProblemList";
import Submission from "./components/Problem/Submission";
import AddProblem from "./components/Problem/AddProblem";
import EditProfile from "./components/EditProfile/EditProfile";
import Forgot from "./components/Forgot/Forgot";
import { AuthContext } from "./context/AuthContext";
import axios from "axios";

function App() {
  const { dispatch, token, isLoggedIn } = useContext(AuthContext);

  // fetch access token
  useEffect(() => {
    const _appSignging = localStorage.getItem("_appSignging");
    if (_appSignging) {
      const getToken = async () => {
        const res = await axios.post("/api/auth/access", null);
        dispatch({ type: "GET_TOKEN", payload: res.data.ac_token });
      };
      getToken();
    }
  }, [dispatch, isLoggedIn]);

  // fetch user data when token changes
  useEffect(() => {
    if (token) {
      const getUser = async () => {
        dispatch({ type: "SIGNING" });
        const res = await axios.get("/api/auth/user", {
          headers: { Authorization: token },
        });
        dispatch({ type: "GET_USER", payload: res.data });
      };
      getUser();
    }
  }, [dispatch, token]);

  
  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <HomeLayout /> : <AuthLayout />} />
        <Route path="/auth/reset-password/:token" element={<ResetLayout />} />
        <Route path="/api/auth/activate/:activation_token" element={<ActivateLayout />} />
        <Route path="/profile" element={<ProfileLayout />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/problems/:id" element={<ProblemPage />} />
        <Route path="/problems" element={<ProblemList />} />
        <Route path="/addProblem" element={<AddProblem/>} />
        <Route path="/submission/:id" element={<Submission/>} />
        <Route path="/auth/forgot-password" element={<Forgot />} />
      </Routes>
    </Router>
  );
}

export default App;
