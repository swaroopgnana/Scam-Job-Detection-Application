import { NavLink, useNavigate } from "react-router-dom";
import { FaInfoCircle, FaStar, FaHistory, FaCreditCard, FaSignOutAlt, FaHome } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <h1 className="logo">ScamAI</h1>
        <nav className="nav-menu">
          <NavLink to="/analyze" className="nav-item"><FaHome /> Analyze</NavLink>
          <NavLink to="/about" className="nav-item"><FaInfoCircle /> About</NavLink>
          <NavLink to="/features" className="nav-item"><FaStar /> Features</NavLink>
          <NavLink to="/history" className="nav-item"><FaHistory /> History</NavLink>
          <NavLink to="/subscription" className="nav-item"><FaCreditCard /> Subscription</NavLink>
        </nav>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> Sign Out
      </button>
    </aside>
  );
};

export default Sidebar;