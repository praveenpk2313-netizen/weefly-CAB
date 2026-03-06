import React, { useState } from 'react';
import './RatingModal.css';

const RatingModal = ({ isOpen, onClose, driverName, onRatingSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="glass-card rating-modal">
                <div className="modal-header">
                    <h3>How was your ride?</h3>
                    <p>Rate your experience with <strong>{driverName}</strong></p>
                </div>

                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <textarea
                    className="rating-comment"
                    placeholder="Add a comment (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div className="modal-actions">
                    <button className="premium-secondary-btn" onClick={onClose}>Skip</button>
                    <button
                        className="premium-cta-btn submit-btn"
                        disabled={rating === 0}
                        onClick={() => onRatingSubmit({ rating, comment })}
                    >
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
