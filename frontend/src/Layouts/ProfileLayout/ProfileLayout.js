import React from "react";
import "./profilelayout.css";
// import Profile from "../../components/Profile/Profile";
import NavBar from "../../components/NavBar/NavBar";
import EditProfile from "../../components/EditProfile/EditProfile";

const ProfileLayout = () => {
  return (
    <div className="profile-layout">
      <NavBar />
      <EditProfile/>

{/*       
      <div className="content-layout">
        <div className="profile-container">
          <Profile />
        </div>
        <div className="info-container">
        </div>
      </div> */}
    </div>
  );
};

export default ProfileLayout;
