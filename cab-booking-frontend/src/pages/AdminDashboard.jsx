import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from "../api";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [statsRes, tripsRes, driversRes, clientsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/trips"),
          api.get("/admin/drivers"),
          api.get("/admin/clients"),
        ]);
        setStats(statsRes.data);
        setTrips(tripsRes.data);
        setDrivers(driversRes.data);
        setClients(clientsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Generate chart data from trips
  const chartData = useMemo(() => {
    if (!trips.length) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }).reverse();

    const dataMap = trips.reduce((acc, trip) => {
      const date = new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (!acc[date]) acc[date] = 0;
      acc[date] += (trip.fare || 0);
      return acc;
    }, {});

    return last7Days.map(date => ({
      name: date,
      revenue: dataMap[date] || 0
    }));
  }, [trips]);

  const formatCurrency = (num) => `₹${Number(num || 0).toLocaleString('en-IN')}`;

  if (loading) return <div className="loading-screen">Loading Administration Panel...</div>;

  return (
    <div className="admin-dashboard-container">
      {/* Mobile Toggle Button */}
      <button className="mobile-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <a href="#" className="sidebar-logo">
          <span>🚕</span> Weefly Admin
        </a>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          >
            📊 Dashboard
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('drivers'); setSidebarOpen(false); }}
          >
            🚖 Driver List
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('customers'); setSidebarOpen(false); }}
          >
            👥 Customer List
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => { setActiveTab('revenue'); setSidebarOpen(false); }}
          >
            💰 Total Revenue
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }}
          >
            📄 Reports
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bookings'); setSidebarOpen(false); }}
          >
            📋 All Bookings
          </button>
          
          <button className="nav-item logout-item" onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* ── Main content area ── */}
      <main className="admin-main">
        <header className="main-header">
          <div className="header-title">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p>Welcome back, Administrator</p>
          </div>
          <div className="header-actions">
             <span className="notif-badge-new">🔔</span>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="animate-in">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue-icon">💰</div>
                <div className="stat-info">
                  <span>Total Revenue</span>
                  <h2>{formatCurrency(stats?.totalRevenue)}</h2>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green-icon">🏁</div>
                <div className="stat-info">
                  <span>Completed Rides</span>
                  <h2>{stats?.completedRides || 0}</h2>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple-icon">🚖</div>
                <div className="stat-info">
                  <span>Active Cabs</span>
                  <h2>{drivers.filter(d => d.isOnline).length}</h2>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange-icon">🔖</div>
                <div className="stat-info">
                  <span>New Bookings</span>
                  <h2>{stats?.pendingBookings || 0}</h2>
                </div>
              </div>
            </div>

            {/* Dashboard Visuals */}
            <div className="dashboard-grid">
              <div className="view-card">
                <div className="card-header">
                  <h3>Revenue Trend (Last 7 Days)</h3>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        cursor={{stroke: '#6366f1', strokeWidth: 2}}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="view-card">
                <div className="card-header">
                  <h3>Recent Bookings</h3>
                  <button className="text-btn" onClick={() => setActiveTab('bookings')}>View All</button>
                </div>
                <div className="table-responsive">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Fare</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentTrips?.slice(0, 5).map(t => (
                        <tr key={t._id}>
                          <td className="semi-bold">{t._id.slice(-6).toUpperCase()}</td>
                          <td>{t.phone}</td>
                          <td className="bold">{formatCurrency(t.fare)}</td>
                          <td>
                            <span className={`status-badge status-${t.status}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="view-card animate-in">
             <div className="card-header">
               <h3>Active & Offline Drivers</h3>
             </div>
             <div className="table-responsive">
               <table className="dashboard-table">
                 <thead>
                   <tr>
                     <th>Name</th>
                     <th>Mobile</th>
                     <th>Status</th>
                     <th>Wallet</th>
                   </tr>
                 </thead>
                 <tbody>
                   {drivers.map(d => (
                     <tr key={d._id}>
                       <td><strong>{d.name}</strong></td>
                       <td>{d.phone}</td>
                       <td>
                         <span className={`status-badge ${d.isOnline ? 'status-online' : 'status-offline'}`}>
                           {d.isOnline ? 'Logged In / Online' : 'Logged Out / Offline'}
                         </span>
                       </td>
                       <td>{formatCurrency(d.wallet)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="view-card animate-in">
             <div className="card-header">
               <h3>Registered Customers</h3>
             </div>
             <div className="table-responsive">
               <table className="dashboard-table">
                 <thead>
                   <tr>
                     <th>Name</th>
                     <th>Phone</th>
                     <th>Registration Date</th>
                   </tr>
                 </thead>
                 <tbody>
                   {clients.map(c => (
                     <tr key={c._id}>
                       <td><strong>{c.name}</strong></td>
                       <td>{c.phone}</td>
                       <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="animate-in">
            <div className="view-card">
              <div className="card-header">
                <h3>Detailed Revenue Analysis</h3>
              </div>
              <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={{r: 4, fill: '#22c55e'}} />
                    </LineChart>
                  </ResponsiveContainer>
              </div>
              <div className="stats-grid" style={{marginTop: '2rem'}}>
                 <div className="stat-card">
                    <div className="stat-info">
                      <span>Total Life-time Revenue</span>
                      <h2>{formatCurrency(stats?.totalRevenue)}</h2>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="view-card animate-in">
             <div className="card-header">
               <h3>All Bookings</h3>
             </div>
             <div className="table-responsive">
               <table className="dashboard-table">
                 <thead>
                   <tr>
                     <th>Date & Time</th>
                     <th>Trip ID</th>
                     <th>Client Phone</th>
                     <th>Pickup</th>
                     <th>Dropoff</th>
                     <th>Fare</th>
                     <th>Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {[...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(t => (
                     <tr key={t._id}>
                       <td>
                         {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </td>
                       <td className="semi-bold">{t._id.slice(-6).toUpperCase()}</td>
                       <td>{t.phone}</td>
                       <td>{t.pickup || 'N/A'}</td>
                       <td>{t.drop || 'N/A'}</td>
                       <td className="bold">{formatCurrency(t.fare)}</td>
                       <td>
                         <span className={`status-badge status-${t.status}`}>
                           {t.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="view-card animate-in">
             <div className="card-header">
               <h3>Trip & Settlement Reports</h3>
             </div>
             <div className="table-responsive">
               <table className="dashboard-table">
                 <thead>
                   <tr>
                     <th>Date</th>
                     <th>Trip ID</th>
                     <th>Amount</th>
                     <th>Commission</th>
                     <th>Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {trips.slice(0, 15).map(t => (
                     <tr key={t._id}>
                       <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                       <td>{t._id.toUpperCase()}</td>
                       <td>{formatCurrency(t.fare)}</td>
                       <td>{formatCurrency((t.fare || 0) * 0.2)}</td>
                       <td><span className={`status-badge status-${t.status}`}>{t.status}</span></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;