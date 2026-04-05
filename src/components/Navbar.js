import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/${userId}`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>🚗 RideShare</div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/find-ride" style={styles.link}>Find a Ride</Link>
        <Link to="/post-ride" style={styles.link}>Post a Ride</Link>
        <Link to="/my-rides" style={styles.link}>My Rides</Link>
        <Link to="/messages" style={styles.link}>Messages</Link>
        {userName ? (
          <>
            <div style={styles.bellContainer}>
              <button
                style={styles.bell}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {notifications.length > 0 && (
                  <span style={styles.badge}>{notifications.length}</span>
                )}
              </button>
              {showNotifications && (
                <div style={styles.dropdown}>
                  <h4 style={styles.dropdownTitle}>Notifications</h4>
                  {notifications.length === 0 ? (
                    <p style={styles.dropdownEmpty}>No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} style={styles.notificationItem}>
                        <p style={styles.notificationText}>
                          👤 <strong>{n.passenger_name}</strong> booked your ride
                        </p>
                        <p style={styles.notificationRoute}>
                          📍 {n.from_location} → {n.to_location}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <span style={styles.username}>👤 {userName}</span>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#1a73e8',
    color: 'white',
    position: 'relative',
    zIndex: 1000,
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
  },
  username: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  bellContainer: {
    position: 'relative',
  },
  bell: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    position: 'relative',
    padding: '0',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '36px',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    width: '300px',
    padding: '16px',
    zIndex: 9999,
  },
  dropdownTitle: {
    color: '#333',
    margin: '0 0 12px 0',
    fontSize: '16px',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px',
  },
  dropdownEmpty: {
    color: '#888',
    fontSize: '14px',
    textAlign: 'center',
    padding: '8px 0',
  },
  notificationItem: {
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  notificationText: {
    color: '#333',
    fontSize: '14px',
    margin: '0 0 4px 0',
  },
  notificationRoute: {
    color: '#666',
    fontSize: '12px',
    margin: 0,
  },
};

export default Navbar;