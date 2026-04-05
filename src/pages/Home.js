import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={styles.wrapper}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Share the Ride, Share the Cost 🚗</h1>
        <p style={styles.heroSubtitle}>
          Connect with people going your way across Ghana. Save money, make friends, reduce traffic.
        </p>
        <div style={styles.heroButtons}>
          <Link to="/find-ride" style={styles.btnPrimary}>Find a Ride</Link>
          <Link to="/post-ride" style={styles.btnOutline}>Post a Ride</Link>
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
          <p style={styles.featureText}>All drivers are rated by passengers so you always know who you're riding with.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>💬</div>
          <h3 style={styles.featureTitle}>In-App Messaging</h3>
          <p style={styles.featureText}>Chat directly with your driver or passenger before the ride.</p>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <p style={styles.ctaText}>Join thousands of Ghanaians already sharing rides every day.</p>
        <Link to="/register" style={styles.btnPrimary}>Create Free Account</Link>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Segoe UI', sans-serif",
  },
  hero: {
    background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
    color: 'white',
    padding: '80px 32px',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
    lineHeight: '1.2',
  },
  heroSubtitle: {
    fontSize: '20px',
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0 auto 40px auto',
    lineHeight: '1.6',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '16px 40px',
    backgroundColor: 'white',
    color: '#1a73e8',
    textDecoration: 'none',
    borderRadius: '50px',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  btnOutline: {
    padding: '16px 40px',
    backgroundColor: 'transparent',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '50px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: '2px solid white',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    padding: '64px 32px',
    backgroundColor: '#f8f9fa',
  },
  feature: {
    backgroundColor: 'white',
    padding: '32px 24px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  featureIcon: {
    fontSize: '40px',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a73e8',
    margin: '0 0 12px 0',
  },
  featureText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    margin: 0,
  },
  cta: {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '64px 32px',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
  },
  ctaText: {
    fontSize: '18px',
    opacity: 0.9,
    margin: '0 0 32px 0',
  },
};

export default Home;