import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://api.rydeghanas.com';

function Earnings() {
  const [earnings, setEarnings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [message, setMessage] = useState('');

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (userId) {
      fetchEarnings();
    }
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${API}/earnings/${userId}`);
      setEarnings(response.data.earnings);
      setTotalEarnings(response.data.totalEarnings);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  if (!userId) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>Please login to see your earnings.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>My Earnings 💰</h2>

      {/* Total Earnings Card */}
      <div style={styles.totalCard}>
        <p style={styles.totalLabel}>Total Earnings</p>
        <p style={styles.totalAmount}>GH₵ {totalEarnings.toFixed(2)}</p>
        <p style={styles.totalSub}>From {earnings.length} ride(s)</p>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{earnings.length}</p>
          <p style={styles.statLabel}>Total Rides</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>
            GH₵ {earnings.length > 0 ? (totalEarnings / earnings.length).toFixed(2) : '0.00'}
          </p>
          <p style={styles.statLabel}>Avg Per Ride</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>
            {earnings.reduce((sum, e) => sum + (e.passengers || 0), 0)}
          </p>
          <p style={styles.statLabel}>Total Passengers</p>
        </div>
      </div>

      {/* Earnings List */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Earnings History</h3>
        {earnings.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>No earnings yet.</p>
            <p style={styles.emptySubtext}>Post a ride with a price to start earning!</p>
          </div>
        ) : (
          earnings.map((item) => (
            <div key={item.id} style={styles.earningCard}>
              <div style={styles.earningInfo}>
                <p style={styles.earningRoute}>📍 {item.from_location} → {item.to_location}</p>
                <p style={styles.earningDetail}>🕐 {item.departure_time}</p>
                <p style={styles.earningDetail}>👥 {item.passengers} passenger(s)</p>
                <p style={styles.earningDetail}>💺 Price per seat: GH₵ {item.price}</p>
              </div>
              <div style={styles.earningAmount}>
                <p style={styles.amountText}>GH₵ {(item.total_earned || 0).toFixed(2)}</p>
                <p style={styles.amountLabel}>earned</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '32px', maxWidth: '700px', margin: '0 auto' },
  pageTitle: { color: '#1a73e8', marginBottom: '24px', textAlign: 'center', fontSize: '28px' },
  totalCard: {
    background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
    padding: '32px',
    borderRadius: '16px',
    textAlign: 'center',
    marginBottom: '24px',
    color: 'white',
  },
  totalLabel: { margin: '0 0 8px 0', fontSize: '16px', opacity: 0.9 },
  totalAmount: { margin: '0 0 8px 0', fontSize: '48px', fontWeight: 'bold' },
  totalSub: { margin: 0, fontSize: '14px', opacity: 0.8 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '24px', fontWeight: 'bold', color: '#1a73e8', margin: '0 0 8px 0' },
  statLabel: { fontSize: '14px', color: '#666', margin: 0 },
  section: { marginBottom: '24px' },
  sectionTitle: { color: '#333', fontSize: '20px', marginBottom: '16px', borderBottom: '2px solid #1a73e8', paddingBottom: '8px' },
  earningCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  earningInfo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  earningRoute: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 },
  earningDetail: { fontSize: '13px', color: '#666', margin: 0 },
  earningAmount: { textAlign: 'center' },
  amountText: { fontSize: '24px', fontWeight: 'bold', color: '#34a853', margin: '0 0 4px 0' },
  amountLabel: { fontSize: '12px', color: '#888', margin: 0 },
  emptyCard: { backgroundColor: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  emptyText: { color: '#888', fontSize: '16px', margin: '0 0 8px 0' },
  emptySubtext: { color: '#aaa', fontSize: '14px', margin: 0 },
  empty: { color: '#888', textAlign: 'center', padding: '20px' },
};

export default Earnings;