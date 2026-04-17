import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function FAQItem({ question, answer }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={faqStyles.container} onClick={() => setOpen(!open)}>
      <div style={faqStyles.header}>
        <p style={faqStyles.question}>{question}</p>
        <span style={faqStyles.arrow}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <p style={faqStyles.answer}>{answer}</p>}
    </div>
  );
}

const faqStyles = {
  container: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '10px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e', margin: 0, flex: 1 },
  arrow: { fontSize: '12px', color: '#34a853', marginLeft: '12px', fontWeight: 'bold' },
  answer: { fontSize: '14px', color: '#555', lineHeight: '1.6', margin: '12px 0 0 0', paddingTop: '12px', borderTop: '1px solid #f0f0f0' },
};

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
            <button onClick={handleGetStarted} style={{...styles.heroRegisterBtn, border: 'none', cursor: 'pointer'}}>Get Started</button>
            <Link to="/login" style={styles.heroLoginBtn}>Login</Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={styles.features}>
        <h2 style={styles.featuresTitle}>Why Choose Ryde?</h2>
        <div style={styles.featureGrid}>
          {[
            { icon: '🗺️', title: 'Smart Route Matching', desc: 'Find rides along your route even if the driver is going further.' },
            { icon: '💬', title: 'In-App Messaging', desc: 'Chat directly with your driver before and during the trip.' },
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

      {/* Popular Routes */}
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

      {/* Success Stories */}
      <div style={styles.stories}>
        <h2 style={styles.storiesTitle}>What Our Users Say</h2>
        <div style={styles.storiesGrid}>
          {[
            { name: 'Abena K.', role: 'Rider', text: 'Ryde has made my daily commute from Ablekuma to Accra so easy! I save money and always get a safe ride.', rating: 5 },
            { name: 'Kwame A.', role: 'Driver', text: 'I have been earning consistently since joining Ryde. The app is easy to use and passengers are respectful.', rating: 5 },
            { name: 'Ama S.', role: 'Rider', text: 'I love that I can track my ride and share it with my family. Feels very safe to use!', rating: 5 },
          ].map((story, i) => (
            <div key={i} style={styles.storyCard}>
              <div style={styles.storyStars}>{'⭐'.repeat(story.rating)}</div>
              <p style={styles.storyText}>"{story.text}"</p>
              <div style={styles.storyAuthor}>
                <div style={styles.storyAvatar}>{story.name.charAt(0)}</div>
                <div>
                  <p style={styles.storyName}>{story.name}</p>
                  <p style={styles.storyRole}>{story.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={styles.faqSection}>
        <h2 style={styles.featuresTitle}>Frequently Asked Questions</h2>
        {[
          { q: 'How does Ryde work?', a: 'Ryde connects riders with drivers going the same way. Search for your route, find a driver, book and pay via Mobile Money.' },
          { q: 'How much does a ride cost?', a: 'Prices are set by drivers and vary by route. You see the full price before booking. No hidden charges!' },
          { q: 'How do I become a driver?', a: 'Register as a driver, upload your documents, get verified by admin and start earning!' },
          { q: 'Is Ryde safe?', a: 'Yes! All drivers are verified. You can share your live trip with family and use the SOS button in emergencies.' },
          { q: 'How do I pay?', a: 'We accept MTN Mobile Money, Vodafone Cash and AirtelTigo Money via Paystack.' },
          { q: 'How do drivers get paid?', a: 'Drivers earn 90% of the fare. Withdraw earnings anytime to your Mobile Money account.' },
          { q: 'Which routes does Ryde cover?', a: 'We cover 40+ routes across Ghana including Accra, Kasoa, Tema, Kumasi, Cape Coast and many more!' },
        ].map((item, i) => (
          <FAQItem key={i} question={item.q} answer={item.a} />
        ))}
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
  container: { fontFamily: 'sans-serif', backgroundColor: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#1a1a2e', position: 'sticky', top: 0, zIndex: 100 },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  logo: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' },
  logoText: { color: 'white', fontWeight: 'bold', fontSize: '20px' },
  headerBtns: { display: 'flex', gap: '10px' },
  loginBtn: { color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.3)' },
  registerBtn: { backgroundColor: '#34a853', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' },
  hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '60px 24px', textAlign: 'center' },
  heroContent: { maxWidth: '480px', margin: '0 auto' },
  heroLogo: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px', border: '3px solid #34a853' },
  heroTitle: { fontSize: '32px', fontWeight: 'bold', color: 'white', margin: '0 0 16px 0' },
  heroSubtitle: { fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: '0 0 32px 0', lineHeight: '1.6' },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  heroRegisterBtn: { backgroundColor: '#34a853', color: 'white', padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none' },
  heroLoginBtn: { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '14px 32px', borderRadius: '12px', fontSize: '16px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' },
  features: { padding: '48px 24px', backgroundColor: '#f8f9fa' },
  featuresTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', margin: '0 0 32px 0' },
  featureGrid: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px', margin: '0 auto' },
  featureCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  featureIcon: { fontSize: '32px', margin: '0 0 12px 0' },
  featureTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 8px 0' },
  featureDesc: { fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.5' },
  howSection: { padding: '48px 24px', backgroundColor: 'white' },
  stepsRow: { display: 'flex', gap: '12px', justifyContent: 'center', maxWidth: '480px', margin: '0 auto', flexWrap: 'wrap' },
  stepCard: { flex: 1, minWidth: '120px', textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '16px' },
  stepNum: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#34a853', color: 'white', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' },
  stepIcon: { fontSize: '24px', margin: '0 0 8px 0' },
  stepTitle: { fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 4px 0' },
  stepDesc: { fontSize: '12px', color: '#888', margin: 0 },
  routesSection: { padding: '48px 24px', backgroundColor: '#f8f9fa' },
  routesList: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '480px', margin: '0 auto' },
  routeTag: { backgroundColor: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', color: '#333', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', fontWeight: '500' },
  stories: { padding: '48px 24px', backgroundColor: 'white' },
  storiesTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', margin: '0 0 32px 0' },
  storiesGrid: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px', margin: '0 auto' },
  storyCard: { backgroundColor: '#f8f9fa', borderRadius: '16px', padding: '20px' },
  storyStars: { fontSize: '16px', marginBottom: '10px' },
  storyText: { fontSize: '14px', color: '#555', lineHeight: '1.6', margin: '0 0 14px 0', fontStyle: 'italic' },
  storyAuthor: { display: 'flex', alignItems: 'center', gap: '10px' },
  storyAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'white' },
  storyName: { fontSize: '14px', fontWeight: 'bold', color: '#333', margin: 0 },
  storyRole: { fontSize: '12px', color: '#888', margin: 0 },
  faqSection: { padding: '48px 24px', backgroundColor: '#f8f9fa', maxWidth: '480px', margin: '0 auto' },
  driverSection: { padding: '48px 24px', backgroundColor: '#1a1a2e' },
  driverCard: { textAlign: 'center', maxWidth: '480px', margin: '0 auto' },
  driverIcon: { fontSize: '48px', margin: '0 0 16px 0' },
  driverTitle: { fontSize: '24px', fontWeight: 'bold', color: 'white', margin: '0 0 12px 0' },
  driverDesc: { fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: '0 0 24px 0', lineHeight: '1.6' },
  driverBtn: { backgroundColor: '#34a853', color: 'white', padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' },
  footer: { backgroundColor: '#0f0f1a', padding: '32px 24px', textAlign: 'center' },
  footerLogoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' },
  footerLogo: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' },
  footerLogoText: { color: 'white', fontWeight: 'bold', fontSize: '18px' },
  footerTagline: { color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 8px 0' },
  footerCopy: { color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 16px 0' },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: '20px' },
  footerLink: { color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px' },
};

export default Home;