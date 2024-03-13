import { useContext, useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { isEmpty, isEmail } from "../helper/validate";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Input from "../Input/Input";
import "./login.css";
import { AuthContext } from "../../context/AuthContext";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(initialState);
  const { email, password } = data;
  const { dispatch } = useContext(AuthContext);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleClick = () => {
    setVisible(!visible);
  };

  const login = async (e) => {
    e.preventDefault();
    if (isEmpty(email) || isEmpty(password))
      return toast("Please fill in all fields.", {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    if (!isEmail(email))
      return toast("Please enter a valid email addresss.", {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    try {
      await axios.post("/api/auth/signing", { email, password });
      localStorage.setItem("_appSignging", true);
      dispatch({ type: "SIGNING" });
    } catch (err) {
      toast(err.response.data.msg, {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    }
  };


  return (
    <>
      <ToastContainer />
      <div>
        <form className="login" onSubmit={login}>
          <Input
            type="email"
            text="Email"
            name="email"
            handleChange={handleChange}
          />
          <Input
            name="password"
            type={visible ? "text" : "password"}
            icon={visible ? <MdVisibility /> : <MdVisibilityOff />}
            text="Password"
            handleClick={handleClick}
            handleChange={handleChange}
          />
          <div className="login_btn">
            <button type="submit">Login</button>
          </div>
        </form>

      </div>
    </>
  );
};

export default Login;
