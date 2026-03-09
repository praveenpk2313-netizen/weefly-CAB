import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import RatingModal from "../components/RatingModal";
import "./TrackRide.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom car icon for the driver
const carIcon = L.divIcon({
    html: '<div style="display:flex;justify-content:center;align-items:center;font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🚕</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    className: 'car-marker-icon',
});

// Fit map bounds to show all markers (runs only once)
function FitBounds({ pickup, drop }) {
    const map = useMap();
    const fitted = useRef(false);
    useEffect(() => {
        if (fitted.current || !pickup) return;
        fitted.current = true;
        if (drop) {
            const bounds = L.latLngBounds([pickup, drop]).pad(0.15);
            map.fitBounds(bounds, { maxZoom: 15 });
        } else {
            map.setView(pickup, 14);
        }
    }, [pickup, drop, map]);
    return null;
}

// Smoothly move map centre to track driver if they are moving
function RecenterMap({ position, status }) {
    const map = useMap();
    useEffect(() => {
        if (!position) return;
        // Only auto-recenter if "started" (on the way to drop) or "accepted" (on the way to pickup)
        if (status === "accepted" || status === "started") {
            map.panTo(position, { animate: true, duration: 1.0 });
        }
    }, [position, status, map]);
    return null;
}

// Fetch OSRM route
async function fetchRoute(pick, drop) {
    const [plat, plng] = pick;
    const [dlat, dlng] = drop;
    const url = `https://router.project-osrm.org/route/v1/driving/${plng},${plat};${dlng},${dlat}?overview=full&geometries=polyline`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.code !== "Ok" || !json.routes?.[0]) return null;
        const r = json.routes[0];
        const coords = polyline.decode(r.geometry).map(([lat, lng]) => [lat, lng]);
        return { line: coords };
    } catch {
        return null;
    }
}

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
    const [routeLine, setRouteLine] = useState(null);
    const prevStatusRef = useRef(null);

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

    // Normalize lat/lng from booking (could be object {lat, lng} or array)
    const pickupLL = useMemo(() => {
        if (!booking?.pickupLatLng) return null;
        const p = booking.pickupLatLng;
        return Array.isArray(p) ? p : [p.lat, p.lng];
    }, [booking?.pickupLatLng]);

    const dropLL = useMemo(() => {
        if (!booking?.dropLatLng) return null;
        const d = booking.dropLatLng;
        return Array.isArray(d) ? d : [d.lat, d.lng];
    }, [booking?.dropLatLng]);

    // Fetch route between pickup and drop
    useEffect(() => {
        if (!pickupLL || !dropLL) return;
        fetchRoute(pickupLL, dropLL).then(r => {
            if (r?.line) setRouteLine(r.line);
        });
    }, [pickupLL, dropLL]);

    // Derive real driver position from booking data (sent by driver's device every 5s)
    const driverPos = useMemo(() => {
        // ✅ SNAP TO PICKUP if status is 'arrived'
        if (booking?.status === 'arrived') return pickupLL;

        if (!booking?.driverLatLng) return null;
        const d = booking.driverLatLng;
        return Array.isArray(d) ? d : [d.lat, d.lng];
    }, [booking?.driverLatLng, booking?.status, pickupLL]);

    // Reset step tracker on status change (kept for prevStatusRef)
    useEffect(() => {
        if (!booking) return;
        prevStatusRef.current = booking.status;
    }, [booking?.status]);

    const mapCenter = pickupLL || [13.0827, 80.2707];

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
                    <button className="back-btn" onClick={() => nav("/book")}>Back to Booking</button>
                </div>
            </div>
        );
    }

    const stepIndex = STATUS_STEPS.indexOf(booking.status);
    const color = STATUS_COLORS[booking.status] || "#facc15";

    return (
        <div className="track-wrap">
            <div className="track-header">
                <button className="back-btn" onClick={() => nav(-1)}>🚕 Back</button>
                <h2 className="track-title">🛰 Track Your Ride</h2>
                <div />
            </div>

            <div className="track-content">
                {pickupLL && (
                    <div className="track-card map-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="card-label" style={{ padding: '16px 20px 0' }}>Live Map</div>
                        <div style={{ height: '280px', borderRadius: '0 0 20px 20px', overflow: 'hidden' }}>
                            <MapContainer
                                center={mapCenter}
                                zoom={13}
                                zoomControl={false}
                                style={{ height: '100%', width: '100%', zIndex: 1 }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <FitBounds pickup={pickupLL} drop={dropLL} />
                                <RecenterMap position={driverPos} status={booking.status} />

                                <Marker position={pickupLL}>
                                    <Popup><b>📍 Pickup</b><br />{booking.pickup}</Popup>
                                </Marker>

                                {dropLL && (
                                    <Marker position={dropLL}>
                                        <Popup><b>🏁 Drop</b><br />{booking.drop}</Popup>
                                    </Marker>
                                )}

                                {routeLine && routeLine.length > 0 && (
                                    <Polyline positions={routeLine} pathOptions={{ color: '#facc15', weight: 5, opacity: 0.85 }} />
                                )}

                                {driverPos && driverVisible && booking.status !== 'completed' && (
                                    <Marker position={driverPos} icon={carIcon} zIndexOffset={1000}>
                                        <Popup><b>🚕 Your Driver</b><br />{booking.driverName || 'Driver'}</Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </div>
                    </div>
                )}

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
