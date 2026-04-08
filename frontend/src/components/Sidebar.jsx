import { NavLink, useNavigate } from "react-router-dom";
import { FaInfoCircle, FaStar, FaHistory, FaCreditCard, FaSignOutAlt, FaHome } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Sidebar = ({ isOpen = false, onNavigate = () => {} }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onNavigate();
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div>
        <h1 className="logo">JobLens</h1>
        <ThemeToggle className="sidebar-theme-toggle" />
        <nav className="nav-menu">
          <NavLink to="/analyze" className="nav-item" onClick={onNavigate}><FaHome /> Analyze</NavLink>
          <NavLink to="/about" className="nav-item" onClick={onNavigate}><FaInfoCircle /> About</NavLink>
          <NavLink to="/features" className="nav-item" onClick={onNavigate}><FaStar /> Features</NavLink>
          <NavLink to="/history" className="nav-item" onClick={onNavigate}><FaHistory /> History</NavLink>
          <NavLink to="/subscription" className="nav-item" onClick={onNavigate}><FaCreditCard /> Subscription</NavLink>
        </nav>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> Sign Out
      </button>
    </aside>
  );
};

export default Sidebar;
