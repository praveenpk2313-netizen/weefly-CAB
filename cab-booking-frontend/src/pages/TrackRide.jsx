import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import RatingModal from "../components/RatingModal";
import "./TrackRide.css";

const STATUS_STEPS = ["pending", "accepted", "arrived", "started", "completed"];

const STATUS_LABELS = {
    pending: "🔍 Searching for Driver",
    accepted: "✅ Driver Assigned",
    arrived: "📍 Driver Arrived",
    started: "🚗 Trip in Progress",
    completed: "🏁 Trip Completed",
    cancelled: "❌ Cancelled",
};

const STATUS_COLORS = {
    pending: "#facc15",
    accepted: "#4ade80",
    arrived: "#60a5fa",
    started: "#a78bfa",
    completed: "#4ade80",
    cancelled: "#f87171",
};

export default function TrackRide() {
    const { id } = useParams();
    const nav = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverVisible, setDriverVisible] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const fetchBooking = async () => {
        try {
            const res = await api.get(`/booking/${id}`);
            const data = res.data;
            setBooking(data);
            if (data.status !== "pending" && data.status !== "cancelled") {
                setDriverVisible(true);
            }
            if (data.status === "completed" && data.rating === 0 && !feedbackSubmitted) {
                setShowRatingModal(true);
            } else if (data.rating > 0) {
                setFeedbackSubmitted(true);
            }
        } catch (err) {
            console.error("Track fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingSubmit = async ({ rating, comment }) => {
        try {
            const res = await api.post("/booking/feedback", {
                bookingId: id,
                rating,
                feedback: comment
            });
            if (res.data.success) {
                setFeedbackSubmitted(true);
                setShowRatingModal(false);
                alert("Thank you for your feedback!");
                fetchBooking();
            }
        } catch (err) {
            console.error("Feedback submit error:", err);
            alert("Failed to submit feedback. Please try again.");
        }
    };

    useEffect(() => {
        fetchBooking();
        const interval = setInterval(fetchBooking, 3000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="track-wrap">
                <div className="track-loading">
                    <div className="spinner" />
                    <p>Loading booking details…</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="track-wrap">
                <div className="track-loading">
                    <p style={{ color: "#f87171" }}>Booking not found.</p>
                    <button className="back-btn" onClick={() => nav("/book")}>← Book Again</button>
                </div>
            </div>
        );
    }

    const stepIndex = STATUS_STEPS.indexOf(booking.status);
    const color = STATUS_COLORS[booking.status] || "#facc15";

    return (
        <div className="track-wrap">
            {/* Header */}
            <div className="track-header">
                <button className="back-btn" onClick={() => nav("/book")}>← Back</button>
                <h2 className="track-title">🛰 Track Your Ride</h2>
                <div />
            </div>

            <div className="track-content">

                {/* Booking Details Card */}
                <div className="track-card booking-card">
                    <div className="card-label">Booking Details</div>

                    <div className="status-badge" style={{ background: `${color}22`, border: `1px solid ${color}`, color }}>
                        {STATUS_LABELS[booking.status] || booking.status}
                    </div>

                    {booking.status !== "cancelled" && (
                        <div className="step-bar">
                            {STATUS_STEPS.map((s, i) => (
                                <div key={s} className="step-item">
                                    <div
                                        className={`step-dot ${i <= stepIndex ? "active" : ""}`}
                                        style={i <= stepIndex ? { background: color, boxShadow: `0 0 8px ${color}` } : {}}
                                    />
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div
                                            className={`step-line ${i < stepIndex ? "active" : ""}`}
                                            style={i < stepIndex ? { background: color } : {}}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="route-section">
                        <div className="route-point">
                            <span className="route-icon pickup-icon">📍</span>
                            <div>
                                <div className="route-label">Pickup</div>
                                <div className="route-value">{booking.pickup}</div>
                            </div>
                        </div>
                        <div className="route-connector" />
                        <div className="route-point">
                            <span className="route-icon drop-icon">🏁</span>
                            <div>
                                <div className="route-label">Drop</div>
                                <div className="route-value">{booking.drop}</div>
                            </div>
                        </div>
                    </div>

                    <div className="meta-grid">
                        <div className="meta-item">
                            <span className="meta-icon">🚕</span>
                            <div>
                                <div className="meta-label">Cab Type</div>
                                <div className="meta-value">{booking.cabType}</div>
                            </div>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">📏</span>
                            <div>
                                <div className="meta-label">Distance</div>
                                <div className="meta-value">{booking.distanceKm ?? "--"} km</div>
                            </div>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">💰</span>
                            <div>
                                <div className="meta-label">Fare</div>
                                <div className="meta-value fare-value">₹{booking.fare}</div>
                            </div>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">🆔</span>
                            <div>
                                <div className="meta-label">Booking ID</div>
                                <div className="meta-value id-value">{booking._id?.slice(-8).toUpperCase()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Waiting Animation - only when pending */}
                {booking.status === "pending" && (
                    <div className="track-card waiting-card">
                        <div className="pulse-rings">
                            <div className="ring ring1" />
                            <div className="ring ring2" />
                            <div className="ring ring3" />
                            <span className="car-emoji">🚖</span>
                        </div>
                        <p className="waiting-text">Searching for a driver nearby…</p>
                        <p className="waiting-sub">This usually takes less than 60 seconds</p>
                    </div>
                )}

                {/* Driver Details Card - visible after driver accepts */}
                {driverVisible && booking.driverId && (
                    <div className="track-card driver-card slide-in">
                        <div className="card-label">Driver Details</div>
                        <div className="driver-avatar-row">
                            <div className="driver-avatar">
                                {(booking.driverName || "D").charAt(0).toUpperCase()}
                            </div>
                            <div className="driver-info">
                                <div className="driver-name">{booking.driverName || "Driver"}</div>
                                <div className="driver-sub">⭐ 4.8 · Professional Driver</div>
                            </div>
                            <a href="tel:+911234567890" className="call-btn">📞 Call</a>
                        </div>

                        <div className="driver-meta-grid">
                            <div className="driver-meta-item">
                                <span className="meta-icon">🚗</span>
                                <div>
                                    <div className="meta-label">Vehicle</div>
                                    <div className="meta-value">{booking.vehicleInfo || booking.cabType}</div>
                                </div>
                            </div>
                            <div className="driver-meta-item">
                                <span className="meta-icon">🪪</span>
                                <div>
                                    <div className="meta-label">Driver ID</div>
                                    <div className="meta-value">{booking.driverId}</div>
                                </div>
                            </div>
                        </div>

                        {booking.status === "arrived" && (
                            <div className="arrived-pill">🏃 Driver has arrived at your location!</div>
                        )}

                        {(booking.status === "accepted" || booking.status === "arrived") && booking.startOtp && (
                            <div className="otp-display-container">
                                <div className="otp-label">Share this OTP with driver to start ride:</div>
                                <div className="otp-value">{booking.startOtp}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Completed card */}
                {booking.status === "completed" && (
                    <div className="track-card completed-card">
                        <div className="completed-icon">🎉</div>
                        <div className="completed-text">Trip Completed!</div>
                        <div className="completed-sub">Thank you for riding with us</div>
                        <div className="completed-fare">Total Paid: <strong>₹{booking.fare}</strong></div>
                        
                        {feedbackSubmitted ? (
                            <div className="feedback-done-msg">
                                <span className="check-icon">✅</span> Feedback Received
                            </div>
                        ) : (
                            <button className="book-again-btn feedback-trigger" onClick={() => setShowRatingModal(true)}>
                                Rate Your Trip
                            </button>
                        )}
                        
                        <button className="book-again-btn" onClick={() => nav("/book")}>Book Another Ride</button>
                    </div>
                )}

                <RatingModal
                    isOpen={showRatingModal}
                    onClose={() => setShowRatingModal(false)}
                    driverName={booking?.driverName || "your driver"}
                    onRatingSubmit={handleRatingSubmit}
                />

            </div>
        </div>
    );
}
