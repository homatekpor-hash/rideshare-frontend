import React, { useState, useEffect } from 'react';

export const isDarkMode = () => localStorage.getItem('darkMode') === 'true';

function DarkModeToggle() {
  const [dark, setDark] = useState(isDarkMode());

  useEffect(() => {
    localStorage.setItem('darkMode', dark);
    document.body.style.backgroundColor = dark ? '#1a1a2e' : '#ffffff';
  }, [dark]);

  return (
    <div style={styles.row}>
      <div>
        <p style={{ ...styles.label, color: dark ? 'white' : '#333' }}>🌙 Dark Mode</p>
        <p style={{ ...styles.sub, color: dark ? 'rgba(255,255,255,0.5)' : '#888' }}>Switch to dark theme</p>
      </div>
      <button
        style={{ ...styles.toggle, backgroundColor: dark ? '#34a853' : '#ddd' }}
        onClick={() => setDark(!dark)}
      >
        <div style={{ ...styles.thumb, transform: dark ? 'translateX(20px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}

const styles = {
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' },
  label: { fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0' },
  sub: { fontSize: '12px', margin: 0 },
  toggle: { width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 },
  thumb: { position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', transition: 'transform 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
};

export default DarkModeToggle;