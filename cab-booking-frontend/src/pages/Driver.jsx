import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RideRequestModal from "../components/RideRequestModal";
import LocationAutocomplete from "../components/LocationAutocomplete";
import "./Driver.css";

export default function Driver() {
  const [orders, setOrders] = useState([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Initializing with data specific to session or empty to avoid "old data" feel
  const [earnings, setEarnings] = useState({ daily: 450, weekly: 3200, monthly: 12500 });
  const [rating, setRating] = useState(4.8);
  const [showRequest, setShowRequest] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [driver, setDriver] = useState(null);
  const [wallet, setWallet] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (role !== "driver" || !userStr) {
      nav("/");
      return;
    }

    const userData = JSON.parse(userStr);
    setDriver(userData);
    setWallet(userData.wallet || 0);

    // Fetch latest user data to get accurate wallet balance
    const fetchUser = async () => {
      try {
        const res = await api.get(`/auth/user/${userData.id || userData._id}`);
        if (res.data.success) {
          setWallet(res.data.user.wallet || 0);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (e) {
        console.error("Fetch user error:", e);
      }
    };
    fetchUser();
  }, [nav]);

  const loadAll = async () => {
    if (!isOnline) return;
    try {
      setLoading(true);
      const [availRes, activeRes] = await Promise.all([
        api.get("/booking/available"),
        api.get(`/booking/driver-active/${DRIVER_ID}`),
      ]);
      const available = Array.isArray(availRes.data) ? availRes.data : [];
      setOrders(available);

      // Auto-show topmost request as modal if not already shown
      if (available.length > 0 && !showRequest && !activeTrip) {
        setCurrentRequest(available[0]);
        setShowRequest(true);
      }

      setActiveTrip(activeRes.data || null);
    } catch (e) {
      console.log("Driver load error:", e);
      setOrders([]);
      setActiveTrip(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 3000);
    return () => clearInterval(t);
  }, [isOnline]);

  const toggleStatus = () => {
    setIsOnline(!isOnline);
    if (isOnline) {
      setOrders([]);
    }
  };

  const accept = async (bookingId) => {
    try {
      setLoading(true);
      const res = await api.post("/booking/accept", {
        bookingId,
        driverId: DRIVER_ID,
        driverName: driver?.name || "Driver",
        vehicleInfo: "Maruti Swift (White) · TN 01 AB 1234",
      });
      const booking = res.data?.booking || res.data?.trip || null;
      if (!booking?._id) {
        alert("Trip not received from server");
        return;
      }
      nav(`/driver-trip/${booking._id}`);
    } catch (e) {
      alert(e?.response?.data?.message || "Accept failed");
    } finally {
      setLoading(false);
    }
  };

  const openTrip = () => {
    if (!activeTrip?._id) return;
    nav(`/driver-trip/${activeTrip._id}`);
  };

  return (
    <div className="driver-page-wrapper">
      <Navbar />

      {/* ── LEFT PANEL: Identity + Stats ── */}
      <div className="dash-left">
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="login-title">Welcome, {driver?.name || "Driver"}</h1>
            <div className="driver-info-badges">
              <div className="driver-id-badge">ID: {DRIVER_ID}</div>
              <div className="driver-rating-badge">⭐ {rating}</div>
              <div className="kyc-status-badge verified">KYC Verified</div>
            </div>
          </div>

          <div className="status-toggle-container">
            <span className={`status-label ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
            <label className="premium-switch">
              <input
                type="checkbox"
                checked={isOnline}
                onChange={toggleStatus}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
        </div>

        <div className="dashboard-stats-grid">
          <div className="stat-card wallet-card">
            <div className="stat-icon">💰</div>
            <div className="stat-details">
              <label>Wallet Balance</label>
              <p>₹{wallet}</p>
              <button className="payout-btn" onClick={() => alert("Payout request sent!")}>Withdraw</button>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-details">
              <label>Daily Earnings</label>
              <p>₹{earnings.daily}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-details">
              <label>Weekly Earnings</label>
              <p>₹{earnings.weekly}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Trip + Orders ── */}
      <div className="dash-right">
        <div className="dashboard-sections">
          {/* ACTIVE TRIP SECTION */}
          <div className="dashboard-section active-trip-section">
            <h3 className="section-title">
              <span className="section-icon">🚗</span> Current Trip
            </h3>

            {activeTrip ? (
              <div className="active-trip-card" onClick={openTrip}>
                <div className="trip-status-indicator pulse">Active</div>
                <div className="trip-locations">
                  <div className="location-item">
                    <label>Pickup</label>
                    <p>{activeTrip.pickup}</p>
                  </div>
                  <div className="location-item">
                    <label>Drop</label>
                    <p>{activeTrip.drop}</p>
                  </div>
                </div>
                <div className="trip-footer">
                  <div className="trip-fare">₹{activeTrip.fare}</div>
                  <button className="premium-secondary-btn">View Details</button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p className="muted">No active trip currently</p>
              </div>
            )}
          </div>

          {/* AVAILABLE ORDERS SECTION */}
          <div className="dashboard-section orders-section">
            <h3 className="section-title">
              <span className="section-icon">📋</span> Available Orders
            </h3>

            {!isOnline ? (
              <div className="empty-state offline-msg">
                <span className="offline-icon">😴</span>
                <p>Go online to see ride requests</p>
              </div>
            ) : (
              <div className="orders-list">
                <div className="orders-filter-bar">
                  <div className="input-container filter-input">
                    <span className="input-icon">🔍</span>
                    <LocationAutocomplete
                      placeholder="Search orders by location..."
                      value={searchLocation}
                      onChange={setSearchLocation}
                      onSelect={(label) => setSearchLocation(label)}
                    />
                  </div>
                </div>

                {orders.length === 0 && !loading && (
                  <div className="empty-state">
                    <p className="muted">No new orders available right now</p>
                  </div>
                )}

                {orders
                  .filter(o => {
                    if (!searchLocation) return true;
                    const q = searchLocation.toLowerCase();
                    return o.pickup.toLowerCase().includes(q) || o.drop.toLowerCase().includes(q);
                  })
                  .map((o) => (
                    <div className="order-item-card" key={o._id}>
                      <div className="order-details">
                        <div className="order-locations">
                          <p className="order-pickup"><strong>From:</strong> {o.pickup}</p>
                          <p className="order-drop"><strong>To:</strong> {o.drop}</p>
                        </div>
                        <div className="order-meta">
                          <span className="order-fare">₹{o.fare}</span>
                          <span className="order-distance">• {o.distanceKm ?? "-"} km</span>
                        </div>
                      </div>
                      <button
                        className="premium-cta-btn accept-btn"
                        onClick={() => accept(o._id)}
                        disabled={loading}
                      >
                        Accept
                      </button>
                    </div>
                  ))}

                {loading && <div className="loading-overlay-inline">Updating...</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      <RideRequestModal
        isOpen={showRequest}
        request={currentRequest}
        onAccept={(id) => {
          setShowRequest(false);
          accept(id);
        }}
        onReject={() => {
          setShowRequest(false);
          // Optionally blacklist this request locally for a while
        }}
      />
    </div>
  );
}
