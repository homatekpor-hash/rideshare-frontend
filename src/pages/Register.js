import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rider');
  const [referralCode, setReferralCode] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelfie = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400; let w = img.width, h = img.height;
        if (w > h) { if (w > maxSize) { h *= maxSize/w; w = maxSize; } } else { if (h > maxSize) { w *= maxSize/h; h = maxSize; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setSelfie(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    setError('');
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!email.trim()) { setError('Email address is required.'); return; }
    if (!phone.trim()) { setError('Phone number is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!selfie) { setError('Please take a selfie photo to verify your identity.'); return; }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/register`, {
        name, email, password, phone, role, referral_code: referralCode,
      });
      const userId = res.data.userId;

      // Upload selfie as profile picture
      await axios.put(`${API}/users/${userId}/picture`, { profile_picture: selfie });
      await axios.put(`${API}/users/${userId}/profile`, { name, phone });

      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', role);

      if (role === 'driver') navigate('/driver');
      else navigate('/rider');
    } catch (e) {
      setError(e.response?.data?.error || 'Email already exists. Please try a different one.');
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

        <input style={styles.input} type="text" placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={styles.input} type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="tel" placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password * (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input style={styles.input} type="text" placeholder="Referral Code (optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />

        {/* Selfie Upload */}
        <div style={styles.selfieSection}>
          <p style={styles.selfieLabel}>📸 Selfie Photo *</p>
          <p style={styles.selfieHint}>Take a clear photo of your face for identity verification</p>
          {selfie ? (
            <div style={styles.selfiePreviewBox}>
              <img src={selfie} alt="Selfie" style={styles.selfiePreview} />
              <button style={styles.retakeBtn} onClick={() => setSelfie(null)}>Retake</button>
            </div>
          ) : (
            <label style={styles.selfieUploadBtn}>
              📷 Take Selfie / Upload Photo
              <input type="file" accept="image/*" capture="user" onChange={handleSelfie} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {error && <p style={styles.error}>⚠️ {error}</p>}

        <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} onClick={handleRegister} disabled={loading}>
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
  logo: { width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px', objectFit: 'cover' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 6px 0' },
  subtitle: { fontSize: '14px', color: '#888', margin: '0 0 20px 0' },
  roleRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  roleBtn: { flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #eee', backgroundColor: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: '500', color: '#555' },
  roleActive: { border: '2px solid #1a73e8', backgroundColor: '#e8f0fe', color: '#1a73e8', fontWeight: 'bold' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#f8f9fa', textAlign: 'left' },
  selfieSection: { marginBottom: '16px', textAlign: 'left' },
  selfieLabel: { fontSize: '14px', fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' },
  selfieHint: { fontSize: '12px', color: '#888', margin: '0 0 10px 0' },
  selfiePreviewBox: { display: 'flex', alignItems: 'center', gap: '12px' },
  selfiePreview: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #34a853' },
  retakeBtn: { padding: '8px 16px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#333' },
  selfieUploadBtn: { display: 'block', textAlign: 'center', padding: '14px', backgroundColor: '#f0fdf4', color: '#34a853', borderRadius: '12px', border: '2px dashed #34a853', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  error: { color: '#ea4335', fontSize: '13px', margin: '0 0 14px 0', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '8px', textAlign: 'left' },
  btn: { width: '100%', padding: '15px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' },
  link: { fontSize: '14px', color: '#888', margin: 0 },
  linkText: { color: '#1a73e8', fontWeight: 'bold', textDecoration: 'none' },
};

export default Register;