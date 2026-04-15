import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const slides = [
    { icon: '🚗', title: 'Welcome to Ryde Ghana!', subtitle: 'Your Journey Awaits', description: 'Ghana\'s smartest ride-sharing app. Connect with drivers going your way across Accra, Kasoa, Tema, Kumasi and beyond.', color: '#1a1a2e' },
    { icon: '🔍', title: 'Find Rides Easily', subtitle: 'Smart Route Matching', description: 'Search for rides along your route. Our smart corridor matching finds drivers going your way — even if they\'re going further!', color: '#1a73e8' },
    { icon: '💬', title: 'Chat with Drivers', subtitle: 'In-App Messaging', description: 'Message your driver before and during the trip. Get real-time updates and ETA directly in the app.', color: '#34a853' },
    { icon: '🛡️', title: 'Safe & Secure', subtitle: 'Your Safety Matters', description: 'All drivers are verified with documents. Share your trip with family. SOS emergency button always available.', color: '#f9a825' },
    { icon: '💰', title: 'Transparent Pricing', subtitle: 'No Hidden Charges', description: 'See the price upfront before booking. Pay via Mobile Money — MTN, Vodafone or AirtelTigo.', color: '#ea4335' },
  ];

  const handleNext = () => {
    if (step < slides.length - 1) { setStep(step + 1); }
    else { localStorage.setItem('onboarded', 'true'); navigate('/register'); }
  };

  const handleSkip = () => { localStorage.setItem('onboarded', 'true'); navigate('/login'); };

  const slide = slides[step];

  return (
    <div style={{...styles.container, backgroundColor: slide.color}}>
      <button style={styles.skipBtn} onClick={handleSkip}>Skip</button>
      <div style={styles.content}>
        <img src="/logo.png" alt="Ryde" style={styles.logo} />
        <div style={styles.iconBox}>
          <p style={styles.icon}>{slide.icon}</p>
        </div>
        <h1 style={styles.title}>{slide.title}</h1>
        <p style={styles.subtitle}>{slide.subtitle}</p>
        <p style={styles.description}>{slide.description}</p>
      </div>
      <div style={styles.bottom}>
        <div style={styles.dots}>
          {slides.map((_, i) => (
            <div key={i} style={{...styles.dot, backgroundColor: i === step ? 'white' : 'rgba(255,255,255,0.3)', width: i === step ? '24px' : '8px'}} />
          ))}
        </div>
        <button style={styles.nextBtn} onClick={handleNext}>
          {step === slides.length - 1 ? '🚗 Get Started' : 'Next →'}
        </button>
        {step > 0 && <button style={styles.backBtn} onClick={() => setStep(step - 1)}>← Back</button>}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 24px', maxWidth: '480px', margin: '0 auto', transition: 'background-color 0.5s ease' },
  skipBtn: { alignSelf: 'flex-end', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' },
  logo: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' },
  iconBox: { width: '120px', height: '120px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: '56px', margin: 0 },
  title: { fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 },
  subtitle: { fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: '500' },
  description: { fontSize: '15px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: '1.6', maxWidth: '320px' },
  bottom: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  dots: { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' },
  dot: { height: '8px', borderRadius: '4px', transition: 'all 0.3s ease' },
  nextBtn: { width: '100%', padding: '16px', backgroundColor: 'white', color: '#333', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  backBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer', padding: '4px' },
};

export default Onboarding;