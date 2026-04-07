import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rider');
  const [referralCode, setReferralCode] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setMessage('Please fill in all fields.');
      return;
    }
    try {
      const response = await axios.post(`${API}/register`, {
        name, email, password, role, referral_code: referralCode
      });
      setSuccess(true);
      setMessage(`Account created! Your referral code is: ${response.data.referralCode}`);
    } catch (error) {
      setMessage('Email already exists. Please try a different one.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account 🚗</h2>
        <p style={styles.subtitle}>Join RideShare Ghana today</p>

        {/* Role Selector */}
        <div style={styles.roleRow}>
          <button
            style={{...styles.roleBtn, ...(role === 'rider' ? styles.roleActive : {})}}
            onClick={() => setRole('rider')}
          >
            🧑 I am a Rider
          </button>
          <button
            style={{...styles.roleBtn, ...(role === 'driver' ? styles.roleActive : {})}}
            onClick={() => setRole('driver')}
          >
            🚗 I am a Driver
          </button>
        </div>

        <input style={styles.input} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={styles.input} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input style={styles.input} type="text" placeholder="Referral Code (optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />

        <button style={styles.button} onClick={handleRegister}>Create Account</button>

        {message && (
          <p style={{...styles.message, color: success ? '#34a853' : '#ea4335'}}>{message}</p>
        )}

        <p style={styles.loginLink}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '32px' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '420px' },
  title: { textAlign: 'center', color: '#1a73e8', margin: 0, fontSize: '28px' },
  subtitle: { textAlign: 'center', color: '#888', margin: 0, fontSize: '14px' },
  roleRow: { display: 'flex', gap: '8px' },
  roleBtn: { flex: 1, padding: '12px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', backgroundColor: 'white', color: '#333' },
  roleActive: { borderColor: '#1a73e8', backgroundColor: '#e8f0fe', color: '#1a73e8' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' },
  button: { padding: '14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  message: { textAlign: 'center', margin: 0, fontSize: '14px', padding: '12px', borderRadius: '8px', backgroundColor: '#f8f9fa' },
  loginLink: { textAlign: 'center', color: '#888', fontSize: '14px', margin: 0 },
  link: { color: '#1a73e8', textDecoration: 'none', fontWeight: 'bold' },
};

export default Register;