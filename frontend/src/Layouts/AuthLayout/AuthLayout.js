import Register from "../../components/Register/Register";
import Login from "../../components/Login/Login";
import "./authlayout.css";
import { useState } from "react";

const AuthLayout = () => {
  const [login, setLogin] = useState(true);
  const [register, setRegister] = useState(false);

  const handleLogin = () => {
    setLogin(true);
    setRegister(false);
  };
  const handleRegister = () => {
    setLogin(false);
    setRegister(true);
  };

  return (
    <div className="authlayout">
      <div className="authlayout_logo">
        <img src="./assets/img/logo.png" alt="logo" />
      </div>
      {login && <Login />}
      {register && <Register />}
      <div className="authlayout_actions">
      <p
        className="authlayout_actions-l"
        onClick={login ? handleRegister : handleLogin}
      >
        {login ? (
          <>
            Don't have an account? <br />
            <span style={{fontWeight:"bold", color:"#6899c8", cursor:"pointer"}}>Register now</span>
          </>
        ) : (
          <>
           Already have an account? <br />
            <span style={{fontWeight:"bold", color:"#6899c8", cursor:"pointer"}}>Login</span>
          </>
        )}
      </p>
    </div>

    </div>
  );
};

export default AuthLayout;