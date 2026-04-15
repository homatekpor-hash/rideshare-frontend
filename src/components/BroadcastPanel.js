import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function BroadcastPanel() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleBroadcast = async () => {
    setError(''); setSuccess('');
    if (!message.trim()) { setError('Please enter a message.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/broadcast`, { title, message });
      setSuccess(`✅ ${res.data.message}`);
      setTitle(''); setMessage('');
    } catch (e) {
      setError('❌ Failed to send broadcast.');
    }
    setLoading(false);
  };

  const templates = [
    { title: '🎉 Welcome', message: 'Welcome to Ryde Ghana! Book your first ride today and enjoy seamless travel across Ghana.' },
    { title: '🚗 New Feature', message: 'Exciting new features are now available on Ryde! Update your app to enjoy the latest improvements.' },
    { title: '⚠️ Maintenance', message: 'Ryde will undergo maintenance tonight from 12AM-2AM. Services may be temporarily unavailable.' },
    { title: '🎁 Promo', message: 'Special offer! Use promo code RYDE10 for GH₵ 10 off your next ride. Valid this weekend only!' },
  ];

  return (
    <div>
      <div style={styles.card}>
        <p style={styles.sectionTitle}>📢 Send Announcement to All Users</p>
        <input style={styles.input} type="text" placeholder="Title (e.g. Important Update)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea style={styles.textarea} placeholder="Message to send to all drivers and riders..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <button style={{...styles.sendBtn, opacity: loading ? 0.7 : 1}} onClick={handleBroadcast} disabled={loading}>
          {loading ? 'Sending...' : '📢 Send to All Users'}
        </button>
      </div>
      <div style={styles.card}>
        <p style={styles.sectionTitle}>📋 Quick Templates</p>
        {templates.map((t, i) => (
          <div key={i} style={styles.template} onClick={() => { setTitle(t.title); setMessage(t.message); }}>
            <p style={styles.templateTitle}>{t.title}</p>
            <p style={styles.templateMsg}>{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 16px 0' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  textarea: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#f8f9fa', resize: 'vertical' },
  error: { color: '#ea4335', fontSize: '13px', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '8px', marginBottom: '12px' },
  success: { color: '#34a853', fontSize: '13px', backgroundColor: '#e6f4ea', padding: '10px', borderRadius: '8px', marginBottom: '12px' },
  sendBtn: { width: '100%', padding: '14px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  template: { backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '14px', marginBottom: '10px', cursor: 'pointer', border: '1px solid #eee' },
  templateTitle: { fontSize: '14px', fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' },
  templateMsg: { fontSize: '13px', color: '#666', margin: 0 },
};

export default BroadcastPanel;