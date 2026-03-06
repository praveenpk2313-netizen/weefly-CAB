import React, { useState, useEffect } from 'react';
import './RideRequestModal.css';

const RideRequestModal = ({ isOpen, request, onAccept, onReject }) => {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(30);
            return;
        }

        if (timeLeft === 0) {
            onReject();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, timeLeft, onReject]);

    if (!isOpen || !request) return null;

    return (
        <div className="modal-overlay">
            <div className="glass-card request-modal animate-pop-in">
                <div className="timer-ring">
                    <svg viewBox="0 0 36 36">
                        <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="ring-progress"
                            strokeDasharray={`${(timeLeft / 30) * 100}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="timer-text">{timeLeft}s</text>
                    </svg>
                </div>

                <div className="request-header">
                    <h2 className="modal-title">New Ride Request!</h2>
                    <div className="customer-info">
                        <span className="customer-avatar">👤</span>
                        <div>
                            <p className="customer-name">{request.customerName || "Premium User"}</p>
                            <div className="customer-rating">⭐ 4.9 (2k+ rides)</div>
                        </div>
                    </div>
                </div>

                <div className="request-details">
                    <div className="loc-row">
                        <span className="loc-dot pickup"></span>
                        <div className="loc-info">
                            <label>Pickup Location</label>
                            <p>{request.pickup}</p>
                        </div>
                    </div>
                    <div className="loc-row">
                        <span className="loc-dot drop"></span>
                        <div className="loc-info">
                            <label>Drop Location</label>
                            <p>{request.drop}</p>
                        </div>
                    </div>
                </div>

                <div className="request-footer">
                    <div className="fare-estimate">
                        <label>Est. Earning</label>
                        <p>₹{request.fare}</p>
                    </div>
                    <div className="dist-estimate">
                        <label>Distance</label>
                        <p>{request.distanceKm} km</p>
                    </div>
                </div>

                <div className="modal-actions-grid">
                    <button className="reject-btn" onClick={onReject}>Decline</button>
                    <button className="accept-btn" onClick={() => onAccept(request._id)}>Accept Ride</button>
                </div>
            </div>
        </div>
    );
};

export default RideRequestModal;
