import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    if (localStorage.getItem('onboarded')) { navigate('/register'); }
    else { navigate('/onboarding'); }
  };
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoRow}>
          <img src="/logo.png" alt="Ryde" style={styles.logo} />
          <span style={styles.logoText}>Ryde</span>
        </div>
        <div style={styles.headerBtns}>
          <Link to="/login" style={styles.loginBtn}>Login</Link>
          <Link to="/register" style={styles.registerBtn}>Sign Up</Link>
        </div>
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <img src="/logo.png" alt="Ryde" style={styles.heroLogo} />
          <h1 style={styles.heroTitle}>Your Journey Awaits</h1>
          <p style={styles.heroSubtitle}>Ghana's smartest ride-sharing app. Connect with drivers going your way across Accra, Kasoa, Tema, Kumasi and beyond.</p>
          <div style={styles.heroBtns}>
            <button onClick={handleGetStarted} style={{...styles.heroRegisterBtn, border: 'none', cursor: 'pointer'}}>?? Get Started</button>
            <Link to="/login" style={styles.heroLoginBtn}>Login</Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={styles.features}>
        <h2 style={styles.featuresTitle}>Why Choose Ryde?</h2>
        <div style={styles.featureGrid}>
          {[
            { icon: '🗺️', title: 'Smart Route Matching', desc: 'Find rides along your route even if the driver is going further. Odorkor to Kasoa? We got you!' },
            { icon: '💬', title: 'In-App Messaging', desc: 'Chat directly with your driver or rider before and during the trip for a smooth experience.' },
            { icon: '⭐', title: 'Ratings & Reviews', desc: 'Rate your experience after every trip. Build trust in the community.' },
            { icon: '🚗', title: 'Vehicle Verified', desc: 'See your driver\'s vehicle details before boarding. Know exactly what to look for.' },
            { icon: '💰', title: 'Transparent Pricing', desc: 'See the price upfront. No hidden charges. Pay what you agreed.' },
            { icon: '🛡️', title: 'Safe & Secure', desc: 'Document verification for all drivers. Your safety is our priority.' },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <p style={styles.featureIcon}>{f.icon}</p>
              <p style={styles.featureTitle}>{f.title}</p>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={styles.howSection}>
        <h2 style={styles.featuresTitle}>How It Works</h2>
        <div style={styles.stepsRow}>
          {[
            { icon: '📱', step: '1', title: 'Create Account', desc: 'Sign up as a rider or driver in seconds' },
            { icon: '🔍', step: '2', title: 'Find a Ride', desc: 'Search for rides along your route' },
            { icon: '🚗', step: '3', title: 'Book & Go', desc: 'Book your seat and ride in comfort' },
          ].map((s, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNum}>{s.step}</div>
              <p style={styles.stepIcon}>{s.icon}</p>
              <p style={styles.stepTitle}>{s.title}</p>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Routes */}
      <div style={styles.routesSection}>
        <h2 style={styles.featuresTitle}>Popular Routes</h2>
        <div style={styles.routesList}>
          {[
            'Accra → Kasoa', 'Accra → Tema', 'Accra → Kumasi',
            'Kaneshie → Kasoa', 'Accra → Cape Coast', 'Accra → Takoradi',
            'Mallam Junction → Kasoa', 'Accra → Winneba', 'Accra → Koforidua',
          ].map((route, i) => (
            <div key={i} style={styles.routeTag}>📍 {route}</div>
          ))}
        </div>
      </div>

      {/* Driver CTA */}
      <div style={styles.driverSection}>
        <div style={styles.driverCard}>
          <p style={styles.driverIcon}>🚗</p>
          <h2 style={styles.driverTitle}>Drive with Ryde</h2>
          <p style={styles.driverDesc}>Earn money on your existing trips. Post your route, pick up passengers going your way and get paid.</p>
          <Link to="/register" style={styles.driverBtn}>Start Driving Today</Link>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerLogoRow}>
          <img src="/logo.png" alt="Ryde" style={styles.footerLogo} />
          <span style={styles.footerLogoText}>Ryde</span>
        </div>
        <p style={styles.footerTagline}>Your Journey Awaits</p>
        <p style={styles.footerCopy}>© 2026 Ryde Ghana. All rights reserved.</p>
        <div style={styles.footerLinks}>
          <Link to="/login" style={styles.footerLink}>Login</Link>
          <Link to="/register" style={styles.footerLink}>Register</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  logo: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
  logoText: { fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e' },
  headerBtns: { display: 'flex', gap: '10px' },
  loginBtn: { padding: '8px 20px', borderRadius: '10px', border: '2px solid #1a1a2e', color: '#1a1a2e', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' },
  registerBtn: { padding: '8px 20px', borderRadius: '10px', backgroundColor: '#1a1a2e', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' },
  hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '60px 24px', textAlign: 'center' },
  heroContent: { maxWidth: '500px', margin: '0 auto' },
  heroLogo: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '24px', border: '4px solid rgba(255,255,255,0.2)' },
  heroTitle: { fontSize: '36px', fontWeight: 'bold', color: 'white', margin: '0 0 16px 0' },
  heroSubtitle: { fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: '0 0 32px 0', lineHeight: '1.6' },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  heroRegisterBtn: { padding: '14px 32px', backgroundColor: '#34a853', color: 'white', textDecoration: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold' },
  heroLoginBtn: { padding: '14px 32px', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.3)' },
  features: { padding: '48px 24px', backgroundColor: 'white' },
  featuresTitle: { fontSize: '26px', fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', margin: '0 0 32px 0' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', maxWidth: '600px', margin: '0 auto' },
  featureCard: { backgroundColor: '#f8f9fa', borderRadius: '16px', padding: '20px', textAlign: 'center' },
  featureIcon: { fontSize: '32px', margin: '0 0 8px 0' },
  featureTitle: { fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 6px 0' },
  featureDesc: { fontSize: '12px', color: '#666', margin: 0, lineHeight: '1.5' },
  howSection: { padding: '48px 24px', backgroundColor: '#f0f4f8' },
  stepsRow: { display: 'flex', gap: '16px', maxWidth: '500px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' },
  stepCard: { flex: 1, minWidth: '130px', backgroundColor: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  stepNum: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1a1a2e', color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' },
  stepIcon: { fontSize: '28px', margin: '0 0 8px 0' },
  stepTitle: { fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 4px 0' },
  stepDesc: { fontSize: '12px', color: '#666', margin: 0 },
  routesSection: { padding: '48px 24px', backgroundColor: 'white' },
  routesList: { display: 'flex', flexWrap: 'wrap', gap: '10px', maxWidth: '600px', margin: '0 auto', justifyContent: 'center' },
  routeTag: { backgroundColor: '#f0fdf4', border: '1px solid #34a853', color: '#1a1a2e', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  driverSection: { padding: '48px 24px', backgroundColor: '#f0f4f8' },
  driverCard: { background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', borderRadius: '24px', padding: '40px 24px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' },
  driverIcon: { fontSize: '48px', margin: '0 0 16px 0' },
  driverTitle: { fontSize: '24px', fontWeight: 'bold', color: 'white', margin: '0 0 12px 0' },
  driverDesc: { fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: '0 0 28px 0', lineHeight: '1.6' },
  driverBtn: { display: 'inline-block', padding: '14px 32px', backgroundColor: '#34a853', color: 'white', textDecoration: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold' },
  footer: { backgroundColor: '#1a1a2e', padding: '40px 24px', textAlign: 'center' },
  footerLogoRow: { display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '8px' },
  footerLogo: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' },
  footerLogoText: { fontSize: '20px', fontWeight: 'bold', color: 'white' },
  footerTagline: { color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 16px 0' },
  footerCopy: { color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 16px 0' },
  footerLinks: { display: 'flex', gap: '16px', justifyContent: 'center' },
  footerLink: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' },
};

export default Home;


