import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://api.rydeghanas.com';

function Profile() {
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRides, setTotalRides] = useState(0);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const userId = localStorage.getItem('userId');
  const [viewingId, setViewingId] = useState(userId);
  const isOwnProfile = viewingId == userId;

  useEffect(() => {
    if (viewingId) {
      fetchProfile(viewingId);
      fetchRatings(viewingId);
      fetchTotalRides(viewingId);
    }
  }, [viewingId]);

  const fetchProfile = async (id) => {
    try {
      const response = await axios.get(`${API}/profile/${id}`);
      setUser(response.data.user);
      setIsOnline(response.data.user.is_online === 1);
    } catch (error) {
      setMessage('User not found.');
    }
  };

  const fetchRatings = async (id) => {
    try {
      const response = await axios.get(`${API}/ratings/${id}`);
      setRatings(response.data.ratings);
      setAvgRating(response.data.avgRating);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const fetchTotalRides = async (id) => {
    try {
      const response = await axios.get(`${API}/my-rides/${id}`);
      setTotalRides(response.data.rides.length);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    try {
      await axios.put(`${API}/users/${userId}/status`, { is_online: newStatus ? 1 : 0 });
      setIsOnline(newStatus);
      setMessage(newStatus ? 'You are now Online!' : 'You are now Offline.');
    } catch (error) {
      setMessage('Error updating status.');
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPicture(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await axios.put(`${API}/users/${userId}/picture`, { profile_picture: reader.result });
        setUser({ ...user, profile_picture: reader.result });
        setMessage('Profile picture updated!');
      } catch (error) {
        setMessage('Error uploading picture.');
      }
      setUploadingPicture(false);
    };
    reader.readAsDataURL(file);
  };

  const renderStars = (count) => '⭐'.repeat(count);

  if (!userId) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>Please login to view profiles.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Driver Profile 👤</h2>

      <div style={styles.searchBox}>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter User ID to view their profile"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button style={styles.searchButton} onClick={() => { setViewingId(searchId); setMessage(''); }}>View Profile</button>
        <button style={styles.myProfileButton} onClick={() => { setViewingId(userId); setSearchId(''); }}>My Profile</button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {user && (
        <>
          <div style={styles.profileCard}>
            <div style={styles.avatarContainer}>
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" style={styles.avatarImage} />
              ) : (
                <div style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
              )}
              {isOwnProfile && (
                <label style={styles.uploadLabel}>
                  {uploadingPicture ? 'Uploading...' : '📷 Change Photo'}
                  <input type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            <div style={styles.profileInfo}>
              <div style={styles.nameRow}>
                <h3 style={styles.profileName}>{user.name}</h3>
                <span style={{
                  ...styles.onlineBadge,
                  backgroundColor: isOnline ? '#34a853' : '#888'
                }}>
                  {isOnline ? '🟢 Online' : '⚫ Offline'}
                </span>
              </div>
              <p style={styles.profileEmail}>📧 {user.email}</p>
              <p style={styles.profileJoined}>📅 Member since {new Date(user.created_at).toLocaleDateString()}</p>
              {isOwnProfile && (
                <button
                  style={{
                    ...styles.toggleButton,
                    backgroundColor: isOnline ? '#ea4335' : '#34a853',
                  }}
                  onClick={handleToggleOnline}
                >
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
              )}
            </div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <p style={styles.statNumber}>{totalRides}</p>
              <p style={styles.statLabel}>Rides Posted</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statNumber}>{avgRating || '0'}</p>
              <p style={styles.statLabel}>Average Rating</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statNumber}>{ratings.length}</p>
              <p style={styles.statLabel}>Total Reviews</p>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Reviews ⭐</h3>
            {ratings.length === 0 ? (
              <p style={styles.empty}>No reviews yet.</p>
            ) : (
              ratings.map((r) => (
                <div key={r.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <p style={styles.reviewName}>👤 {r.passenger_name}</p>
                    <p style={styles.reviewStars}>{renderStars(r.rating)}</p>
                  </div>
                  {r.comment && <p style={styles.reviewComment}>"{r.comment}"</p>}
                  <p style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '32px', maxWidth: '700px', margin: '0 auto' },
  pageTitle: { color: '#1a73e8', marginBottom: '24px', textAlign: 'center', fontSize: '28px' },
  searchBox: { display: 'flex', gap: '8px', marginBottom: '24px' },
  input: { flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  searchButton: { padding: '12px 16px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  myProfileButton: { padding: '12px 16px', backgroundColor: '#f1f3f4', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  profileCard: { backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '24px' },
  avatarContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold' },
  avatarImage: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
  uploadLabel: { fontSize: '12px', color: '#1a73e8', cursor: 'pointer', textAlign: 'center', padding: '4px 8px', borderRadius: '8px', border: '1px solid #1a73e8' },
  profileInfo: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  nameRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  profileName: { margin: 0, fontSize: '24px', color: '#333', fontWeight: 'bold' },
  onlineBadge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  profileEmail: { margin: 0, fontSize: '14px', color: '#666' },
  profileJoined: { margin: 0, fontSize: '14px', color: '#666' },
  toggleButton: { padding: '10px 20px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', width: 'fit-content' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '36px', fontWeight: 'bold', color: '#1a73e8', margin: '0 0 8px 0' },
  statLabel: { fontSize: '14px', color: '#666', margin: 0 },
  section: { marginBottom: '24px' },
  sectionTitle: { color: '#333', fontSize: '20px', marginBottom: '16px', borderBottom: '2px solid #1a73e8', paddingBottom: '8px' },
  reviewCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '12px' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  reviewName: { margin: 0, fontWeight: 'bold', color: '#333', fontSize: '14px' },
  reviewStars: { margin: 0, fontSize: '16px' },
  reviewComment: { margin: '0 0 8px 0', color: '#666', fontSize: '14px', fontStyle: 'italic' },
  reviewDate: { margin: 0, color: '#aaa', fontSize: '12px' },
  empty: { color: '#888', textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '12px' },
  message: { color: '#34a853', textAlign: 'center', marginBottom: '16px', padding: '12px', backgroundColor: '#e6f4ea', borderRadius: '8px' },
};

export default Profile;