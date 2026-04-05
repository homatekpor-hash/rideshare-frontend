import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to RideShare 🚗</h1>
      <p style={styles.subtitle}>Find people going your way and share the ride!</p>
      <div style={styles.buttons}>
        <Link to="/find-ride" style={styles.btnPrimary}>Find a Ride</Link>
        <Link to="/post-ride" style={styles.btnSecondary}>Post a Ride</Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh',
    textAlign: 'center',
    padding: '32px',
  },
  title: {
    fontSize: '42px',
    color: '#1a73e8',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '20px',
    color: '#555',
    marginBottom: '32px',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
  },
  btnPrimary: {
    padding: '14px 32px',
    backgroundColor: '#1a73e8',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '18px',
  },
  btnSecondary: {
    padding: '14px 32px',
    backgroundColor: 'white',
    color: '#1a73e8',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    border: '2px solid #1a73e8',
  },
};

export default Home;