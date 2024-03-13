import Avatar from "../Avatar/Avatar";
import { useContext } from "react";
import "./profile.css";
import { AuthContext } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="profile">
      <div className="profile_avatar">
        <div className="profile_avatar-wrapper">
          <Avatar avatar={user.avatar} />
        </div>
      </div>
      <div>
        <h2>{user && user.name}</h2>
      </div>
    </div>
  );
};

export default Profile;
