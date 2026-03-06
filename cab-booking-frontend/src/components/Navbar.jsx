import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import "./Navbar.css";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications] = useState([
        { type: 'booking', message: 'Your ride to Chennai Central is confirmed!', time: '2 mins ago', unRead: true },
        { type: 'arrival', message: 'Driver is arriving in 3 mins.', time: 'Just now', unRead: true },
    ]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);

        // Get user name from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(user.name || user.username || "");
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/");
    };

    const role = localStorage.getItem("role");
    const homePath = role === "driver" ? "/driver" : "/book";
    const scrollToSection = (id) => {
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const isHomePage = location.pathname === "/";

    return (
        <>
            <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <span className="logo-icon">🚕</span>
                        <span className="logo-text">WHEEFLY CAB</span>
                    </Link>

                    <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
                        {isHomePage ? (
                            <>
                                <a href="#why-choose-us" onClick={(e) => { e.preventDefault(); scrollToSection('why-choose-us'); }}>Why Choose Us</a>
                                <a href="#about-us" onClick={(e) => { e.preventDefault(); scrollToSection('about-us'); }}>About Us</a>
                                <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
                            </>
                        ) : (
                            <>
                                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>

                                {role === "driver" && (
                                    <Link to="/driver" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                                )}
                                <Link to="/history" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>
                            </>
                        )}

                        <div className="nav-actions">
                            {userName && (
                                <div className="nav-user-info">
                                    <span className="user-icon">👤</span>
                                    <span className="user-name">{userName || "User"}</span>
                                </div>
                            )}

                            <div className="notif-bell-container" onClick={() => setNotifOpen(true)}>
                                <span className="bell-icon-nav">🔔</span>
                                {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
                            </div>
                            {userName && (
                                <button className="nav-logout-btn" onClick={handleLogout}>
                                    <span className="logout-icon">⏻</span>
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
                        <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
                        <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
                    </div>
                </div>
            </nav>

            <NotificationPanel
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                notifications={notifications}
            />
        </>
    );
}
