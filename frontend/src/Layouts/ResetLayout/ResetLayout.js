import Reset from "../../components/Reset/Reset";
import "./resetlayout.css";

const ResetLayout = () => {
  return (
    <div className="authlayout">
      <div className="authlayout_logo">
        <img src="../../assets/img/logo.png" alt="logo" />
      </div>
      <Reset />

    </div>
  );
};

export default ResetLayout;

