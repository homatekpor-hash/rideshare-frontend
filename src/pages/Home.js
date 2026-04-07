import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={styles.wrapper}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.logo}>🚗 RideShare Ghana</div>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.loginBtn}>Login</Link>
          <Link to="/register" style={styles.registerBtn}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Share the Ride, Share the Cost 🚗</h1>
        <p style={styles.heroSubtitle}>
          Connect with people going your way across Ghana. Save money, make friends, reduce traffic.
        </p>
        <div style={styles.heroButtons}>
          <Link to="/register" style={styles.btnPrimary}>Start as Rider</Link>
          <Link to="/register" style={styles.btnOutline}>Become a Driver</Link>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>📍</div>
          <h3 style={styles.featureTitle}>Same Direction Matching</h3>
          <p style={styles.featureText}>Our smart algorithm matches you with drivers going your exact direction.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>💰</div>
          <h3 style={styles.featureTitle}>Save Money</h3>
          <p style={styles.featureText}>Split fuel costs with other passengers and save up to 70% on transport.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>⭐</div>
          <h3 style={styles.featureTitle}>Trusted Drivers</h3>
          <p style={styles.featureText}>All drivers are rated by passengers so you always know who you are riding with.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>💬</div>
          <h3 style={styles.featureTitle}>In-App Messaging</h3>
          <p style={styles.featureText}>Chat directly with your driver or passenger before the ride.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>🛡️</div>
          <h3 style={styles.featureTitle}>Safe & Secure</h3>
          <p style={styles.featureText}>All drivers are verified with license, ID and insurance documents.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>📱</div>
          <h3 style={styles.featureTitle}>Easy to Use</h3>
          <p style={styles.featureText}>Simple interface for both drivers and riders to manage trips.</p>
        </div>
      </div>

      {/* How it works */}
      <div style={styles.howItWorks}>
        <h2 style={styles.howTitle}>How It Works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepNum}>1</div>
            <h4 style={styles.stepTitle}>Create Account</h4>
            <p style={styles.stepText}>Register as a rider or driver in seconds</p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <div style={styles.stepNum}>2</div>
            <h4 style={styles.stepTitle}>Find or Post a Ride</h4>
            <p style={styles.stepText}>Search for rides or post your route</p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <div style={styles.stepNum}>3</div>
            <h4 style={styles.stepTitle}>Share the Journey</h4>
            <p style={styles.stepText}>Travel together and save money</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <p style={styles.ctaText}>Join thousands of Ghanaians already sharing rides every day.</p>
        <Link to="/register" style={styles.btnPrimary}>Create Free Account</Link>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>© 2026 RideShare Ghana. All rights reserved.</p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { fontFamily: "'Segoe UI', sans-serif" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 1000 },
  logo: { fontSize: '20px', fontWeight: 'bold', color: '#1a73e8' },
  navLinks: { display: 'flex', gap: '12px', alignItems: 'center' },
  loginBtn: { padding: '8px 20px', color: '#1a73e8', textDecoration: 'none', borderRadius: '8px', border: '1px solid #1a73e8', fontSize: '14px', fontWeight: 'bold' },
  registerBtn: { padding: '8px 20px', backgroundColor: '#1a73e8', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' },
  hero: { background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)', color: 'white', padding: '80px 32px', textAlign: 'center' },
  heroTitle: { fontSize: '48px', fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.2' },
  heroSubtitle: { fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' },
  heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { padding: '16px 40px', backgroundColor: 'white', color: '#1a73e8', textDecoration: 'none', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold' },
  btnOutline: { padding: '16px 40px', backgroundColor: 'transparent', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', border: '2px solid white' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', padding: '64px 32px', backgroundColor: '#f8f9fa' },
  feature: { backgroundColor: 'white', padding: '32px 24px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  featureIcon: { fontSize: '40px', marginBottom: '16px' },
  featureTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1a73e8', margin: '0 0 12px 0' },
  featureText: { fontSize: '14px', color: '#666', lineHeight: '1.6', margin: 0 },
  howItWorks: { padding: '64px 32px', textAlign: 'center', backgroundColor: 'white' },
  howTitle: { fontSize: '36px', fontWeight: 'bold', color: '#333', marginBottom: '48px' },
  steps: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  step: { backgroundColor: '#f8f9fa', padding: '32px 24px', borderRadius: '16px', width: '200px', textAlign: 'center' },
  stepNum: { width: '48px', height: '48px', backgroundColor: '#1a73e8', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 16px auto' },
  stepTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
  stepText: { fontSize: '13px', color: '#666', margin: 0 },
  stepArrow: { fontSize: '32px', color: '#1a73e8', fontWeight: 'bold' },
  cta: { backgroundColor: '#1a73e8', color: 'white', padding: '64px 32px', textAlign: 'center' },
  ctaTitle: { fontSize: '36px', fontWeight: 'bold', margin: '0 0 16px 0' },
  ctaText: { fontSize: '18px', opacity: 0.9, margin: '0 0 32px 0' },
  footer: { backgroundColor: '#333', padding: '24px', textAlign: 'center' },
  footerText: { color: '#888', fontSize: '14px', margin: 0 },
};

export default Home;