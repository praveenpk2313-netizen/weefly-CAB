import React from 'react';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose, notifications }) => {
    return (
        <div className={`notification-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`notification-panel ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h3>Notifications</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="notifications-list">
                    {notifications.length === 0 ? (
                        <div className="empty-notifications">
                            <span className="bell-icon">🔔</span>
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        notifications.map((notif, index) => (
                            <div key={index} className={`notification-item ${notif.unRead ? 'unread' : ''}`}>
                                <div className={`notif-icon ${notif.type}`}>
                                    {notif.type === 'booking' && '🚕'}
                                    {notif.type === 'arrival' && '📍'}
                                    {notif.type === 'completion' && '🏁'}
                                </div>
                                <div className="notif-content">
                                    <p className="notif-text">{notif.message}</p>
                                    <span className="notif-time">{notif.time}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPanel;
