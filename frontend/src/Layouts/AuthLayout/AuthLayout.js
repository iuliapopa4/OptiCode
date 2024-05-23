import Register from "../../components/Register/Register";
import Login from "../../components/Login/Login";
import Forgot from "../../components/Forgot/Forgot";
import { useNavigate } from "react-router-dom"; 
import "./authlayout.css";
import { useState } from "react";

const AuthLayout = () => {
  const [login, setLogin] = useState(true);
  const [register, setRegister] = useState(false);
  const [forgot, setForgot] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => {
    setLogin(true);
    setRegister(false);
    setForgot(false);
  };
  const handleRegister = () => {
    setLogin(false);
    setRegister(true);
    setForgot(false);
  };
  const handleForgot = () => {
    setLogin(false);
    setRegister(false);
    setForgot(true);
    navigate("/auth/forgot-password"); 
  };

  return (
    <div className="authlayout">
      <div className="authlayout_logo">
        <img src="./assets/img/logo.png" alt="logo" />
      </div>
      {login && <Login />}
      {register && <Register />}
      {forgot && <Forgot />}
      <div className="authlayout_actions">
        <div onClick={login ? handleRegister : handleLogin}>
          {login ? (
            <>
              Don't have an account? <span>Register now</span>
            </>
          ) : (
            <>
              Already have an account? <span>Login</span>
            </>
          )}
        </div>
        <div onClick={handleForgot}>
          Forgot your password?
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
