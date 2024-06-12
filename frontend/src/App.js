import React, { useEffect, useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
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
import Leaderboard from "./components/Leaderboard/Leaderboard";
import Forgot from "./components/Forgot/Forgot";
import Forum from "./components/Forum/Forum";
import ForumPost from "./components/Forum/ForumPost";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ManageProblems from "./components/Admin/ManageProblems";
import CreateProblem from "./components/Admin/createProblem";
import EditProblem from "./components/Admin/editProblem";
import SuggestedProblems from "./components/Admin/suggestedProblems";
import EditSuggestedProblem from "./components/Admin/editSuggestedProblem";
import AdminForum from "./components/Admin/AdminForum";
import AdminForumPost from "./components/Admin/AdminForumPost";
import ManageUsers from "./components/Admin/ManageUsers";
import { AuthContext } from "./context/AuthContext";
import axios from "axios";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { dispatch, token, isLoggedIn, user } = useContext(AuthContext);
  const [streaksChecked, setStreaksChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const _appSignging = localStorage.getItem("_appSignging");
    if (_appSignging) {
      const getToken = async () => {
        try {
          const res = await axios.post("/api/auth/access", null);
          dispatch({ type: "GET_TOKEN", payload: res.data.ac_token });
          setLoading(false);
        } catch (error) {
          console.error("Error fetching token", error);
          setLoading(false);
        }
      };
      getToken();
    } else {
      setLoading(false);
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (token) {
      const getUser = async () => {
        try {
          dispatch({ type: "SIGNING" });
          const res = await axios.get("/api/auth/user", {
            headers: { Authorization: token },
          });
          dispatch({ type: "GET_USER", payload: res.data });
        } catch (error) {
          console.error("Error fetching user data", error);
          navigate('/');
        }
      };
      getUser();
    }
  }, [dispatch, token, navigate]);

  useEffect(() => {
    if (token && user && !streaksChecked) {
      const checkStreaks = async () => {
        try {
          const res = await axios.get("/api/checkStreaks", {
            headers: { Authorization: token },
          });
          console.log('Streaks checked:', res.data);
          dispatch({ type: "UPDATE_STREAKS", payload: res.data.streaks });
          dispatch({ type: "UPDATE_MAXSTREAK", payload: res.data.maxStreak });
          setStreaksChecked(true);
        } catch (error) {
          console.error('Error checking streaks:', error);
        }
      };
      checkStreaks();
    }
  }, [token, user, dispatch, streaksChecked]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <HomeLayout /> : <AuthLayout />} />
      <Route path="/auth/reset-password/:token" element={<ResetLayout />} />
      <Route path="/api/auth/activate/:activation_token" element={<ActivateLayout />} />
      <Route path="/profile" element={isLoggedIn ? <ProfileLayout /> : <AuthLayout />} />
      <Route path="/editprofile" element={isLoggedIn ? <EditProfile /> : <AuthLayout />} />
      <Route path="/problems/:id" element={isLoggedIn ? <ProblemPage /> : <AuthLayout />} />
      <Route path="/problems" element={isLoggedIn ? <ProblemList /> : <AuthLayout />} />
      <Route path="/addProblem" element={isLoggedIn ? <AddProblem /> : <AuthLayout />} />
      <Route path="/submission/:id" element={isLoggedIn ? <Submission /> : <AuthLayout />} />
      <Route path="/auth/forgot-password" element={<Forgot />} />
      <Route path="/leaderboard" element={isLoggedIn ? <Leaderboard /> : <AuthLayout />} />
      <Route path="/forum" element={isLoggedIn ? <Forum /> : <AuthLayout />} />
      <Route path="/forum/posts/:id" element={isLoggedIn ? <ForumPost /> : <AuthLayout />} />

      <Route path="/admin/dashboard" element={<ProtectedRoute component={AdminDashboard} adminOnly />} />
      <Route path="/admin/manage-problems" element={<ProtectedRoute component={ManageProblems} adminOnly />} />
      <Route path="/admin/addProblem" element={<ProtectedRoute component={CreateProblem} adminOnly />} />
      <Route path="/admin/editProblem/:id" element={<ProtectedRoute component={EditProblem} adminOnly />} />
      <Route path="/admin/manage-users" element={<ProtectedRoute component={ManageUsers} adminOnly />} />
      <Route path="/admin/suggested-problems" element={<ProtectedRoute component={SuggestedProblems} adminOnly />} />
      <Route path="/admin/editSuggestedProblem/:id" element={<ProtectedRoute component={EditSuggestedProblem} adminOnly />} />
      <Route path="/admin/forum" element={<ProtectedRoute component={AdminForum} adminOnly />} />
      <Route path="/admin/forum/posts/:id" element={<ProtectedRoute component={AdminForumPost} adminOnly />} />
    </Routes>
  );
}

export default App;
