import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  PASSWORD_RULE_TEXT,
  getPasswordValidationMessage
} from "../utils/authValidation";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const passwordMessage = passwordTouched ? getPasswordValidationMessage(form.password) : "";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
      setPasswordTouched(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!PASSWORD_REGEX.test(form.password)) {
      setError(PASSWORD_RULE_TEXT);
      return;
    }

    try {
      const { data } = await API.post("/auth/login", {
        email: form.email.trim(),
        password: form.password
      });
      login(data);
      navigate("/analyze");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        {error && <p className="error-text">{error}</p>}
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          onFocus={() => setPasswordTouched(true)}
          pattern="^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$"
          title={PASSWORD_RULE_TEXT}
          required
        />
        {passwordMessage && <p className="auth-hint">{passwordMessage}</p>}
        <button type="submit" className="gradient-btn">Login</button>
        <p className="auth-switch">Don&apos;t have an account? <Link to="/signup">Signup</Link></p>
      </form>
    </div>
  );
};

export default Login;
