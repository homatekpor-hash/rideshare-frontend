import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BroadcastPanel from '../components/BroadcastPanel';
const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [revenue, setRevenue] = useState({ totalRevenue: 0, totalRides: 0, totalPassengers: 0, data: [] });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userRole') !== 'admin') { navigate('/login'); return; }
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [usersRes, ridesRes, bookingsRes, docsRes, complaintsRes, revenueRes] = await Promise.all([
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/rides`),
        axios.get(`${API}/admin/bookings`),
        axios.get(`${API}/admin/documents`),
        axios.get(`${API}/complaints`),
        axios.get(`${API}/admin/revenue`),
      ]);
      setUsers(usersRes.data.users);
      setRides(ridesRes.data.rides);
      setBookings(bookingsRes.data.bookings);
      setDocuments(docsRes.data.documents);
      setComplaints(complaintsRes.data.complaints);
      setRevenue(revenueRes.data);
    } catch (e) { console.error(e); }
  };

  const handleVerify = async (driverId) => {
    await axios.put(`${API}/admin/documents/${driverId}/verify`);
    setMessage('✅ Driver verified!');
    setSelectedDoc(null);
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReject = async (driverId) => {
    await axios.put(`${API}/admin/documents/${driverId}/reject`, { reason: rejectReason });
    setMessage('❌ Documents rejected.');
    setSelectedDoc(null);
    setRejectReason('');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleResolveComplaint = async (complaintId) => {
    await axios.put(`${API}/complaints/${complaintId}`, { status: 'resolved' });
    setMessage('✅ Complaint resolved!');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const drivers = users.filter(u => u.role === 'driver');
  const riders = users.filter(u => u.role === 'rider');
  const activeRides = rides.filter(r => r.status === 'active');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const pendingDocs = documents.filter(d => !d.verified && d.face_photo);
  const openComplaints = complaints.filter(c => c.status === 'open');

  // Chart data
  const bookingsByStatus = [
    { label: 'Pending', count: bookings.filter(b => b.status === 'pending').length, color: '#f9a825' },
    { label: 'Accepted', count: bookings.filter(b => b.status === 'accepted').length, color: '#1a73e8' },
    { label: 'Completed', count: bookings.filter(b => b.status === 'completed').length, color: '#34a853' },
    { label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length, color: '#ea4335' },
  ];

  const maxBooking = Math.max(...bookingsByStatus.map(b => b.count), 1);

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'broadcast', icon: '📢', label: 'Broadcast' },
    { id: 'rides', icon: '🚗', label: 'Rides' },
    { id: 'bookings', icon: '🎫', label: 'Bookings' },
    { id: 'documents', icon: '📄', label: 'Verify' },
    { id: 'complaints', icon: '🆘', label: 'Complaints' },
    { id: 'revenue', icon: '💰', label: 'Revenue' },
  ];

  return (
    <div style={styles.app}>
      {message && <div style={styles.toast}>{message}</div>}

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <img src="/logo.png" alt="Ryde" style={styles.sidebarLogo} />
          <p style={styles.sidebarTitle}>Ryde Admin</p>
        </div>
        {tabs.map(tab => (
          <button key={tab.id} style={{...styles.sidebarBtn, backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.15)' : 'transparent'}} onClick={() => setActiveTab(tab.id)}>
            <span style={styles.sidebarIcon}>{tab.icon}</span>
            <span style={styles.sidebarLabel}>{tab.label}</span>
            {tab.id === 'documents' && pendingDocs.length > 0 && <span style={styles.sidebarBadge}>{pendingDocs.length}</span>}
            {tab.id === 'complaints' && openComplaints.length > 0 && <span style={styles.sidebarBadge}>{openComplaints.length}</span>}
          </button>
        ))}{activeTab === 'broadcast' && (
  <div style={styles.content}>
    <h1 style={styles.pageTitle}>📢 Broadcast Message</h1>
    <BroadcastPanel />
  </div>
)}
        <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>📊 Dashboard</h1>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              {[
                { icon: '👤', label: 'Total Users', value: users.length, color: '#1a73e8' },
                { icon: '🚗', label: 'Drivers', value: drivers.length, color: '#34a853' },
                { icon: '🧑', label: 'Riders', value: riders.length, color: '#f9a825' },
                { icon: '🛣️', label: 'Active Rides', value: activeRides.length, color: '#ea4335' },
                { icon: '✅', label: 'Completed Trips', value: completedBookings.length, color: '#34a853' },
                { icon: '💰', label: 'Total Revenue', value: `GH₵ ${revenue.totalRevenue?.toFixed(2) || '0.00'}`, color: '#1a73e8' },
                { icon: '📄', label: 'Pending Docs', value: pendingDocs.length, color: '#f9a825' },
                { icon: '🆘', label: 'Open Complaints', value: openComplaints.length, color: '#ea4335' },
              ].map((stat, i) => (
                <div key={i} style={styles.statCard}>
                  <div style={{...styles.statIconBox, backgroundColor: stat.color + '20'}}>
                    <span style={styles.statIcon}>{stat.icon}</span>
                  </div>
                  <div>
                    <p style={styles.statValue}>{stat.value}</p>
                    <p style={styles.statLabel}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bookings Chart */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>📊 Bookings by Status</h2>
              <div style={styles.barChart}>
                {bookingsByStatus.map((b, i) => (
                  <div key={i} style={styles.barGroup}>
                    <p style={styles.barValue}>{b.count}</p>
                    <div style={styles.barWrapper}>
                      <div style={{...styles.bar, height: `${(b.count / maxBooking) * 120}px`, backgroundColor: b.color}} />
                    </div>
                    <p style={styles.barLabel}>{b.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>💰 Revenue Overview</h2>
              <div style={styles.revenueStats}>
                <div style={styles.revStat}>
                  <p style={styles.revNum}>GH₵ {revenue.totalRevenue?.toFixed(2) || '0.00'}</p>
                  <p style={styles.revLbl}>Total Commission</p>
                </div>
                <div style={styles.revDivider} />
                <div style={styles.revStat}>
                  <p style={styles.revNum}>{revenue.totalRides || 0}</p>
                  <p style={styles.revLbl}>Total Rides</p>
                </div>
                <div style={styles.revDivider} />
                <div style={styles.revStat}>
                  <p style={styles.revNum}>{revenue.totalPassengers || 0}</p>
                  <p style={styles.revLbl}>Passengers</p>
                </div>
              </div>
            </div>

            {/* User Growth */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>👥 User Breakdown</h2>
              <div style={styles.userBreakdown}>
                <div style={styles.userBar}>
                  <div style={styles.userBarLabelRow}>
                    <span>🚗 Drivers</span>
                    <span>{drivers.length}</span>
                  </div>
                  <div style={styles.userBarTrack}>
                    <div style={{...styles.userBarFill, width: `${users.length > 0 ? (drivers.length / users.length) * 100 : 0}%`, backgroundColor: '#34a853'}} />
                  </div>
                </div>
                <div style={styles.userBar}>
                  <div style={styles.userBarLabelRow}>
                    <span>🧑 Riders</span>
                    <span>{riders.length}</span>
                  </div>
                  <div style={styles.userBarTrack}>
                    <div style={{...styles.userBarFill, width: `${users.length > 0 ? (riders.length / users.length) * 100 : 0}%`, backgroundColor: '#1a73e8'}} />
                  </div>
                </div>
                <div style={styles.userBar}>
                  <div style={styles.userBarLabelRow}>
                    <span>✅ Online Now</span>
                    <span>{users.filter(u => u.is_online).length}</span>
                  </div>
                  <div style={styles.userBarTrack}>
                    <div style={{...styles.userBarFill, width: `${users.length > 0 ? (users.filter(u => u.is_online).length / users.length) * 100 : 0}%`, backgroundColor: '#f9a825'}} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>🕐 Recent Bookings</h2>
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} style={styles.activityRow}>
                  <div style={styles.activityIcon}>🎫</div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.activityText}>{b.passenger_name} → {b.from_location} to {b.to_location}</p>
                    <p style={styles.activityTime}>GH₵ {b.price}</p>
                  </div>
                  <span style={{...styles.activityBadge, backgroundColor: b.status === 'completed' ? '#34a853' : b.status === 'pending' ? '#f9a825' : b.status === 'cancelled' ? '#ea4335' : '#1a73e8'}}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>👥 Users ({users.length})</h1>
            <div style={styles.filterRow}>
              <div style={styles.filterStat}>🚗 Drivers: {drivers.length}</div>
              <div style={styles.filterStat}>🧑 Riders: {riders.length}</div>
              <div style={styles.filterStat}>🟢 Online: {users.filter(u => u.is_online).length}</div>
            </div>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.th}>Name</span>
                <span style={styles.th}>Role</span>
                <span style={styles.th}>Status</span>
                <span style={styles.th}>Wallet</span>
              </div>
              {users.map(user => (
                <div key={user.id} style={styles.tableRow}>
                  <div style={styles.td}>
                    <p style={styles.tdMain}>{user.name}</p>
                    <p style={styles.tdSub}>{user.email}</p>
                  </div>
                  <div style={styles.td}>
                    <span style={{...styles.roleBadge, backgroundColor: user.role === 'driver' ? '#34a853' : user.role === 'admin' ? '#ea4335' : '#1a73e8'}}>{user.role}</span>
                  </div>
                  <div style={styles.td}>
                    <span style={{color: user.is_online ? '#34a853' : '#888', fontWeight: 'bold', fontSize: '12px'}}>{user.is_online ? '🟢 Online' : '⚫ Offline'}</span>
                  </div>
                  <div style={styles.td}>
                    <p style={styles.tdMain}>GH₵ {user.wallet_balance?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RIDES TAB */}
        {activeTab === 'rides' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>🚗 Rides ({rides.length})</h1>
            <div style={styles.filterRow}>
              <div style={styles.filterStat}>✅ Active: {rides.filter(r => r.status === 'active').length}</div>
              <div style={styles.filterStat}>❌ Cancelled: {rides.filter(r => r.status === 'cancelled').length}</div>
            </div>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.th}>Route</span>
                <span style={styles.th}>Driver</span>
                <span style={styles.th}>Price</span>
                <span style={styles.th}>Status</span>
              </div>
              {rides.map(ride => (
                <div key={ride.id} style={styles.tableRow}>
                  <div style={styles.td}>
                    <p style={styles.tdMain}>{ride.from_location} → {ride.to_location}</p>
                    <p style={styles.tdSub}>{ride.departure_time}</p>
                  </div>
                  <div style={styles.td}><p style={styles.tdMain}>{ride.driver_name}</p></div>
                  <div style={styles.td}><p style={styles.tdMain}>GH₵ {ride.price}</p></div>
                  <div style={styles.td}>
                    <span style={{...styles.roleBadge, backgroundColor: ride.status === 'active' ? '#34a853' : '#888'}}>{ride.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>🎫 Bookings ({bookings.length})</h1>
            <div style={styles.filterRow}>
              {bookingsByStatus.map((b, i) => (
                <div key={i} style={{...styles.filterStat, color: b.color}}>{b.label}: {b.count}</div>
              ))}
            </div>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.th}>Passenger</span>
                <span style={styles.th}>Route</span>
                <span style={styles.th}>Price</span>
                <span style={styles.th}>Status</span>
              </div>
              {bookings.map(booking => (
                <div key={booking.id} style={styles.tableRow}>
                  <div style={styles.td}><p style={styles.tdMain}>{booking.passenger_name}</p></div>
                  <div style={styles.td}>
                    <p style={styles.tdMain}>{booking.from_location} → {booking.to_location}</p>
                  </div>
                  <div style={styles.td}><p style={styles.tdMain}>GH₵ {booking.price}</p></div>
                  <div style={styles.td}>
                    <span style={{...styles.roleBadge, backgroundColor: booking.status === 'completed' ? '#34a853' : booking.status === 'pending' ? '#f9a825' : booking.status === 'cancelled' ? '#ea4335' : '#1a73e8'}}>{booking.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>📄 Driver Verification</h1>
            <div style={styles.filterRow}>
              <div style={styles.filterStat}>⏳ Pending: {pendingDocs.length}</div>
              <div style={styles.filterStat}>✅ Verified: {documents.filter(d => d.verified).length}</div>
            </div>
            {documents.map(doc => (
              <div key={doc.id} style={styles.docCard}>
                <div style={styles.docCardHeader}>
                  <div>
                    <p style={styles.docDriverName}>{doc.driver_name}</p>
                    <span style={{...styles.roleBadge, backgroundColor: doc.verified ? '#34a853' : doc.face_photo ? '#f9a825' : '#888'}}>
                      {doc.verified ? '✅ Verified' : doc.face_photo ? '⏳ Pending' : '❌ No Docs'}
                    </span>
                  </div>
                  {!doc.verified && doc.face_photo && (
                    <button style={styles.reviewBtn} onClick={() => setSelectedDoc(doc)}>Review Documents</button>
                  )}
                </div>
                {doc.rejection_reason && <p style={styles.rejectReasonText}>Rejection reason: {doc.rejection_reason}</p>}
              </div>
            ))}

            {/* Document Review Modal */}
            {selectedDoc && (
              <div style={styles.modal}>
                <div style={styles.modalContent}>
                  <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>📄 {selectedDoc.driver_name}'s Documents</h2>
                    <button style={styles.closeBtn} onClick={() => setSelectedDoc(null)}>✕</button>
                  </div>
                  <div style={styles.modalBody}>
                    {[
                      { key: 'face_photo', label: '📸 Face Selfie' },
                      { key: 'license_front', label: '🪪 License Front' },
                      { key: 'license_back', label: '🪪 License Back' },
                      { key: 'national_id_front', label: '🇬🇭 Ghana Card Front' },
                      { key: 'national_id_back', label: '🇬🇭 Ghana Card Back' },
                      { key: 'insurance_image', label: '🚗 Insurance' },
                      { key: 'roadworthiness_image', label: '✅ Roadworthiness' },
                    ].map(doc => selectedDoc[doc.key] && (
                      <div key={doc.key} style={styles.docImgBox}>
                        <p style={styles.docImgLabel}>{doc.label}</p>
                        <img src={selectedDoc[doc.key]} alt={doc.label} style={styles.docImg} />
                      </div>
                    ))}
                  </div>
                  <div style={styles.modalFooter}>
                    <textarea style={styles.rejectInput} placeholder="Rejection reason (if rejecting)..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2} />
                    <div style={styles.modalBtns}>
                      <button style={styles.rejectBtn} onClick={() => handleReject(selectedDoc.driver_id)}>❌ Reject</button>
                      <button style={styles.verifyBtn} onClick={() => handleVerify(selectedDoc.driver_id)}>✅ Verify Driver</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>🆘 Complaints ({complaints.length})</h1>
            <div style={styles.filterRow}>
              <div style={styles.filterStat}>🔴 Open: {openComplaints.length}</div>
              <div style={styles.filterStat}>✅ Resolved: {complaints.filter(c => c.status === 'resolved').length}</div>
            </div>
            {complaints.map(complaint => (
              <div key={complaint.id} style={styles.complaintCard}>
                <div style={styles.complaintHeader}>
                  <div>
                    <p style={styles.complaintUser}>{complaint.user_name} <span style={styles.complaintRole}>({complaint.role})</span></p>
                    <p style={styles.complaintSubject}>{complaint.subject}</p>
                  </div>
                  <span style={{...styles.roleBadge, backgroundColor: complaint.status === 'open' ? '#ea4335' : '#34a853'}}>{complaint.status}</span>
                </div>
                <p style={styles.complaintMsg}>{complaint.message}</p>
                {complaint.status === 'open' && (
                  <button style={styles.resolveBtn} onClick={() => handleResolveComplaint(complaint.id)}>✅ Mark Resolved</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <div style={styles.content}>
            <h1 style={styles.pageTitle}>💰 Revenue</h1>
            <div style={styles.revenueCards}>
              <div style={styles.revBigCard}>
                <p style={styles.revBigLabel}>Total Commission Earned</p>
                <p style={styles.revBigNum}>GH₵ {revenue.totalRevenue?.toFixed(2) || '0.00'}</p>
                <p style={styles.revBigSub}>10% of all completed rides</p>
              </div>
              <div style={styles.revSmallRow}>
                <div style={styles.revSmallCard}>
                  <p style={styles.revSmallNum}>{revenue.totalRides || 0}</p>
                  <p style={styles.revSmallLbl}>Total Rides</p>
                </div>
                <div style={styles.revSmallCard}>
                  <p style={styles.revSmallNum}>{revenue.totalPassengers || 0}</p>
                  <p style={styles.revSmallLbl}>Passengers</p>
                </div>
                <div style={styles.revSmallCard}>
                  <p style={styles.revSmallNum}>{revenue.totalRides > 0 ? `GH₵ ${(revenue.totalRevenue / revenue.totalRides).toFixed(2)}` : 'GH₵ 0'}</p>
                  <p style={styles.revSmallLbl}>Avg per Ride</p>
                </div>
              </div>
            </div>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.th}>Route</span>
                <span style={styles.th}>Passengers</span>
                <span style={styles.th}>Fare</span>
                <span style={styles.th}>Commission</span>
              </div>
              {revenue.data?.filter(d => d.passengers > 0).map((d, i) => (
                <div key={i} style={styles.tableRow}>
                  <div style={styles.td}><p style={styles.tdMain}>Ride #{d.id}</p></div>
                  <div style={styles.td}><p style={styles.tdMain}>{d.passengers}</p></div>
                  <div style={styles.td}><p style={styles.tdMain}>GH₵ {d.price}</p></div>
                  <div style={styles.td}><p style={{...styles.tdMain, color: '#34a853', fontWeight: 'bold'}}>GH₵ {d.commission?.toFixed(2)}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  app: { display: 'flex', height: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
  toast: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', color: 'white', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  sidebar: { width: '220px', backgroundColor: '#1a1a2e', display: 'flex', flexDirection: 'column', padding: '20px 0', flexShrink: 0 },
  sidebarTop: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' },
  sidebarLogo: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' },
  sidebarTitle: { color: 'white', fontWeight: 'bold', fontSize: '16px', margin: 0 },
  sidebarBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: '14px', textAlign: 'left', position: 'relative' },
  sidebarIcon: { fontSize: '18px', width: '24px' },
  sidebarLabel: { flex: 1 },
  sidebarBadge: { backgroundColor: '#ea4335', color: 'white', borderRadius: '10px', fontSize: '10px', padding: '2px 6px', fontWeight: 'bold' },
  logoutBtn: { marginTop: 'auto', padding: '12px 20px', border: 'none', cursor: 'pointer', color: '#ea4335', backgroundColor: 'transparent', fontSize: '14px', textAlign: 'left' },
  main: { flex: 1, overflowY: 'auto' },
  content: { padding: '24px', maxWidth: '1000px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 20px 0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statIconBox: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statIcon: { fontSize: '24px' },
  statValue: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 2px 0' },
  statLabel: { fontSize: '12px', color: '#888', margin: 0 },
  chartCard: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 20px 0' },
  barChart: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '160px', gap: '16px' },
  barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 },
  barValue: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 },
  barWrapper: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '120px' },
  bar: { width: '60%', borderRadius: '8px 8px 0 0', minHeight: '4px', transition: 'height 0.5s ease' },
  barLabel: { fontSize: '12px', color: '#888', margin: 0, textAlign: 'center' },
  revenueStats: { display: 'flex', justifyContent: 'space-around', alignItems: 'center' },
  revStat: { textAlign: 'center' },
  revNum: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 4px 0' },
  revLbl: { fontSize: '13px', color: '#888', margin: 0 },
  revDivider: { width: '1px', height: '40px', backgroundColor: '#eee' },
  userBreakdown: { display: 'flex', flexDirection: 'column', gap: '16px' },
  userBar: { display: 'flex', flexDirection: 'column', gap: '6px' },
  userBarLabelRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#333', fontWeight: '500' },
  userBarTrack: { height: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' },
  userBarFill: { height: '100%', borderRadius: '5px', transition: 'width 0.5s ease' },
  activityRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  activityIcon: { fontSize: '24px' },
  activityText: { fontSize: '14px', color: '#333', margin: '0 0 2px 0', fontWeight: '500' },
  activityTime: { fontSize: '12px', color: '#888', margin: 0 },
  activityBadge: { padding: '4px 10px', borderRadius: '12px', color: 'white', fontSize: '11px', fontWeight: 'bold', flexShrink: 0 },
  filterRow: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  filterStat: { backgroundColor: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#333', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  table: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  tableHeader: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', backgroundColor: '#f8f9fa', padding: '12px 16px', borderBottom: '1px solid #eee' },
  th: { fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' },
  tableRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '14px 16px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' },
  td: { fontSize: '14px' },
  tdMain: { margin: '0 0 2px 0', fontWeight: '500', color: '#333', fontSize: '14px' },
  tdSub: { margin: 0, color: '#888', fontSize: '12px' },
  roleBadge: { padding: '3px 10px', borderRadius: '12px', color: 'white', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' },
  docCard: { backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  docCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  docDriverName: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 6px 0' },
  reviewBtn: { padding: '8px 16px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  rejectReasonText: { fontSize: '13px', color: '#ea4335', margin: '8px 0 0 0' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 },
  modalContent: { backgroundColor: 'white', borderRadius: '20px', width: '90%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  modalHeader: { padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' },
  modalBody: { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' },
  docImgBox: { display: 'flex', flexDirection: 'column', gap: '6px' },
  docImgLabel: { fontSize: '12px', fontWeight: 'bold', color: '#555', margin: 0 },
  docImg: { width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' },
  modalFooter: { padding: '16px 24px', borderTop: '1px solid #eee' },
  rejectInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box', resize: 'vertical' },
  modalBtns: { display: 'flex', gap: '12px' },
  rejectBtn: { flex: 1, padding: '12px', backgroundColor: '#fce8e6', color: '#ea4335', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  verifyBtn: { flex: 2, padding: '12px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  complaintCard: { backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  complaintHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  complaintUser: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' },
  complaintRole: { fontSize: '12px', color: '#888', fontWeight: 'normal' },
  complaintSubject: { fontSize: '14px', color: '#1a73e8', fontWeight: 'bold', margin: 0 },
  complaintMsg: { fontSize: '13px', color: '#555', margin: '0 0 12px 0', lineHeight: '1.5' },
  resolveBtn: { padding: '8px 16px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  revenueCards: { marginBottom: '20px' },
  revBigCard: { background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', borderRadius: '20px', padding: '32px', textAlign: 'center', color: 'white', marginBottom: '16px' },
  revBigLabel: { fontSize: '14px', opacity: 0.8, margin: '0 0 8px 0' },
  revBigNum: { fontSize: '42px', fontWeight: 'bold', margin: '0 0 8px 0' },
  revBigSub: { fontSize: '13px', opacity: 0.7, margin: 0 },
  revSmallRow: { display: 'flex', gap: '12px' },
  revSmallCard: { flex: 1, backgroundColor: 'white', borderRadius: '14px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  revSmallNum: { fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 4px 0' },
  revSmallLbl: { fontSize: '12px', color: '#888', margin: 0 },
};

export default AdminDashboard;