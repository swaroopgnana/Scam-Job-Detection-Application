import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await API.post("/auth/register", form);
      login(data);
      navigate("/analyze");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <p className="error-text">{error}</p>}
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" className="green-btn">Create Account</button>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Signup;
