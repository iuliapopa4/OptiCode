import React from "react";
import "./profilelayout.css";
import NavBar from "../../components/NavBar/NavBar";
import EditProfile from "../../components/EditProfile/EditProfile";

const ProfileLayout = () => {
  return (
    <div className="profile-layout">
      <NavBar />
      <EditProfile/>

    </div>
  );
};

export default ProfileLayout;
