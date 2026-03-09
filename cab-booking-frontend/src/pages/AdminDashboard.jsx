import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from "../api";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // For Modal
  const navigate = useNavigate();

  const [categories] = useState([
    { id: 1, name: "Bike", seats: 1, base: 40, perKm: 6 },
    { id: 2, name: "Auto", seats: 3, base: 40, perKm: 10 },
    { id: 3, name: "Mini", seats: 4, base: 40, perKm: 12 },
    { id: 4, name: "Sedan", seats: 4, base: 40, perKm: 15 },
    { id: 5, name: "SUV", seats: 6, base: 40, perKm: 18 },
  ]);

  const [fareConfig] = useState({
    baseFare: 40, surge: 1.0, commission: 20
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsRes, tripsRes, driversRes, clientsRes, adminsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/trips"),
          api.get("/admin/drivers"),
          api.get("/admin/clients"),
          api.get("/admin/users"),
        ]);
        setStats(statsRes.data);
        setTrips(tripsRes.data);
        setDrivers(driversRes.data);
        setClients(clientsRes.data);
        setAdmins(adminsRes.data);
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

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  return (
    <div className="admin-page-wrapper">
      <Navbar />
      <div className={`admin-layout ${sidebarVisible ? 'sidebar-open' : ''}`}>
        {/* Mobile Toggle */}
        <button className="mobile-sidebar-toggle" onClick={toggleSidebar}>
          {sidebarVisible ? '✕' : '☰'}
        </button>

        {/* Sidebar */}
        <aside className={`admin-sidebar glass-card ${sidebarVisible ? 'visible' : ''}`}>
          <div className="sidebar-branding">
            <span className="sidebar-logo-icon">🚕</span>
            <span className="sidebar-logo-text">Weefly Admin</span>
          </div>
          <nav>
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setSidebarVisible(false); }}>📊 Dashboard</button>
            <button className={activeTab === 'recent' ? 'active' : ''} onClick={() => { setActiveTab('recent'); setSidebarVisible(false); }}>🕒 Recent Bookings</button>
            <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => { setActiveTab('categories'); setSidebarVisible(false); }}>📁 Manage Category</button>
            <button className={activeTab === 'drivers' ? 'active' : ''} onClick={() => { setActiveTab('drivers'); setSidebarVisible(false); }}>🚖 Cab Management</button>
            <button className={activeTab === 'trips' ? 'active' : ''} onClick={() => { setActiveTab('trips'); setSidebarVisible(false); }}>📄 View Bookings</button>
            <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => { setActiveTab('clients'); setSidebarVisible(false); }}>👥 Registered Clients</button>
            <button className={activeTab === 'users' ? 'active' : ''} onClick={() => { setActiveTab('users'); setSidebarVisible(false); }}>👨‍💻 System Users</button>
            <button className={activeTab === 'fare' ? 'active' : ''} onClick={() => { setActiveTab('fare'); setSidebarVisible(false); }}>⚙️ Settings</button>
          </nav>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarVisible && <div className="sidebar-backdrop" onClick={() => setSidebarVisible(false)}></div>}

        {/* Main Content */}
        <main className="admin-main-content">
          <div className="content-header-admin">
             <h1 className="main-title-admin">Weefly Cab Booking</h1>
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
                    <div className="stat-card-mini card-gold">
                      <div className="card-mini-icon">💰</div>
                      <div className="card-mini-info">
                        <h3>Total Revenue</h3>
                        <p>{formatCurrency(stats?.totalRevenue || 0)}</p>
                      </div>
                    </div>
                    <div className="stat-card-mini card-pink">
                        <div className="card-mini-icon">👨‍💻</div>
                        <div className="card-mini-info">
                          <h3>System Users</h3>
                          <p>{stats?.systemUsers || 0}</p>
                        </div>
                    </div>

                    {/* Recent Bookings Slot/Trigger */}
                    <div className="stat-card-mini card-indigo clickable-card" onClick={() => setActiveTab('recent')}>
                      <div className="card-mini-icon">🕒</div>
                      <div className="card-mini-info">
                         <h3>Recent Bookings</h3>
                         <p>View Activity</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* RECENT BOOKINGS TAB */}
          {activeTab === 'recent' && (
            <div className="admin-view animate-fade-in">
              <div className="section-header-row">
                <h2 className="view-inner-title">🕒 Recent Activity History</h2>
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
                      <tr><td colSpan="7" className="muted">No recent bookings recorded</td></tr>
                    )}
                    {stats?.recentTrips?.map((t, idx) => (
                      <tr key={t._id}>
                        <td>{idx + 1}</td>
                        <td>{new Date(t.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>{t._id.slice(-8).toUpperCase()}</td>
                        <td>{t.cabType}</td>
                        <td>{t.phone}</td>
                        <td><span className={`badge-pill status-${t.status}`} style={{fontSize: '11px'}}>{t.status}</span></td>
                        <td>
                          <button className="action-btn-view" onClick={() => setSelectedItem({ type: 'booking', data: t })}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MANAGE CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="admin-view animate-fade-in">
              <div className="view-header-row">
                <h2 className="view-inner-title">Vehicle Management</h2>
                 <button className="add-btn-premium" onClick={() => alert("Vehicle category management is currently in read-only mode.")}>+ Add New Category</button>
              </div>
              <div className="glass-card table-container">
                 <table className="admin-table modern-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Category Name</th>
                        <th>Seats</th>
                        <th>Base Fare</th>
                        <th>Per KM Rate</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat, idx) => (
                        <tr key={cat.id}>
                          <td>{idx + 1}</td>
                          <td><strong>{cat.name}</strong></td>
                          <td>{cat.seats} Seats</td>
                          <td>₹{cat.base}</td>
                          <td>₹{cat.perKm}/km</td>
                           <td>
                             <button className="edit-btn" onClick={() => alert("Edit feature coming soon!")}>Edit</button>
                             <button className="delete-btn" onClick={() => alert("Delete feature coming soon!")}>Delete</button>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* CAB MANAGEMENT (DRIVERS) */}
          {activeTab === 'drivers' && (
            <div className="admin-view animate-fade-in">
              <h2 className="view-inner-title">Cab & Driver Management</h2>
              <div className="glass-card table-container">
                 <table className="admin-table modern-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Driver Name</th>
                        <th>Mobile Number</th>
                        <th>Cab Type</th>
                        <th>Wallet</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.length === 0 && <tr><td colSpan="7" className="muted">No drivers registered</td></tr>}
                      {drivers.map((d, idx) => (
                        <tr key={d._id}>
                          <td>{idx + 1}</td>
                          <td>{d.name}</td>
                          <td>{d.phone}</td>
                          <td>Sedan</td>
                          <td>₹{d.wallet || 0}</td>
                          <td><span className={`badge-pill ${d.isOnline ? 'status-completed' : 'status-cancelled'}`}>{d.isOnline ? 'Online' : 'Offline'}</span></td>
                          <td>
                             <button className="action-btn-view" onClick={() => setSelectedItem({ type: 'driver', data: d })}>Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* VIEW BOOKINGS */}
          {activeTab === 'trips' && (
            <div className="admin-view animate-fade-in">
              <h2 className="view-inner-title">All Trip Bookings</h2>
              <div className="glass-card table-container">
                 <table className="admin-table modern-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Pickup → Drop</th>
                        <th>Fare</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.length === 0 && <tr><td colSpan="7" className="muted">No trips recorded</td></tr>}
                      {trips.map((t, idx) => (
                        <tr key={t._id}>
                          <td>{idx + 1}</td>
                          <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td>{t.phone}</td>
                          <td>{t.pickup} → {t.drop}</td>
                          <td>₹{t.fare || 0}</td>
                          <td><span className={`badge-pill status-${t.status}`}>{t.status}</span></td>
                          <td><button className="action-btn-view" onClick={() => setSelectedItem({ type: 'booking', data: t })}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* REGISTERED CLIENTS */}
          {activeTab === 'clients' && (
            <div className="admin-view animate-fade-in">
              <h2 className="view-inner-title">Customer Directory</h2>
              <div className="glass-card table-container">
                 <table className="admin-table modern-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joined Date</th>
                        <th>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.length === 0 && <tr><td colSpan="6" className="muted">No clients registered</td></tr>}
                      {clients.map((c, idx) => (
                        <tr key={c._id}>
                          <td>{idx + 1}</td>
                          <td>{c.name}</td>
                          <td>{c.email}</td>
                          <td>{c.phone}</td>
                           <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                           <td><button className="action-btn-view" onClick={() => setSelectedItem({ type: 'client', data: c })}>History</button></td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* SYSTEM USERS (ADMINS) */}
          {activeTab === 'users' && (
            <div className="admin-view animate-fade-in">
              <div className="view-header-row">
                <h2 className="view-inner-title">Administrator List</h2>
                <button className="add-btn-premium" onClick={() => navigate("/admin/register")}>+ New Admin</button>
              </div>
              <div className="glass-card table-container">
                 <table className="admin-table modern-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((a, idx) => (
                        <tr key={a._id}>
                          <td>{idx + 1}</td>
                          <td>{a.username}</td>
                          <td>{a.role || 'Super Admin'}</td>
                          <td><span className="badge-pill status-completed">Active</span></td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'fare' && (
            <div className="admin-view animate-fade-in">
              <h2 className="view-inner-title">System Configuration</h2>
              <div className="glass-card config-form">
                <div className="input-row-admin">
                  <div className="input-group">
                    <label>Default Base Fare (₹)</label>
                    <input type="number" className="premium-input-admin" defaultValue={fareConfig.baseFare} />
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
                <div className="settings-notice">
                   Note: Specific rates per vehicle category can be managed in the "Manage Category" section.
                </div>
                <button className="premium-cta-btn" onClick={() => alert("Configurations updated!")}>Save Changes</button>
              </div>
             </div>
          )}
 
        </main>
      </div>
 
      {/* Modal for Details */}
      {selectedItem && (
        <div className="admin-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className={`admin-modal-content glass-card animate-fade-in ${selectedItem.type === 'client' ? 'wide' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.type.toUpperCase()} DETAILS</h3>
              <button className="close-modal" onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              {selectedItem.type === 'booking' && (
                <div className="detail-grid-view">
                  <div className="detail-row"><label>Referrence Code</label><span>{selectedItem.data._id.toUpperCase()}</span></div>
                  <div className="detail-row"><label>Booking Date</label><span>{new Date(selectedItem.data.createdAt).toLocaleString()}</span></div>
                  <div className="detail-row"><label>Pickup From</label><span>{selectedItem.data.pickup}</span></div>
                  <div className="detail-row"><label>Drop To</label><span>{selectedItem.data.drop}</span></div>
                  <div className="detail-row"><label>Vehicle Category</label><span>{selectedItem.data.cabType}</span></div>
                  <div className="detail-row"><label>Estimated Fare</label><span>₹{selectedItem.data.fare}</span></div>
                  <div className="detail-row">
                    <label>Trip Status</label>
                    <span className={`badge-pill status-${selectedItem.data.status}`}>{selectedItem.data.status}</span>
                  </div>
                  <div className="detail-row"><label>Driver Details</label><span>{selectedItem.data.driverName || 'Not Assigned'}</span></div>
                  <div className="detail-row full-span"><label>Additional Info</label><span>{selectedItem.data.vehicleInfo || 'N/A'}</span></div>
                </div>
              )}

              {selectedItem.type === 'driver' && (
                <div className="detail-grid-view">
                  <div className="detail-row"><label>Full Name</label><span>{selectedItem.data.name}</span></div>
                  <div className="detail-row"><label>Mobile Number</label><span>{selectedItem.data.phone}</span></div>
                  <div className="detail-row"><label>Wallet Balance</label><span>₹{selectedItem.data.wallet || 0}</span></div>
                  <div className="detail-row">
                    <label>Current Status</label>
                    <span className={`badge-pill ${selectedItem.data.isOnline ? 'status-completed' : 'status-cancelled'}`}>
                      {selectedItem.data.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              )}

              {selectedItem.type === 'client' && (
                <div className="detail-grid-view">
                  <div className="detail-row"><label>Customer Name</label><span>{selectedItem.data.name}</span></div>
                  <div className="detail-row"><label>Email Address</label><span>{selectedItem.data.email || 'N/A'}</span></div>
                  <div className="detail-row"><label>Phone Number</label><span>{selectedItem.data.phone}</span></div>
                  <div className="detail-row"><label>Joined Date</label><span>{new Date(selectedItem.data.createdAt).toLocaleDateString()}</span></div>
                  
                  <div className="modal-history-section full-span">
                    <h4 className="modal-sub-title">Recent Activity History</h4>
                    <div className="glass-card table-container">
                      <table className="mini-table-premium">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Pickup → Drop</th>
                            <th>Fare</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trips.filter(t => t.phone === selectedItem.data.phone).length === 0 ? (
                            <tr><td colSpan="4" className="muted center">No previous activity found</td></tr>
                          ) : (
                            trips.filter(t => t.phone === selectedItem.data.phone).slice(0, 8).map(t => (
                              <tr key={t._id}>
                                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                                <td>{t.pickup} → {t.drop}</td>
                                <td>₹{t.fare}</td>
                                <td><span className={`badge-pill status-${t.status}`} style={{fontSize: '10px', padding: '4px 8px'}}>{t.status}</span></td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;