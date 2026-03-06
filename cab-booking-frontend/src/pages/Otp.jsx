import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import "./Otp.css";

export default function Otp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const verifyOtp = async () => {
    try {
      const otpString = otp.join("");
      if (otpString.length !== 4) return setMessage({ type: "error", text: "Please enter 4-digit OTP" });

      setLoading(true);
      const phone = localStorage.getItem("phone");
      const role = localStorage.getItem("role") || "customer";

      const res = await api.post("auth/verify-otp", {
        phone,
        otp: otpString,
        role,
      });

      if (res.data.success) {
        console.log("OTP verify success, data:", res.data);
        setMessage({ type: "success", text: "Success! Redirecting..." });

        const userData = res.data.user;
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
        }

        // Cleanup
        localStorage.removeItem("tempOtp");

        let path = "/book";
        if (role === "driver") path = "/driver";
        if (role === "admin") path = "/admin";

        setTimeout(() => navigate(path), 1500);
      } else {
        setMessage({ type: "error", text: "Invalid OTP. Please try again." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "OTP verify failed. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      const phone = localStorage.getItem("phone");
      const res = await api.post("/auth/send-otp", { phone });

      if (res.data.otp) {
        localStorage.setItem("tempOtp", res.data.otp);
        // Force re-render to show new OTP
        setMessage({ type: "success", text: "New OTP sent!" });
      } else {
        setMessage({ type: "success", text: "OTP resent successfully!" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to resend OTP." });
    }
  };

  return (
    <div className="otp-page-wrapper">
      <Navbar />
      <div className="otp-container">
        <div className="glass-card otp-card">
          <div className="card-header">
            <div className="brand-badge">Verification</div>
            <h1 className="login-title">Verify OTP</h1>
            <p className="login-subtitle">We've sent a code to your phone</p>
            {localStorage.getItem("tempOtp") && (
              <div className="debug-otp-display">
                <span className="debug-label">Development OTP:</span>
                <span className="debug-value">{localStorage.getItem("tempOtp")}</span>
              </div>
            )}
          </div>

          <div className="otp-form">
            <div className="otp-input-grid">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength="1"
                  className="otp-digit-input"
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                />
              ))}
            </div>

            {message.text && (
              <div className={`status-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button
              className={`premium-cta-btn ${loading ? 'loading' : ''}`}
              onClick={verifyOtp}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
              {!loading && <span className="btn-arrow">→</span>}
            </button>

            <div className="resend-container">
              <p>Didn't receive the code? <span className="resend-link" onClick={resendOtp}>Resend OTP</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
