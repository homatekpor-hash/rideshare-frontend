import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Please fill in all fields.');
      return;
    }
    try {
      const response = await axios.post(`${API}/login`, { email, password });
      const { userId, name, role, phone, profilePicture, isOnline, walletBalance, referralCode } = response.data;
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userPhone', phone || '');
      localStorage.setItem('profilePicture', profilePicture || '');
      localStorage.setItem('isOnline', isOnline);
      localStorage.setItem('walletBalance', walletBalance || 0);
      localStorage.setItem('referralCode', referralCode || '');

      if (role === 'admin') navigate('/admin');
      else if (role === 'driver') navigate('/driver');
      else navigate('/rider');
    } catch (error) {
      setMessage('Invalid email or password. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🚗</div>
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Login to your RideShare account</p>

        <input style={styles.input} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button style={styles.button} onClick={handleLogin}>Login</button>

        {message && <p style={styles.error}>{message}</p>}

        <p style={styles.registerLink}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '32px' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '400px' },
  logo: { textAlign: 'center', fontSize: '48px' },
  title: { textAlign: 'center', color: '#1a73e8', margin: 0, fontSize: '28px' },
  subtitle: { textAlign: 'center', color: '#888', margin: 0, fontSize: '14px' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' },
  button: { padding: '14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  error: { textAlign: 'center', color: '#ea4335', margin: 0, fontSize: '14px' },
  registerLink: { textAlign: 'center', color: '#888', fontSize: '14px', margin: 0 },
  link: { color: '#1a73e8', textDecoration: 'none', fontWeight: 'bold' },
};

export default Login;