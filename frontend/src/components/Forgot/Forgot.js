import Input from "../Input/Input";
import { isEmpty, isEmail } from "../helper/validate";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import "./forgot.css";

const Forgot = () => {
  const [email, setEmail] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleReset = () => {
    Array.from(document.querySelectorAll("input")).forEach(
      (input) => (input.value = "")
    );
    setEmail({ email: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty(email))
      return toast("Please fill in all fields.", {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    if (!isEmail(email))
      return toast("Please enter a valid email address.", {
        className: "toast-failed",
        bodyClassName: "toast-failed",
      });
    try {
      await axios.post("/api/auth/forgot_pass", { email });
      handleReset();
      return toast("Check your email to change your password!", {
        className: "toast-success",
        bodyClassName: "toast-success",
      });
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
      <form onSubmit={handleSubmit}>
        <h2 style={{textAlign:"center",marginBottom:"30px"}}>FORGOT PASSWORD</h2>
        <p style={{color:'grey', textAlign:"center"}}>Please enter your email address below. <br/> We'll send you a link to reset your password.</p>
        <Input
          type="text"
          text="Email"
          name="email"
          handleChange={handleChange}
        />
        <div className="login_btn">
          <button type="submit">Reset</button>
        </div>
      </form>
    </>
  );
};

export default Forgot;