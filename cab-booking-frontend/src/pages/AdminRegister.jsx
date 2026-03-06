import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import "./AdminRegister.css";

export default function AdminRegister() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!username || !password) return alert("All fields are required");
        if (password !== confirmPassword) return alert("Passwords do not match");

        try {
            setLoading(true);
            const res = await api.post("/admin/register", { username, password });
            if (res.data.success) {
                alert("Registration successful! Please login.");
                navigate("/");
            }
        } catch (err) {
            alert(err?.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page-wrapper">
            <Navbar />
            <div className="register-container">
                <div className="glass-card">
                    <div className="card-header">
                        <h1 className="register-title">Admin Sign Up</h1>
                        <p className="register-subtitle">Create a new administrator account</p>
                    </div>

                    <form className="register-form" onSubmit={handleRegister}>
                        <div className="input-group">
                            <label>Username</label>
                            <div className="input-with-icon">
                                <span className="input-icon">👤</span>
                                <input
                                    className="premium-input"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    className="premium-input"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    className="premium-input"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button className="premium-cta-btn" type="submit" disabled={loading}>
                            {loading ? "Registering..." : "Create Account"}
                        </button>
                    </form>

                    <div className="card-footer">
                        <p>Already have an admin account? <span className="link-text" onClick={() => navigate("/")}>Login here</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
