import { useParams, useNavigate } from "react-router-dom";
import "./activatelayout.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

const ActivateLayout = ({ history }) => {
  const { activation_token } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (activation_token) {
      const activateUser = async () => {
        try {
          const res = await axios.post("/api/auth/activation", {
            activation_token,
          });
          toast(res.data.msg, {
            className: "toast-success",
            bodyClassName: "toast-success",
          });
        } catch (err) {
          if (err.response) {
            console.log(err);
          }
        }
      };      
      activateUser();
    }
  }, [activation_token]);

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="activate">
      <ToastContainer />
      <p>
        Ready to Login ? <span onClick={handleClick}>Click Here!</span>
      </p>
    </div>
  );
};

export default ActivateLayout;