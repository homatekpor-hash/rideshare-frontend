import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function ChangePassword({ userId }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    setError(''); setMessage('');
    if (!currentPassword) { setError('Please enter your current password.'); return; }
    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/change-password`, { userId, currentPassword, newPassword });
      setMessage('✅ Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e) {
      setError(e.response?.data?.error || '❌ Failed to change password.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.card}>
      <p style={styles.title}>🔑 Change Your Password</p>
      <input style={styles.input} type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <input style={styles.input} type="password" placeholder="New Password (min 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <input style={styles.input} type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChange()} />
      {error && <p style={styles.error}>⚠️ {error}</p>}
      {message && <p style={styles.success}>{message}</p>}
      <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} onClick={handleChange} disabled={loading}>
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </div>
  );
}

const styles = {
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  title: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 20px 0' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  error: { color: '#ea4335', fontSize: '13px', margin: '0 0 12px 0', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '8px' },
  success: { color: '#34a853', fontSize: '13px', margin: '0 0 12px 0', backgroundColor: '#e6f4ea', padding: '10px', borderRadius: '8px' },
  btn: { width: '100%', padding: '14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
};

export default ChangePassword;