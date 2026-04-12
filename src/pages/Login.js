import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true); setError('');
    if (!email.trim()) { setError('Please enter your email.'); setLoading(false); return; }
    if (!password.trim()) { setError('Please enter your password.'); setLoading(false); return; }
    try {
      const res = await axios.post(`${API}/login`, { email, password });
      const { userId, name, role, isOnline } = res.data;
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', role);
      localStorage.setItem('isOnline', isOnline ? '1' : '0');
      if (role === 'admin') navigate('/admin');
      else if (role === 'driver') navigate('/driver');
      else navigate('/rider');
    } catch (e) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" alt="Ryde" style={styles.logo} />
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Login to your Ryde account</p>
        <input style={styles.input} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
        {error && <p style={styles.error}>⚠️ {error}</p>}
        <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
        <p style={styles.link}>Don't have an account? <Link to="/register" style={styles.linkText}>Register here</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8', padding: '20px' },
  card: { backgroundColor: 'white', borderRadius: '24px', padding: '40px 32px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' },
  logo: { width: '100px', height: '100px', borderRadius: '50%', marginBottom: '20px', objectFit: 'cover' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 8px 0' },
  subtitle: { fontSize: '14px', color: '#888', margin: '0 0 28px 0' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', outline: 'none', marginBottom: '14px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  error: { color: '#ea4335', fontSize: '13px', margin: '0 0 14px 0', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '8px', textAlign: 'left' },
  btn: { width: '100%', padding: '15px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' },
  forgotLink: { display: 'block', color: '#1a73e8', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', marginBottom: '16px' },
  link: { fontSize: '14px', color: '#888', margin: 0 },
  linkText: { color: '#1a73e8', fontWeight: 'bold', textDecoration: 'none' },
};

export default Login; 
