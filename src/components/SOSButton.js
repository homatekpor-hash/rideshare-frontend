import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function SOSButton({ userId }) {
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    if (loading) return;
    const confirm = window.confirm('🆘 Send SOS Emergency Alert?\n\nThis will alert Ryde admin and log your location.');
    if (!confirm) return;
    setLoading(true);
    try {
      let location = 'Location unavailable';
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        location = `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`;
      } catch (e) {}
      await axios.post(`${API}/sos`, { userId, location });
      setPressed(true);
      alert('🆘 SOS Alert Sent!\n\nRyde admin has been notified. Stay calm, help is on the way.\n\nAlso call 191 for police or 193 for ambulance.');
    } catch (e) {
      alert('❌ Failed to send SOS. Please call 191 directly.');
    }
    setLoading(false);
  };

  return (
    <button style={{...styles.sos, backgroundColor: pressed ? '#888' : '#ea4335', animation: pressed ? 'none' : 'pulse 1.5s infinite'}} onClick={handleSOS} disabled={loading}>
      <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(234,67,53,0.4); } 70% { box-shadow: 0 0 0 10px rgba(234,67,53,0); } 100% { box-shadow: 0 0 0 0 rgba(234,67,53,0); } }`}</style>
      {loading ? '⏳' : '🆘'}
      <span style={styles.label}>{loading ? 'Sending...' : pressed ? 'SOS Sent' : 'SOS'}</span>
    </button>
  );
}

const styles = {
  sos: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', border: 'none', cursor: 'pointer', color: 'white', fontSize: '20px', boxShadow: '0 4px 15px rgba(234,67,53,0.4)' },
  label: { fontSize: '9px', fontWeight: 'bold', marginTop: '2px' },
};

export default SOSButton;