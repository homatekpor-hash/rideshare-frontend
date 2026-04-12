import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rider');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/register`, { name, email, password, role, referral_code: referralCode });
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', role);
      if (role === 'driver') navigate('/driver');
      else navigate('/rider');
    } catch (e) {
      setError('Email already exists. Please try a different one.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" alt="Ryde" style={styles.logo} />
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join Ryde Ghana today</p>
        <div style={styles.roleRow}>
          <button style={{...styles.roleBtn, ...(role === 'rider' ? styles.roleActive : {})}} onClick={() => setRole('rider')}>🧑 I am a Rider</button>
          <button style={{...styles.roleBtn, ...(role === 'driver' ? styles.roleActive : {})}} onClick={() => setRole('driver')}>🚗 I am a Driver</button>
        </div>
        <input style={styles.input} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={styles.input} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input style={styles.input} type="text" placeholder="Referral Code (optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} onClick={handleRegister} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        <p style={styles.link}>Already have an account? <Link to="/login" style={styles.linkText}>Login here</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8', padding: '20px' },
  card: { backgroundColor: 'white', borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' },
  logo: { width: '120px', height: '120px', borderRadius: '50%', marginBottom: '20px', objectFit: 'cover' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 8px 0' },
  subtitle: { fontSize: '14px', color: '#888', margin: '0 0 20px 0' },
  roleRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  roleBtn: { flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #eee', backgroundColor: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: '500', color: '#555' },
  roleActive: { border: '2px solid #1a73e8', backgroundColor: '#e8f0fe', color: '#1a73e8', fontWeight: 'bold' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', outline: 'none', marginBottom: '14px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  error: { color: '#ea4335', fontSize: '13px', margin: '0 0 14px 0' },
  btn: { width: '100%', padding: '15px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' },
  link: { fontSize: '14px', color: '#888', margin: 0 },
  linkText: { color: '#1a73e8', fontWeight: 'bold', textDecoration: 'none' },
};

export default Register;