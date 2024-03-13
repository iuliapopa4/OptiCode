import Reset from "../../components/Reset/Reset";
import "./resetlayout.css";
import { useNavigate } from "react-router-dom";

const ResetLayout = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="authlayout">
      <div className="authlayout_logo">
        <img src="../../assets/img/logo.png" alt="logo" />
      </div>
      <Reset />
      <p className="reset_p" onClick={handleClick}>
        Login 
      </p>
    </div>
  );
};

export default ResetLayout;

