import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import "./Signup.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "customer";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      if (!formData.username || !formData.name || !formData.phone || !formData.email || !formData.password) {
        return alert("Please fill all fields");
      }
      setLoading(true);
      const res = await api.post("/auth/signup", { ...formData, role });

      if (res.data.success) {
        alert("Signup successful! Please login.");
        navigate("/");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <Navbar />
      <div className="login-container">
        <div className="glass-card">
          <div className="card-header">
            <h1 className="login-title">Join Wheefly</h1>
            <p className="login-subtitle">
              {role === 'driver' ? 'Register and start earning as a pro driver' : 'Experience luxury travel at your fingertips'}
            </p>
          </div>

          <form className="login-form" onSubmit={handleSignup}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  className="premium-input"
                  placeholder="Choose a username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon">📛</span>
                <input
                  id="name"
                  className="premium-input"
                  placeholder="Enter your full name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="phone">Mobile Number</label>
              <div className="input-with-icon">
                <span className="input-icon">📱</span>
                <input
                  id="phone"
                  className="premium-input"
                  placeholder="10-digit mobile number"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email ID</label>
              <div className="input-with-icon">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  className="premium-input"
                  placeholder="yourname@example.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  className="premium-input"
                  placeholder="Create a password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`premium-cta-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Sign Up'}
              {!loading && <span className="btn-arrow">→</span>}
            </button>
          </form>

          <div className="card-footer">
            <p>Already have an account? <span className="link-text" onClick={() => navigate("/")}>Login instead</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
