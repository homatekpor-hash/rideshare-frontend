import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://api.rydeghanas.com';

function Admin() {
  const [activeTab, setActiveTab] = useState('rides');
  const [rides, setRides] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [ridesRes, usersRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/admin/rides`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/bookings`),
      ]);
      setRides(ridesRes.data.rides);
      setUsers(usersRes.data.users);
      setBookings(bookingsRes.data.bookings);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleCancelRide = async (rideId) => {
    try {
      await axios.put(`${API}/rides/${rideId}/cancel`);
      setMessage('Ride cancelled!');
      fetchAllData();
    } catch (error) {
      setMessage('Error cancelling ride.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Admin Dashboard 🛠️</h2>
      {message && <p style={styles.successMessage}>{message}</p>}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{users.length}</p>
          <p style={styles.statLabel}>Total Users</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{rides.length}</p>
          <p style={styles.statLabel}>Total Rides</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{bookings.length}</p>
          <p style={styles.statLabel}>Total Bookings</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{rides.filter(r => r.status === 'active').length}</p>
          <p style={styles.statLabel}>Active Rides</p>
        </div>
      </div>
      <div style={styles.tabs}>
        <button style={{...styles.tab, ...(activeTab === 'rides' ? styles.activeTab : {})}} onClick={() => setActiveTab('rides')}>🚗 All Rides</button>
        <button style={{...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {})}} onClick={() => setActiveTab('users')}>👥 All Users</button>
        <button style={{...styles.tab, ...(activeTab === 'bookings' ? styles.activeTab : {})}} onClick={() => setActiveTab('bookings')}>🎫 All Bookings</button>
      </div>
      {activeTab === 'rides' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Driver</th>
                <th style={styles.th}>From</th>
                <th style={styles.th}>To</th>
                <th style={styles.th}>Seats</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride.id} style={styles.tableRow}>
                  <td style={styles.td}>{ride.id}</td>
                  <td style={styles.td}>{ride.driver_name}</td>
                  <td style={styles.td}>{ride.from_location}</td>
                  <td style={styles.td}>{ride.to_location}</td>
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
      )}
      {activeTab === 'users' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tableRow}>
                  <td style={styles.td}>{user.id}</td>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'bookings' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Passenger</th>
                <th style={styles.th}>From</th>
                <th style={styles.th}>To</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} style={styles.tableRow}>
                  <td style={styles.td}>{booking.id}</td>
                  <td style={styles.td}>{booking.passenger_name}</td>
                  <td style={styles.td}>{booking.from_location}</td>
                  <td style={styles.td}>{booking.to_location}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, backgroundColor: booking.status === 'pending' ? '#1a73e8' : '#888'}}>{booking.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
  pageTitle: { color: '#1a73e8', marginBottom: '24px', textAlign: 'center', fontSize: '28px' },
  successMessage: { textAlign: 'center', color: '#34a853', backgroundColor: '#e6f4ea', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '36px', fontWeight: 'bold', color: '#1a73e8', margin: '0 0 8px 0' },
  statLabel: { fontSize: '14px', color: '#666', margin: 0 },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#f1f3f4', color: '#333' },
  activeTab: { backgroundColor: '#1a73e8', color: 'white' },
  tableContainer: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f8f9fa' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  badge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  cancelBtn: { padding: '6px 12px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' },
};

export default Admin;