import React, { useState, useEffect } from "react";
import { api } from "../api";
import Navbar from "../components/Navbar";
import "./TripHistory.css";

const STATUS_ICON = {
    completed: "✅",
    cancelled: "❌",
    started: "🟡",
    arrived: "📍",
    accepted: "🚘",
    pending: "⏳",
};

const TripHistory = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const userStr = localStorage.getItem("user");
    const userData = userStr ? JSON.parse(userStr) : null;
    const phone = userData?.phone || "";

    useEffect(() => {
        const fetchHistory = async () => {
            if (!phone) {
                setError("Please log in to view your trip history.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await api.get(`/booking/history/${phone}`);
                setTrips(res.data);
            } catch (err) {
                const msg = err?.response?.data?.message || err.message || "Unknown error";
                setError(`Failed to load trip history: ${msg}`);
                console.error("Trip history error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [phone]);

    return (
        <div className="history-page-wrapper">
            <Navbar />
            <div className="history-container">
                <div className="glass-card history-card">
                    <div className="history-header">
                        <h1 className="login-title">Trip History</h1>
                        <p className="login-subtitle">Your recent journeys with us</p>
                    </div>

                    {loading && (
                        <div className="muted" style={{ textAlign: "center", padding: "24px" }}>
                            Loading your trips...
                        </div>
                    )}

                    {error && (
                        <div className="muted" style={{ textAlign: "center", padding: "24px", color: "#f87171" }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && trips.length === 0 && (
                        <div className="muted" style={{ textAlign: "center", padding: "24px" }}>
                            No trips found. Book your first ride!
                        </div>
                    )}

                    <div className="history-list">
                        {trips.map((trip) => (
                            <div key={trip._id} className="history-item">
                                <div className="trip-main-info">
                                    <div className="trip-date">
                                        {new Date(trip.createdAt).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <div className="trip-id">ID: {trip._id.slice(-6).toUpperCase()}</div>
                                </div>

                                <div className="trip-path">
                                    <div className="path-node">
                                        <span className="dot pickup"></span>
                                        <span className="location">{trip.pickup}</span>
                                    </div>
                                    <div className="path-line"></div>
                                    <div className="path-node">
                                        <span className="dot drop"></span>
                                        <span className="location">{trip.drop}</span>
                                    </div>
                                </div>

                                <div className="trip-footer">
                                    <div className="trip-meta">
                                        <span className="trip-fare">₹{trip.fare}</span>
                                        <span className="trip-status">
                                            {STATUS_ICON[trip.status] || "•"} {trip.status}
                                        </span>
                                        <span className="trip-cab">
                                            {trip.cabType} • {trip.distanceKm || 0} km
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripHistory;
