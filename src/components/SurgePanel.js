import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://api.rydeghanas.com';

function SurgePanel() {
  const [surge, setSurge] = useState(null);
  const [multiplier, setMultiplier] = useState('1.5');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSurge();
  }, []);

  const fetchSurge = async () => {
    try {
      const res = await axios.get(`${API}/surge`);
      setSurge(res.data);
    } catch (e) {}
  };

  const handleSetSurge = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/admin/surge`, { multiplier, message: message || `${multiplier}x surge active!` });
      setSuccess(`✅ Surge set to ${multiplier}x!`);
      fetchSurge();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {}
    setLoading(false);
  };

  const handleRemoveSurge = async () => {
    try {
      await axios.delete(`${API}/admin/surge`);
      setSuccess('✅ Surge pricing removed!');
      fetchSurge();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {}
  };

  return (
    <div>
      <div style={styles.card}>
        <p style={styles.title}>Current Status</p>
        {surge && (
          <div style={{...styles.statusBox, backgroundColor: surge.isSurge ? '#fce8e6' : '#e6f4ea'}}>
            <p style={{...styles.statusText, color: surge.isSurge ? '#ea4335' : '#34a853'}}>{surge.surgeMessage || 'Normal pricing active'}</p>
            <p style={{...styles.statusMultiplier, color: surge.isSurge ? '#ea4335' : '#34a853'}}>{surge.surgeMultiplier}x</p>
          </div>
        )}
      </div>
      <div style={styles.card}>
        <p style={styles.title}>Set Manual Surge</p>
        <div style={styles.multiplierRow}>
          {['1.2', '1.5', '2.0', '2.5'].map(m => (
            <button key={m} style={{...styles.multiplierBtn, backgroundColor: multiplier === m ? '#ea4335' : '#f0f0f0', color: multiplier === m ? 'white' : '#333'}} onClick={() => setMultiplier(m)}>{m}x</button>
          ))}
        </div>
        <input style={styles.input} type="text" placeholder="Custom message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
        {success && <p style={styles.success}>{success}</p>}
        <button style={{...styles.setBtn, opacity: loading ? 0.7 : 1}} onClick={handleSetSurge} disabled={loading}>
          {loading ? 'Setting...' : `🔴 Set ${multiplier}x Surge`}
        </button>
        <button style={styles.removeBtn} onClick={handleRemoveSurge}>🟢 Remove Surge</button>
      </div>
      <div style={styles.card}>
        <p style={styles.title}>⏰ Automatic Surge Schedule</p>
        {[
          { time: '6AM - 9AM', label: 'Morning Rush', multiplier: '1.5x', color: '#ea4335' },
          { time: '4PM - 8PM', label: 'Evening Rush', multiplier: '1.5x', color: '#ea4335' },
          { time: '10PM - 5AM', label: 'Late Night', multiplier: '1.3x', color: '#f9a825' },
          { time: '9AM - 4PM', label: 'Normal Hours', multiplier: '1.0x', color: '#34a853' },
        ].map((s, i) => (
          <div key={i} style={styles.scheduleRow}>
            <div>
              <p style={styles.scheduleTime}>{s.time}</p>
              <p style={styles.scheduleLabel}>{s.label}</p>
            </div>
            <span style={{...styles.scheduleBadge, backgroundColor: s.color}}>{s.multiplier}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  title: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 16px 0' },
  statusBox: { borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { fontSize: '14px', fontWeight: 'bold', margin: 0 },
  statusMultiplier: { fontSize: '28px', fontWeight: 'bold', margin: 0 },
  multiplierRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  multiplierBtn: { flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
  success: { color: '#34a853', fontSize: '13px', backgroundColor: '#e6f4ea', padding: '10px', borderRadius: '8px', marginBottom: '12px' },
  setBtn: { width: '100%', padding: '14px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' },
  removeBtn: { width: '100%', padding: '14px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  scheduleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  scheduleTime: { fontSize: '14px', fontWeight: 'bold', color: '#333', margin: '0 0 2px 0' },
  scheduleLabel: { fontSize: '12px', color: '#888', margin: 0 },
  scheduleBadge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '13px', fontWeight: 'bold' },
};

export default SurgePanel;