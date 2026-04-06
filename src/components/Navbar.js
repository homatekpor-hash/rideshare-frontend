import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function Navbar() {
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications/${userId}`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>🚗 RideShare</Link>
      <div style={styles.links}>
        <Link to="/" style={{...styles.link, ...(isActive('/') ? styles.activeLink : {})}}>Home</Link>
        <Link to="/find-ride" style={{...styles.link, ...(isActive('/find-ride') ? styles.activeLink : {})}}>Find Ride</Link>
        <Link to="/post-ride" style={{...styles.link, ...(isActive('/post-ride') ? styles.activeLink : {})}}>Post Ride</Link>
        <Link to="/my-rides" style={{...styles.link, ...(isActive('/my-rides') ? styles.activeLink : {})}}>My Rides</Link>
        <Link to="/earnings" style={{...styles.link, ...(isActive('/earnings') ? styles.activeLink : {})}}>Earnings</Link>
        <Link to="/messages" style={{...styles.link, ...(isActive('/messages') ? styles.activeLink : {})}}>Messages</Link>
        <Link to="/ratings" style={{...styles.link, ...(isActive('/ratings') ? styles.activeLink : {})}}>Ratings</Link>
        <Link to="/profile" style={{...styles.link, ...(isActive('/profile') ? styles.activeLink : {})}}>Profile</Link>
        <Link to="/admin" style={{...styles.link, ...(isActive('/admin') ? styles.activeLink : {})}}>Admin</Link>
        {userName ? (
          <>
            <div style={styles.bellContainer}>
              <button style={styles.bell} onClick={() => setShowNotifications(!showNotifications)}>
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
            <div style={styles.userBadge}>👤 {userName}</div>
            <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <div style={styles.authButtons}>
            <Link to="/login" style={styles.loginBtn}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </div>
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
    padding: '0 24px',
    backgroundColor: '#1a73e8',
    height: '64px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    overflowX: 'auto',
  },
  logo: { fontSize: '20px', fontWeight: 'bold', color: 'white', textDecoration: 'none', whiteSpace: 'nowrap' },
  links: { display: 'flex', alignItems: 'center', gap: '4px' },
  link: { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '13px', padding: '6px 8px', borderRadius: '8px', whiteSpace: 'nowrap' },
  activeLink: { color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', fontWeight: 'bold' },
  authButtons: { display: 'flex', gap: '8px', marginLeft: '8px' },
  loginBtn: { color: 'white', textDecoration: 'none', fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.5)', whiteSpace: 'nowrap' },
  registerBtn: { color: '#1a73e8', textDecoration: 'none', fontSize: '13px', padding: '8px 16px', borderRadius: '8px', backgroundColor: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' },
  userBadge: { color: 'white', fontSize: '13px', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' },
  logoutBtn: { color: 'white', fontSize: '13px', padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,0,0,0.3)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' },
  bellContainer: { position: 'relative', marginLeft: '4px' },
  bell: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative', padding: '0' },
  badge: { position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ea4335', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropdown: { position: 'absolute', top: '36px', right: '0', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', width: '300px', padding: '16px', zIndex: 9999 },
  dropdownTitle: { color: '#333', margin: '0 0 12px 0', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' },
  dropdownEmpty: { color: '#888', fontSize: '14px', textAlign: 'center', padding: '8px 0' },
  notificationItem: { padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  notificationText: { color: '#333', fontSize: '14px', margin: '0 0 4px 0' },
  notificationRoute: { color: '#666', fontSize: '12px', margin: 0 },
};

export default Navbar;