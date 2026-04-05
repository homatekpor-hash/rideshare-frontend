import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRides, setTotalRides] = useState(0);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState('');

  const userId = localStorage.getItem('userId');
  const [viewingId, setViewingId] = useState(userId);

  useEffect(() => {
    if (viewingId) {
      fetchProfile(viewingId);
      fetchRatings(viewingId);
      fetchTotalRides(viewingId);
    }
  }, [viewingId]);

  const fetchProfile = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile/${id}`);
      setUser(response.data.user);
    } catch (error) {
      setMessage('User not found.');
    }
  };

  const fetchRatings = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/ratings/${id}`);
      setRatings(response.data.ratings);
      setAvgRating(response.data.avgRating);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const fetchTotalRides = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/my-rides/${id}`);
      setTotalRides(response.data.rides.length);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const handleSearch = () => {
    if (searchId) {
      setViewingId(searchId);
      setMessage('');
    }
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
        <button style={styles.searchButton} onClick={handleSearch}>View Profile</button>
        <button
          style={styles.myProfileButton}
          onClick={() => { setViewingId(userId); setSearchId(''); }}
        >
          My Profile
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {user && (
        <>
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={styles.profileInfo}>
              <h3 style={styles.profileName}>{user.name}</h3>
              <p style={styles.profileEmail}>📧 {user.email}</p>
              <p style={styles.profileJoined}>
                📅 Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
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
                  <p style={styles.reviewDate}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
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
  container: {
    padding: '32px',
    maxWidth: '700px',
    margin: '0 auto',
  },
  pageTitle: {
    color: '#1a73e8',
    marginBottom: '24px',
    textAlign: 'center',
    fontSize: '28px',
  },
  searchBox: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  searchButton: {
    padding: '12px 16px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  myProfileButton: {
    padding: '12px 16px',
    backgroundColor: '#f1f3f4',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  profileCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '24px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#1a73e8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  profileName: {
    margin: 0,
    fontSize: '24px',
    color: '#333',
    fontWeight: 'bold',
  },
  profileEmail: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  profileJoined: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1a73e8',
    margin: '0 0 8px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    color: '#333',
    fontSize: '20px',
    marginBottom: '16px',
    borderBottom: '2px solid #1a73e8',
    paddingBottom: '8px',
  },
  reviewCard: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: '12px',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  reviewName: {
    margin: 0,
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px',
  },
  reviewStars: {
    margin: 0,
    fontSize: '16px',
  },
  reviewComment: {
    margin: '0 0 8px 0',
    color: '#666',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  reviewDate: {
    margin: 0,
    color: '#aaa',
    fontSize: '12px',
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  message: {
    color: '#e53935',
    textAlign: 'center',
    marginBottom: '16px',
  },
};

export default Profile;