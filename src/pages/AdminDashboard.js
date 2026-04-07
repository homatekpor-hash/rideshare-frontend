import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [revenue, setRevenue] = useState({ totalRevenue: 0, totalRides: 0, totalPassengers: 0 });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userId') || localStorage.getItem('userRole') !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [usersRes, ridesRes, bookingsRes, complaintsRes, docsRes, revenueRes] = await Promise.all([
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/rides`),
        axios.get(`${API}/admin/bookings`),
        axios.get(`${API}/complaints`),
        axios.get(`${API}/admin/documents`),
        axios.get(`${API}/admin/revenue`),
      ]);
      setUsers(usersRes.data.users);
      setRides(ridesRes.data.rides);
      setBookings(bookingsRes.data.bookings);
      setComplaints(complaintsRes.data.complaints);
      setDocuments(docsRes.data.documents);
      setRevenue(revenueRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleCancelRide = async (rideId) => {
    await axios.put(`${API}/rides/${rideId}/cancel`);
    setMessage('Ride cancelled!');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleVerifyDriver = async (driverId) => {
    await axios.put(`${API}/admin/documents/${driverId}/verify`);
    setMessage('Driver verified!');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleResolveComplaint = async (complaintId) => {
    await axios.put(`${API}/complaints/${complaintId}`, { status: 'resolved' });
    setMessage('Complaint resolved!');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const tabs = [
    { id: 'home', label: '🏠 Dashboard' },
    { id: 'users', label: '👥 Users' },
    { id: 'rides', label: '🚗 Rides' },
    { id: 'bookings', label: '🎫 Bookings' },
    { id: 'documents', label: '📄 Documents' },
    { id: 'complaints', label: '🆘 Complaints' },
    { id: 'revenue', label: '💰 Revenue' },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.adminIcon}>⚙️</div>
          <p style={styles.sidebarName}>Admin Panel</p>
          <p style={styles.sidebarRole}>RideShare Ghana</p>
        </div>

        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{...styles.tabBtn, ...(activeTab === tab.id ? styles.tabActive : {})}}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'complaints' && complaints.filter(c => c.status === 'open').length > 0 && (
              <span style={styles.notifBadge}>{complaints.filter(c => c.status === 'open').length}</span>
            )}
            {tab.id === 'documents' && documents.filter(d => !d.verified).length > 0 && (
              <span style={styles.notifBadge}>{documents.filter(d => !d.verified).length}</span>
            )}
          </button>
        ))}

        <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {message && <div style={styles.successMsg}>{message}</div>}

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div>
            <h2 style={styles.pageTitle}>Admin Dashboard ⚙️</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <p style={styles.statNum}>{users.length}</p>
                <p style={styles.statLbl}>Total Users</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statNum}>{users.filter(u => u.role === 'driver').length}</p>
                <p style={styles.statLbl}>Drivers</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statNum}>{users.filter(u => u.role === 'rider').length}</p>
                <p style={styles.statLbl}>Riders</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statNum}>{rides.length}</p>
                <p style={styles.statLbl}>Total Rides</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statNum}>{bookings.length}</p>
                <p style={styles.statLbl}>Total Bookings</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statNum}>GH₵ {revenue.totalRevenue?.toFixed(2) || '0.00'}</p>
                <p style={styles.statLbl}>Total Revenue</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statNum}>{complaints.filter(c => c.status === 'open').length}</p>
                <p style={styles.statLbl}>Open Complaints</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statNum}>{documents.filter(d => !d.verified).length}</p>
                <p style={styles.statLbl}>Pending Verifications</p>
              </div>
            </div>

            <h3 style={styles.sectionTitle}>Online Drivers</h3>
            {users.filter(u => u.role === 'driver' && u.is_online).length === 0 ? (
              <p style={styles.empty}>No drivers online right now.</p>
            ) : (
              users.filter(u => u.role === 'driver' && u.is_online).map(driver => (
                <div key={driver.id} style={styles.userCard}>
                  <p style={styles.userName}>🟢 {driver.name}</p>
                  <p style={styles.userDetail}>📧 {driver.email}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <h2 style={styles.pageTitle}>All Users 👥</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={styles.tableRow}>
                      <td style={styles.td}>{user.id}</td>
                      <td style={styles.td}>{user.name}</td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={styles.td}>
                        <span style={{...styles.roleBadge, backgroundColor: user.role === 'driver' ? '#1a73e8' : user.role === 'admin' ? '#ea4335' : '#34a853'}}>
                          {user.role}
                        </span>
                      </td>
                      <td style={styles.td}>{user.phone || 'N/A'}</td>
                      <td style={styles.td}>
                        <span style={{...styles.badge, backgroundColor: user.is_online ? '#34a853' : '#888'}}>
                          {user.is_online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RIDES TAB */}
        {activeTab === 'rides' && (
          <div>
            <h2 style={styles.pageTitle}>All Rides 🚗</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Driver</th>
                    <th style={styles.th}>From</th>
                    <th style={styles.th}>To</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Seats</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map(ride => (
                    <tr key={ride.id} style={styles.tableRow}>
                      <td style={styles.td}>{ride.id}</td>
                      <td style={styles.td}>{ride.driver_name}</td>
                      <td style={styles.td}>{ride.from_location}</td>
                      <td style={styles.td}>{ride.to_location}</td>
                      <td style={styles.td}>GH₵ {ride.price}</td>
                      <td style={styles.td}>{ride.seats_available}</td>
                      <td style={styles.td}>
                        <span style={{...styles.badge, backgroundColor: ride.status === 'active' ? '#34a853' : '#888'}}>{ride.status}</span>
                      </td>
                      <td style={styles.td}>
                        {ride.status === 'active' && (
                          <button style={styles.cancelBtn} onClick={() => handleCancelRide(ride.id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={styles.pageTitle}>All Bookings 🎫</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Passenger</th>
                    <th style={styles.th}>From</th>
                    <th style={styles.th}>To</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} style={styles.tableRow}>
                      <td style={styles.td}>{booking.id}</td>
                      <td style={styles.td}>{booking.passenger_name}</td>
                      <td style={styles.td}>{booking.from_location}</td>
                      <td style={styles.td}>{booking.to_location}</td>
                      <td style={styles.td}>GH₵ {booking.price}</td>
                      <td style={styles.td}>
                        <span style={{...styles.badge, backgroundColor: booking.status === 'pending' ? '#1a73e8' : '#888'}}>{booking.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div>
            <h2 style={styles.pageTitle}>Driver Documents 📄</h2>
            {documents.length === 0 ? (
              <p style={styles.empty}>No documents submitted yet.</p>
            ) : (
              documents.map(doc => (
                <div key={doc.id} style={styles.docCard}>
                  <div>
                    <p style={styles.userName}>🚗 {doc.driver_name}</p>
                    <div style={styles.docImages}>
                      {doc.license_image && <img src={doc.license_image} alt="License" style={styles.docImg} />}
                      {doc.national_id_image && <img src={doc.national_id_image} alt="National ID" style={styles.docImg} />}
                      {doc.insurance_image && <img src={doc.insurance_image} alt="Insurance" style={styles.docImg} />}
                      {doc.roadworthiness_image && <img src={doc.roadworthiness_image} alt="Roadworthiness" style={styles.docImg} />}
                    </div>
                  </div>
                  <div style={styles.docRight}>
                    {doc.verified ? (
                      <span style={styles.verifiedBadge}>✅ Verified</span>
                    ) : (
                      <button style={styles.verifyBtn} onClick={() => handleVerifyDriver(doc.driver_id)}>Verify Driver</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div>
            <h2 style={styles.pageTitle}>Complaints 🆘</h2>
            {complaints.length === 0 ? (
              <p style={styles.empty}>No complaints yet.</p>
            ) : (
              complaints.map(c => (
                <div key={c.id} style={styles.complaintCard}>
                  <div>
                    <p style={styles.userName}>👤 {c.user_name} ({c.role})</p>
                    <p style={styles.complaintSubject}>📋 {c.subject}</p>
                    <p style={styles.complaintMsg}>{c.message}</p>
                    <p style={styles.userDetail}>📅 {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span style={{...styles.badge, backgroundColor: c.status === 'open' ? '#ea4335' : '#34a853'}}>{c.status}</span>
                    {c.status === 'open' && (
                      <button style={styles.resolveBtn} onClick={() => handleResolveComplaint(c.id)}>Resolve</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <div>
            <h2 style={styles.pageTitle}>Revenue 💰</h2>
            <div style={styles.revenueGrid}>
              <div style={styles.revenueCard}>
                <p style={styles.revenueBig}>GH₵ {revenue.totalRevenue?.toFixed(2) || '0.00'}</p>
                <p style={styles.revenueLbl}>Total Commission (10%)</p>
              </div>
              <div style={styles.revenueCard}>
                <p style={styles.revenueBig}>{revenue.totalRides || 0}</p>
                <p style={styles.revenueLbl}>Total Rides</p>
              </div>
              <div style={styles.revenueCard}>
                <p style={styles.revenueBig}>{revenue.totalPassengers || 0}</p>
                <p style={styles.revenueLbl}>Total Passengers</p>
              </div>
            </div>
            <h3 style={styles.sectionTitle}>Revenue Breakdown</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Ride ID</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Passengers</th>
                    <th style={styles.th}>Commission (10%)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.data?.map(d => (
                    <tr key={d.id} style={styles.tableRow}>
                      <td style={styles.td}>{d.id}</td>
                      <td style={styles.td}>GH₵ {d.price}</td>
                      <td style={styles.td}>{d.passengers}</td>
                      <td style={styles.td}>GH₵ {d.commission?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' },
  sidebar: { width: '220px', backgroundColor: '#ea4335', display: 'flex', flexDirection: 'column', padding: '16px', gap: '4px', flexShrink: 0 },
  sidebarHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' },
  adminIcon: { fontSize: '48px' },
  sidebarName: { color: 'white', fontWeight: 'bold', fontSize: '16px', margin: 0 },
  sidebarRole: { color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 },
  tabBtn: { padding: '10px 12px', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', textAlign: 'left', position: 'relative' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' },
  notifBadge: { position: 'absolute', right: '8px', top: '8px', backgroundColor: 'white', color: '#ea4335', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  logoutBtn: { marginTop: 'auto', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  successMsg: { backgroundColor: '#e6f4ea', color: '#34a853', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' },
  pageTitle: { color: '#ea4335', fontSize: '24px', marginBottom: '24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
  statNum: { fontSize: '24px', fontWeight: 'bold', color: '#ea4335', margin: '0 0 4px 0' },
  statLbl: { fontSize: '12px', color: '#888', margin: 0 },
  sectionTitle: { color: '#333', fontSize: '18px', marginBottom: '12px', marginTop: '24px' },
  userCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '8px' },
  userName: { fontWeight: 'bold', color: '#333', margin: '0 0 4px 0', fontSize: '14px' },
  userDetail: { fontSize: '13px', color: '#888', margin: 0 },
  tableContainer: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f8f9fa' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '13px', color: '#333' },
  badge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 'bold' },
  roleBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 'bold' },
  cancelBtn: { padding: '6px 12px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  docCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  docImages: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
  docImg: { width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' },
  docRight: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  verifiedBadge: { padding: '6px 12px', backgroundColor: '#e6f4ea', color: '#34a853', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' },
  verifyBtn: { padding: '8px 16px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  complaintCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  complaintSubject: { fontWeight: 'bold', color: '#333', margin: '4px 0', fontSize: '14px' },
  complaintMsg: { color: '#666', fontSize: '13px', margin: '4px 0' },
  resolveBtn: { marginTop: '8px', padding: '6px 12px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'block' },
  revenueGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  revenueCard: { backgroundColor: '#ea4335', padding: '24px', borderRadius: '12px', textAlign: 'center', color: 'white' },
  revenueBig: { fontSize: '32px', fontWeight: 'bold', margin: '0 0 4px 0' },
  revenueLbl: { fontSize: '13px', opacity: 0.9, margin: 0 },
  empty: { color: '#888', textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '12px' },
};

export default AdminDashboard;