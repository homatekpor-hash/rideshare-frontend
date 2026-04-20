import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = 'https://api.rydeghanas.com';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError(''); setSuccess('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!newPassword.trim()) { setError('Please enter a new password.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/forgot-password`, { email, newPassword });
      setSuccess('✅ Password reset successfully! You can now login.');
      setEmail(''); setNewPassword(''); setConfirmPassword('');
    } catch (e) {
      setError(e.response?.data?.error || 'Email not found. Please check and try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" alt="Ryde" style={styles.logo} />
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>Enter your email and choose a new password</p>

        <input style={styles.input} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="New Password (min 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleReset()} />

        {error && <p style={styles.error}>⚠️ {error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} onClick={handleReset} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        {success && (
          <Link to="/login" style={styles.loginBtn}>Go to Login →</Link>
        )}

        <p style={styles.link}><Link to="/login" style={styles.linkText}>← Back to Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8', padding: '20px' },
  card: { backgroundColor: 'white', borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' },
  logo: { width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px', objectFit: 'cover' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 6px 0' },
  subtitle: { fontSize: '14px', color: '#888', margin: '0 0 24px 0' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  error: { color: '#ea4335', fontSize: '13px', margin: '0 0 14px 0', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '8px', textAlign: 'left' },
  success: { color: '#34a853', fontSize: '13px', margin: '0 0 14px 0', backgroundColor: '#e6f4ea', padding: '10px', borderRadius: '8px', textAlign: 'left' },
  btn: { width: '100%', padding: '15px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' },
  loginBtn: { display: 'block', padding: '14px', backgroundColor: '#34a853', color: 'white', textDecoration: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' },
  link: { fontSize: '14px', color: '#888', margin: 0 },
  linkText: { color: '#1a73e8', fontWeight: 'bold', textDecoration: 'none' },
};

export default ForgotPassword;