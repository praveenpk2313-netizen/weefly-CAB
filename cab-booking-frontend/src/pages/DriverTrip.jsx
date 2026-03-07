import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import "./Driver.css";

export default function DriverTrip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ✅ OTP inline
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // "cash" or "qr"

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/booking/${id}`);
      setTrip(res.data);
    } catch (err) {
      console.log("Trip fetch error:", err);
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    await api.post("/booking/update-status", {
      bookingId: id,
      status,
    });
  };

  const onArrived = async () => {
    try {
      setUpdating(true);
      await updateStatus("arrived");
      await fetchTrip();
      setOtp("");
      setOtpErr("");
      setShowOtp(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Arrived failed");
    } finally {
      setUpdating(false);
    }
  };

  const verifyOtpAndStart = async () => {
    try {
      setOtpErr("");
      if (!otp || otp.trim().length < 4) {
        setOtpErr("Enter valid OTP");
        return;
      }

      setUpdating(true);
      const res = await api.post("/booking/verify-start-otp", {
        bookingId: id,
        otp: otp.trim(),
      });

      if (!res.data?.success) {
        setOtpErr(res.data?.message || "Invalid OTP");
        return;
      }

      await updateStatus("started");
      setShowOtp(false);
      setOtp("");
      await fetchTrip();
    } catch (err) {
      setOtpErr(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setUpdating(false);
    }
  };

  const onCancel = async () => {
    try {
      setUpdating(true);
      await updateStatus("cancelled");
      await fetchTrip();
      navigate("/driver");
    } catch (err) {
      alert(err?.response?.data?.message || "Cancel failed");
    } finally {
      setUpdating(false);
    }
  };

  const onCompleteTrip = () => {
    setShowPayment(true);
  };

  const onConfirmPayment = async () => {
    try {
      if (!paymentMethod) return alert("Please select a payment method");
      
      setUpdating(true);
      const userStr = localStorage.getItem("user");
      const userData = userStr ? JSON.parse(userStr) : null;
      const driverId = userData?.id || userData?._id || "DRIVER-001";

      await api.post("/booking/complete-and-pay", {
        bookingId: id,
        driverId
      });
      
      alert("Trip completed and fare added to wallet!");
      navigate("/driver");
    } catch (err) {
      alert(err?.response?.data?.message || "Payment confirmation failed");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="driver-page-wrapper">
        <Navbar />
        <div className="trip-container">
          <div className="glass-card">
            <div className="muted">Loading trip details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip?._id) {
    return (
      <div className="driver-page-wrapper">
        <Navbar />
        <div className="trip-container">
          <div className="glass-card">
            <h2 className="login-title">Trip Not Found</h2>
          </div>
        </div>
      </div>
    );
  }

  const status = (trip.status || "pending").toLowerCase();
  const showArrivedBtns = status === "accepted";
  const showEndTripBtn = status === "started";
  const shouldShowOtpSection = showOtp || status === "arrived";

  return (
    <div className="driver-page-wrapper">
      <Navbar />
      <div className="trip-container">
        <div className="glass-card trip-details-card">
          <div className="card-header">
            <div className={`status-badge-premium status-${status}`}>{status}</div>
            <h1 className="login-title">Trip Details</h1>
          </div>

          <div className="trip-info-grid">
            <div className="info-item">
              <div className="label-with-action">
                <label>Pickup Location</label>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.pickup)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-link-btn"
                >
                  📍 Navigate
                </a>
              </div>
              <div className="info-value">{trip.pickup}</div>
            </div>
            {(status === "started" || status === "completed") && (
              <div className="info-item">
                <div className="label-with-action">
                  <label>Drop Location</label>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.drop)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="nav-link-btn"
                  >
                    📍 Navigate
                  </a>
                </div>
                <div className="info-value">{trip.drop}</div>
              </div>
            )}
            <div className="info-row">
              <div className="info-item">
                <label>Distance</label>
                <div className="info-value">{trip.distanceKm || "-"} km</div>
              </div>
            </div>
          </div>

          {shouldShowOtpSection && status !== "started" && status !== "completed" && (
            <div className="otp-verification-section">
              <p className="section-hint">Enter customer OTP to start the ride</p>
              <input
                className="premium-input otp-inline-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="4-digit OTP"
                maxLength={4}
              />
              {otpErr && <div className="error-text">{otpErr}</div>}

              <div className="action-row">
                <button className="premium-cta-btn" onClick={verifyOtpAndStart} disabled={updating}>
                  Verify & Start
                </button>
              </div>
            </div>
          )}

          <div className="trip-actions-stack">
            {showArrivedBtns && (
              <div className="action-row">
                <button className="premium-cta-btn warning-btn" onClick={onArrived} disabled={updating}>
                  Mark Arrived
                </button>
                <button className="premium-cta-btn danger-btn" onClick={onCancel} disabled={updating}>
                  Cancel Trip
                </button>
              </div>
            )}

            {showEndTripBtn && !showPayment && (
              <button className="premium-cta-btn success-btn" onClick={onCompleteTrip} disabled={updating}>
                Complete Trip
              </button>
            )}

            {showPayment && status !== "completed" && (
              <div className="payment-selection-section">
                <h3 className="section-hint">Select Payment Method</h3>
                <div className="payment-options">
                  <button 
                    className={`payment-opt-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    💵 Cash
                  </button>
                  <button 
                    className={`payment-opt-btn ${paymentMethod === 'qr' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('qr')}
                  >
                    🤳 QR Code
                  </button>
                </div>

                {paymentMethod === 'qr' && (
                  <div className="qr-code-display">
                    <img src="/sample_qr_code.png" alt="Payment QR Code" className="qr-image" />
                    <p className="qr-hint">Customer can scan this to pay</p>
                  </div>
                )}

                <button 
                  className="premium-cta-btn confirm-payment-btn" 
                  onClick={onConfirmPayment} 
                  disabled={updating || !paymentMethod}
                >
                  Confirm Payment & Finish
                </button>
              </div>
            )}

            {status === "completed" && (
              <div className="completion-message">Excellent! Trip Completed ✅</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
