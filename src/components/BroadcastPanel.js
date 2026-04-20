import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://api.rydeghanas.com';

function BroadcastPanel() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleBroadcast = async () => {
    setError(''); setSuccess('');
    if (!message.trim()) { setError('Please enter a message.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/broadcast`, { title, message, target });
      setSuccess('✅ ' + res.data.message);
      setTitle(''); setMessage('');
    } catch (e) {
      setError('Failed to send broadcast.');
    }
    setLoading(false);
  };

  const templates = [
    { title: 'Welcome', message: 'Welcome to Ryde Ghana! Book your first ride today and enjoy seamless travel across Ghana.', target: 'riders' },
    { title: 'Driver Tips', message: 'Keep your vehicle clean and ratings high! Drivers with 4.5+ ratings get priority ride requests.', target: 'drivers' },
    { title: 'Maintenance Notice', message: 'Ryde will undergo maintenance tonight from 12AM-2AM. Services may be temporarily unavailable.', target: 'all' },
    { title: 'Promo Alert', message: 'Special offer! Use promo code RYDE10 for GHC 10 off your next ride. Valid this weekend only!', target: 'riders' },
    { title: 'Driver Bonus', message: 'Complete 10 rides this week and earn a GHC 20 bonus! Offer valid until Sunday.', target: 'drivers' },
  ];

  const targets = [
    { id: 'all', label: 'All Users', color: '#1a1a2e' },
    { id: 'riders', label: 'Riders Only', color: '#34a853' },
    { id: 'drivers', label: 'Drivers Only', color: '#1a73e8' },
  ];

  return (
    <div>
      <div style={styles.card}>
        <p style={styles.sectionTitle}>Send Announcement</p>
        <p style={styles.subTitle}>Select who receives this message:</p>
        <div style={styles.targetRow}>
          {targets.map(t => (
            <button key={t.id} style={{...styles.targetBtn, backgroundColor: target === t.id ? t.color : '#f0f0f0', color: target === t.id ? 'white' : '#333'}} onClick={() => setTarget(t.id)}>{t.label}</button>
          ))}
        </div>
        <div style={{...styles.targetInfo, backgroundColor: target === 'riders' ? '#e6f4ea' : target === 'drivers' ? '#e8f0fe' : '#f5f5f5'}}>
          <p style={{...styles.targetInfoText, color: target === 'riders' ? '#34a853' : target === 'drivers' ? '#1a73e8' : '#333'}}>
            {target === 'all' ? 'This message will be sent to ALL users (drivers + riders)' : target === 'riders' ? 'This message will ONLY be sent to Riders' : 'This message will ONLY be sent to Drivers'}
          </p>
        </div>
        <input style={styles.input} type="text" placeholder="Title (e.g. Important Update)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea style={styles.textarea} placeholder="Message to send..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.successMsg}>{success}</p>}
        <button style={{...styles.sendBtn, opacity: loading ? 0.7 : 1, backgroundColor: target === 'riders' ? '#34a853' : target === 'drivers' ? '#1a73e8' : '#1a1a2e'}} onClick={handleBroadcast} disabled={loading}>
          {loading ? 'Sending...' : `Send to ${target === 'all' ? 'All Users' : target === 'riders' ? 'Riders Only' : 'Drivers Only'}`}
        </button>
      </div>
      <div style={styles.card}>
        <p style={styles.sectionTitle}>Quick Templates</p>
        {templates.map((t, i) => (
          <div key={i} style={{...styles.template, borderLeft: `4px solid ${t.target === 'riders' ? '#34a853' : t.target === 'drivers' ? '#1a73e8' : '#1a1a2e'}`}} onClick={() => { setTitle(t.title); setMessage(t.message); setTarget(t.target); }}>
            <div style={styles.templateTop}>
              <p style={styles.templateTitle}>{t.title}</p>
              <span style={{...styles.targetTag, backgroundColor: t.target === 'riders' ? '#e6f4ea' : t.target === 'drivers' ? '#e8f0fe' : '#f0f0f0', color: t.target === 'riders' ? '#34a853' : t.target === 'drivers' ? '#1a73e8' : '#333'}}>{t.target}</span>
            </div>
            <p style={styles.templateMsg}>{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' },
  subTitle: { fontSize: '13px', color: '#888', margin: '0 0 12px 0' },
  targetRow: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' },
  targetBtn: { flex: 1, padding: '10px 8px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', minWidth: '100px' },
  targetInfo: { borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' },
  targetInfoText: { fontSize: '13px', fontWeight: '500', margin: 0 },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  textarea: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#f8f9fa', resize: 'vertical' },
  error: { color: '#ea4335', fontSize: '13px', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '8px', marginBottom: '12px', margin: '0 0 12px 0' },
  successMsg: { color: '#34a853', fontSize: '13px', backgroundColor: '#e6f4ea', padding: '10px', borderRadius: '8px', marginBottom: '12px', margin: '0 0 12px 0' },
  sendBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  template: { backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '14px', marginBottom: '10px', cursor: 'pointer', border: '1px solid #eee' },
  templateTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  templateTitle: { fontSize: '14px', fontWeight: 'bold', color: '#333', margin: 0 },
  targetTag: { padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  templateMsg: { fontSize: '13px', color: '#666', margin: 0 },
};

export default BroadcastPanel;