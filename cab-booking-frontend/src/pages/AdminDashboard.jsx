import React, { useState, useEffect } from 'react';
import { api } from "../api";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

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
          api.get("/admin/stats"),
          api.get("/admin/trips"),
          api.get("/admin/drivers"),
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
      <Navbar />
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar glass-card">
          <div className="sidebar-brand">
            <span className="brand-icon">🚕</span>
            <span>CBS - PHP</span>
          </div>
          <nav>
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>📊 Dashboard</button>
            <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>📁 Manage Category</button>
            <button className={activeTab === 'drivers' ? 'active' : ''} onClick={() => setActiveTab('drivers')}>🚖 Cab Management</button>
            <button className={activeTab === 'trips' ? 'active' : ''} onClick={() => setActiveTab('trips')}>📄 View Bookings</button>
            <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>👥 Registered Clients</button>
            <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👨‍💻 System Users</button>
            <button className={activeTab === 'fare' ? 'active' : ''} onClick={() => setActiveTab('fare')}>⚙️ Settings</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main-content">
          <div className="content-header-admin">
             <h1 className="main-title-admin">Cab Booking System</h1>
          </div>

          {/* OVERVIEW / DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="admin-view animate-fade-in">
              {loading ? (
                <div className="muted middle-loader">Loading system metrics...</div>
              ) : (
                <>
                  <div className="stats-grid-admin8">
                    {/* Row 1 */}
                    <div className="stat-card-mini card-purple">
                      <div className="card-mini-icon">📁</div>
                      <div className="card-mini-info">
                        <h3>Categories</h3>
                        <p>5</p>
                      </div>
                    </div>
                    <div className="stat-card-mini card-yellow">
                      <div className="card-mini-icon">🚕</div>
                      <div className="card-mini-info">
                        <h3>Available Cabs</h3>
                        <p>{stats?.availableCabs || 0}</p>
                      </div>
                    </div>
                    <div className="stat-card-mini card-blue">
                      <div className="card-mini-icon">👥</div>
                      <div className="card-mini-info">
                        <h3>Registered Clients</h3>
                        <p>{stats?.totalClients || 0}</p>
                      </div>
                    </div>
                    <div className="stat-card-mini card-cyan">
                      <div className="card-mini-icon">🔖</div>
                      <div className="card-mini-info">
                        <h3>Bookings Made</h3>
                        <p>{stats?.totalRides || 0}</p>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="stat-card-mini card-grey">
                      <div className="card-mini-icon">⌛</div>
                      <div className="card-mini-info">
                        <h3>Pending Bookings</h3>
                        <p>{stats?.pendingBookings || 0}</p>
                      </div>
                    </div>
                    <div className="stat-card-mini card-red">
                      <div className="card-mini-icon">❌</div>
                      <div className="card-mini-info">
                        <h3>Cancelled Bookings</h3>
                        <p>{stats?.cancelledBookings || 0}</p>
                      </div>
                    </div>
                    <div className="stat-card-mini card-dark-blue">
                      <div className="card-mini-icon">🛣️</div>
                      <div className="card-mini-info">
                        <h3>Ongoing Trips</h3>
                        <p>{stats?.ongoingTrips || 0}</p>
                      </div>
                    </div>
                    <div className="stat-card-mini card-green">
                      <div className="card-mini-icon">✅</div>
                      <div className="card-mini-info">
                        <h3>Trips Completed</h3>
                        <p>{stats?.completedRides || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card-mini card-pink system-users-card">
                      <div className="card-mini-icon">👨‍💻</div>
                      <div className="card-mini-info">
                        <h3>System Users</h3>
                        <p>{stats?.systemUsers || 0}</p>
                      </div>
                  </div>

                  <div className="booking-list-section">
                    <div className="section-header-row">
                      <h3>Booking List</h3>
                    </div>
                    <div className="glass-card table-container">
                      <table className="admin-table modern-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Date Booked</th>
                            <th>Ref. Code</th>
                            <th>Cab</th>
                            <th>Client</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.recentTrips?.length === 0 && (
                            <tr><td colSpan="7" className="muted">No recent bookings</td></tr>
                          )}
                          {stats?.recentTrips?.map((t, idx) => (
                            <tr key={t._id}>
                              <td>{idx + 1}</td>
                              <td>{new Date(t.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                              <td>{t._id.slice(-8).toUpperCase()}</td>
                              <td>{t.cabType}</td>
                              <td>{t.phone}</td>
                              <td>
                                <span className={`badge-pill status-${t.status}`}>
                                  {t.status}
                                </span>
                              </td>
                              <td>
                                <button className="action-btn-view" onClick={() => alert(`Viewing ID: ${t._id}`)}>
                                  <span className="eye-icon">👁️</span> View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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