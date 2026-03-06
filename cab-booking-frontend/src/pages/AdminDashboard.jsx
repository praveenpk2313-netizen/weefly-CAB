import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fareConfig] = useState({
    baseFare: 50, perKm: 15, perMin: 2, surge: 1.2, commission: 20
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsRes, tripsRes, driversRes] = await Promise.all([
          axios.get(`${API}/admin/stats`),
          axios.get(`${API}/admin/trips`),
          axios.get(`${API}/admin/drivers`),
        ]);
        setStats(statsRes.data);
        setTrips(tripsRes.data);
        setDrivers(driversRes.data);
      } catch (err) {
        console.error("Admin data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatCurrency = (num) =>
    `₹${Number(num || 0).toLocaleString('en-IN')}`;

  const getStatusColor = (status) => {
    const map = { started: 'live-dot', completed: 'done-dot', cancelled: 'cancel-dot' };
    return map[status] || '';
  };

  return (
    <div className="admin-page-wrapper">
      <Navbar />
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar glass-card">
          <nav>
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>📊 Overview</button>
            <button className={activeTab === 'drivers' ? 'active' : ''} onClick={() => setActiveTab('drivers')}>👨‍✈️ Drivers</button>
            <button className={activeTab === 'trips' ? 'active' : ''} onClick={() => setActiveTab('trips')}>🚗 Trips</button>
            <button className={activeTab === 'fare' ? 'active' : ''} onClick={() => setActiveTab('fare')}>⚙️ Settings</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main-content">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="admin-view animate-fade-in">
              <h2 className="view-title">System Overview</h2>
              {loading ? (
                <div className="muted">Loading stats...</div>
              ) : (
                <>
                  <div className="stats-grid-admin">
                    <div className="stat-box glass-card glow-blue">
                      <label>Total Revenue</label>
                      <p>{formatCurrency(stats?.totalRevenue)}</p>
                    </div>
                    <div className="stat-box glass-card">
                      <label>Total Rides</label>
                      <p>{stats?.totalRides ?? 0}</p>
                    </div>
                    <div className="stat-box glass-card">
                      <label>Completed Rides</label>
                      <p>{stats?.completedRides ?? 0}</p>
                    </div>
                    <div className="stat-box glass-card glow-yellow">
                      <label>Registered Drivers</label>
                      <p>{stats?.activeDrivers ?? 0}</p>
                    </div>
                  </div>

                  <div className="overview-sections">
                    <div className="glass-card recent-activity">
                      <h3>Recent Trips</h3>
                      <div className="monitoring-list">
                        {stats?.recentTrips?.length === 0 && <div className="muted">No trips yet</div>}
                        {stats?.recentTrips?.map(t => (
                          <div className="monitor-item" key={t._id}>
                            <span>📍 {t.pickup} → {t.status === 'started' || t.status === 'completed' ? t.drop : '??'}</span>
                            <span className={getStatusColor(t.status)}>{t.status === 'completed' ? '✅' : t.status === 'cancelled' ? '❌' : '🔴'} {t.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* DRIVERS */}
          {activeTab === 'drivers' && (
            <div className="admin-view animate-fade-in">
              <h2 className="view-title">Driver Management</h2>
              <div className="glass-card table-container">
                {loading ? <div className="muted">Loading...</div> : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.length === 0 && (
                        <tr><td colSpan="3" className="muted">No drivers registered yet</td></tr>
                      )}
                      {drivers.map(d => (
                        <tr key={d._id}>
                          <td>{d.phone}</td>
                          <td><span className="badge-status verified">{d.role}</span></td>
                          <td>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TRIPS */}
          {activeTab === 'trips' && (
            <div className="admin-view animate-fade-in">
              <h2 className="view-title">All Trips</h2>
              <div className="glass-card table-container">
                {loading ? <div className="muted">Loading...</div> : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Phone</th>
                        <th>Pickup</th>
                        <th>Cab</th>
                        <th>Distance</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.length === 0 && (
                        <tr><td colSpan="6" className="muted">No trips yet</td></tr>
                      )}
                      {trips.map(t => (
                        <tr key={t._id}>
                          <td>{t.phone}</td>
                          <td>{t.pickup}</td>
                          <td>{t.cabType}</td>
                          <td>{t.distanceKm || '-'} km</td>
                          <td><span className={`badge-status ${t.status}`}>{t.status}</span></td>
                          <td>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'fare' && (
            <div className="admin-view animate-fade-in">
              <h2 className="view-title">Fare & Revenue Configuration</h2>
              <div className="glass-card config-form">
                <div className="input-row-admin">
                  <div className="input-group">
                    <label>Base Fare (₹)</label>
                    <input type="number" className="premium-input-admin" defaultValue={fareConfig.baseFare} />
                  </div>
                  <div className="input-group">
                    <label>Per KM (₹)</label>
                    <input type="number" className="premium-input-admin" defaultValue={fareConfig.perKm} />
                  </div>
                </div>
                <div className="input-row-admin">
                  <div className="input-group">
                    <label>Per Minute (₹)</label>
                    <input type="number" className="premium-input-admin" defaultValue={fareConfig.perMin} />
                  </div>
                  <div className="input-group">
                    <label>Surge Multiplier (x)</label>
                    <input type="number" step="0.1" className="premium-input-admin" defaultValue={fareConfig.surge} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Platform Commission (%)</label>
                  <input type="number" className="premium-input-admin" defaultValue={fareConfig.commission} />
                </div>
                <button className="premium-cta-btn" onClick={() => alert("Configurations updated!")}>Save Changes</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;