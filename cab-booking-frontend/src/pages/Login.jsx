import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState("customer");
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any stale OTP from previous attempts
    localStorage.removeItem("tempOtp");
  }, []);

  const handleLogin = async () => {
    try {
      if (!email || !password) return alert("Please enter both email and password");
      setLoading(true);

      const endpoint = activeRole === 'admin' ? "/admin/login" : "/auth/login";
      const payload = activeRole === 'admin' ? { username: email, password } : { email, password };
      
      const res = await api.post(endpoint, payload);

      if (res.data.success) {
        if (activeRole === 'admin') {
          localStorage.setItem("adminToken", res.data.token);
          localStorage.setItem("role", "admin");
          navigate("/admin");
        } else {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", res.data.user.role);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/book");
        }
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page-wrapper">
      <Navbar />
      <div className="login-container">
        <div className="glass-card">
          <div className="role-selector">
            {['customer', 'driver', 'admin'].map((role) => (
              <button
                key={role}
                className={`role-tab ${activeRole === role ? 'active' : ''}`}
                onClick={() => setActiveRole(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          <div className="card-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              {activeRole === 'admin' ? 'System Administrator Access' : 'Book your luxury ride in seconds'}
            </p>
          </div>

          <div className="login-form">
            {activeRole === 'admin' ? (
              <>
                <div className="input-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input
                      id="username"
                      className="premium-input"
                      placeholder="Admin username"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div className="forgot-password">
                  <span className="link-text" onClick={() => alert("Contact system owner for password reset")}>Forgot password?</span>
                </div>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label htmlFor="email">Email ID</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📧</span>
                    <input
                      id="email"
                      className="premium-input"
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
              </>
            )}

            <button
              className={`premium-cta-btn ${loading ? 'loading' : ''}`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Login'}
              {!loading && <span className="btn-arrow">→</span>}
            </button>
          </div>

          <div className="card-footer">
            {activeRole === 'admin' ? (
              <p>New administrator? <span className="link-text" onClick={() => navigate("/admin/register")}>Register account</span></p>
            ) : (
              <p>Don't have an account? <span className="link-text" onClick={() => navigate("/signup")}>Sign Up</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Marketing Sections */}
      <section id="why-choose-us" className="marketing-section">
        <h2 className="section-title">Why Choose Wheefly?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <h3>Safe & Secure</h3>
            <p>Verified drivers and real-time ride tracking for your peace of mind.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Fast Response</h3>
            <p>Get a cab in minutes. No more waiting on the street.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💎</span>
            <h3>Premium Experience</h3>
            <p>Luxury vehicles at affordable prices, every single time.</p>
          </div>
        </div>
      </section>

      <section id="about-us" className="marketing-section about-bg">
        <div className="about-content">
          <h2 className="section-title">A Bit About Us</h2>
          <p className="about-text">
            Wheefly Cab started with a simple vision: to make urban transportation seamless, safe, and sophisticated.
            We believe that every ride should be an experience, not just a commute. Our platform connects thousands of
            happy riders with professional drivers using state-of-the-art technology.
          </p>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-desc">Daily Rides</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5K+</span>
              <span className="stat-desc">Pro Drivers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.9</span>
              <span className="stat-desc">User Rating</span>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="marketing-section">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <h4>Our Office</h4>
                <p>123 Luxury Lane, Chennai, India</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <div>
                <h4>Email Support</h4>
                <p>support@wheefly.com</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <h4>Phone</h4>
                <p>+91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
