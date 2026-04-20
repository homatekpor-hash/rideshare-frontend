import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API = 'https://api.rydeghanas.com';

function DriverProfile() {
  const { driverId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/driver/profile/${driverId}`);
        setData(res.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchProfile();
  }, [driverId]);

  if (loading) return (
    <div style={styles.loading}>
      <img src="/logo.png" alt="Ryde" style={styles.loadingLogo} />
      <p style={styles.loadingText}>Loading driver profile...</p>
    </div>
  );

  if (!data) return (
    <div style={styles.loading}>
      <p style={styles.loadingText}>Driver not found.</p>
    </div>
  );

  const { driver, ratings, avgRating, totalRides } = data;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <p style={styles.headerTitle}>Driver Profile</p>
        <div style={{ width: '40px' }} />
      </div>
      <div style={styles.profileCard}>
        {driver.profile_picture ? <img src={driver.profile_picture} alt="" style={styles.avatar} /> : <div style={styles.avatarPlaceholder}>{driver.name?.charAt(0)}</div>}
        <p style={styles.driverName}>{driver.name}</p>
        <div style={styles.ratingRow}>
          <p style={styles.starRating}>⭐ {avgRating}</p>
          <p style={styles.ratingCount}>({ratings.length} reviews)</p>
        </div>
        <p style={styles.memberSince}>Member since {new Date(driver.created_at).toLocaleDateString('en-GH', { month: 'long', year: 'numeric' })}</p>
      </div>
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <p style={styles.statNum}>{totalRides}</p>
          <p style={styles.statLabel}>Completed Rides</p>
        </div>
        <div style={styles.statBox}>
          <p style={styles.statNum}>{avgRating}</p>
          <p style={styles.statLabel}>Average Rating</p>
        </div>
        <div style={styles.statBox}>
          <p style={styles.statNum}>{ratings.length}</p>
          <p style={styles.statLabel}>Reviews</p>
        </div>
      </div>
      {(driver.vehicle_number || driver.vehicle_model) && (
        <div style={styles.card}>
          <p style={styles.cardTitle}>🚗 Vehicle Information</p>
          {driver.vehicle_model && <p style={styles.cardRow}>Model: <strong>{driver.vehicle_color} {driver.vehicle_model}</strong></p>}
          {driver.vehicle_number && <p style={styles.cardRow}>Plate: <strong>{driver.vehicle_number}</strong></p>}
        </div>
      )}
      <div style={styles.card}>
        <p style={styles.cardTitle}>⭐ Reviews ({ratings.length})</p>
        {ratings.length === 0 ? (
          <p style={styles.noReviews}>No reviews yet.</p>
        ) : ratings.map((r, i) => (
          <div key={i} style={styles.reviewCard}>
            <div style={styles.reviewHeader}>
              <div style={styles.reviewStars}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{fontSize: '14px', opacity: star <= r.rating ? 1 : 0.3}}>⭐</span>
                ))}
              </div>
              <p style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
            {r.comment && <p style={styles.reviewComment}>{r.comment}</p>}
          </div>
        ))}
      </div>
      {driver.phone && (
        <a href={`tel:${driver.phone}`} style={styles.callBtn}>📞 Call Driver</a>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '480px', margin: '0 auto', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' },
  loadingLogo: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
  loadingText: { fontSize: '16px', color: '#888' },
  header: { backgroundColor: '#1a1a2e', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: '18px', margin: 0 },
  profileCard: { backgroundColor: '#1a1a2e', padding: '24px 20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  avatar: { width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #34a853' },
  avatarPlaceholder: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: 'white' },
  driverName: { color: 'white', fontSize: '22px', fontWeight: 'bold', margin: 0 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  starRating: { color: '#f9a825', fontSize: '18px', fontWeight: 'bold', margin: 0 },
  ratingCount: { color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 },
  memberSince: { color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 },
  statsRow: { display: 'flex', gap: '12px', padding: '16px', marginTop: '-16px' },
  statBox: { flex: 1, backgroundColor: 'white', borderRadius: '14px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
  statNum: { fontSize: '22px', fontWeight: 'bold', color: '#1a73e8', margin: '0 0 4px 0' },
  statLabel: { fontSize: '11px', color: '#888', margin: 0 },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', margin: '0 16px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 14px 0' },
  cardRow: { fontSize: '14px', color: '#555', margin: '0 0 8px 0' },
  noReviews: { fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '16px 0', margin: 0 },
  reviewCard: { backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '14px', marginBottom: '10px' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  reviewStars: { display: 'flex', gap: '2px' },
  reviewDate: { fontSize: '12px', color: '#aaa', margin: 0 },
  reviewComment: { fontSize: '14px', color: '#444', margin: 0, lineHeight: '1.5' },
  callBtn: { display: 'block', margin: '0 16px 24px', padding: '16px', backgroundColor: '#34a853', color: 'white', textDecoration: 'none', borderRadius: '14px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' },
};

export default DriverProfile;