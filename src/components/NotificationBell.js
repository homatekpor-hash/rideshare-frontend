import React, { useState } from 'react';

function NotificationBell({ notifications, onClear }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.container}>
      <button style={styles.bell} onClick={() => setShowDropdown(!showDropdown)}>
        🔔
        {unread > 0 && <span style={styles.badge}>{unread}</span>}
      </button>
      {showDropdown && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <p style={styles.dropdownTitle}>Notifications</p>
            {notifications.length > 0 && (
              <button style={styles.clearBtn} onClick={() => { onClear(); setShowDropdown(false); }}>Clear all</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p style={styles.empty}>No notifications yet</p>
          ) : notifications.map((n, i) => (
            <div key={i} style={{...styles.notifItem, backgroundColor: n.read ? 'white' : '#f0f7ff'}}>
              <p style={styles.notifIcon}>{n.icon || '🔔'}</p>
              <div style={{ flex: 1 }}>
                <p style={styles.notifText}>{n.message}</p>
                <p style={styles.notifTime}>{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { position: 'relative' },
  bell: { background: 'white', border: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative', padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' },
  badge: { position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#ea4335', color: 'white', borderRadius: '10px', fontSize: '9px', padding: '2px 5px', fontWeight: 'bold', minWidth: '16px', textAlign: 'center' },
  dropdown: { position: 'absolute', top: '44px', right: 0, width: '280px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 9000, overflow: 'hidden' },
  dropdownHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f0f0f0' },
  dropdownTitle: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: 0 },
  clearBtn: { background: 'none', border: 'none', color: '#1a73e8', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#aaa', padding: '24px', fontSize: '14px', margin: 0 },
  notifItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #f5f5f5' },
  notifIcon: { fontSize: '20px', margin: 0, flexShrink: 0 },
  notifText: { fontSize: '13px', color: '#333', margin: '0 0 4px 0', lineHeight: '1.4' },
  notifTime: { fontSize: '11px', color: '#aaa', margin: 0 },
};

export default NotificationBell;