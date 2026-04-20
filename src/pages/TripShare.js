import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API = 'https://api.rydeghanas.com';

function TripShare() {
  const { bookingId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`${API}/trip-share/${bookingId}`);
        setTrip(res.data.trip);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchTrip();
    const interval = setInterval(fetchTrip, 10000);
    return () => clearInterval(interval);
  }, [bookingId]);

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.loadingBox}>
        <img src="/logo.png" alt="Ryde" style={styles.logo} />
        <p style={styles.loadingText}>Loading trip details...</p>
      </div>
    </div>
  );

  if (!trip) return (
    <div style={styles.container}>
      <div style={styles.loadingBox}>
        <img src="/logo.png" alt="Ryde" style={styles.logo} />
        <p style={styles.loadingText}>Trip not found.</p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="/logo.png" alt="Ryde" style={styles.headerLogo} />
        <p style={styles.headerTitle}>Ryde Trip Tracker</p>
      </div>
      <div style={styles.card}>
        <div style={{...styles.statusBadge, backgroundColor: trip.status === 'started' ? '#1a73e8' : trip.status === 'accepted' ? '#34a853' : trip.status === 'completed' ? '#888' : '#f9a825'}}>
          {trip.status === 'started' ? '🚗 Trip in Progress' : trip.status === 'accepted' ? '🟢 Driver on the way' : trip.status === 'completed' ? '✅ Trip Completed' : '⏳ Pending'}
        </div>
        <div style={styles.passengerRow}>
          <div style={styles.passengerAvatar}>{trip.passenger_name?.charAt(0)}</div>
          <div>
            <p style={styles.passengerName}>{trip.passenger_name}</p>
            <p style={styles.passengerLabel}>Passenger</p>
          </div>
        </div>
        <div style={styles.routeBox}>
          <div style={styles.routeRow}>
            <div style={styles.routeDotGreen} />
            <div>
              <p style={styles.routeLabel}>From</p>
              <p style={styles.routeText}>{trip.from_location}</p>
            </div>
          </div>
          <div style={styles.routeLine} />
          <div style={styles.routeRow}>
            <div style={styles.routeDotRed} />
            <div>
              <p style={styles.routeLabel}>To</p>
              <p style={styles.routeText}>{trip.to_location}</p>
            </div>
          </div>
        </div>
        <div style={styles.driverBox}>
          <p style={styles.driverTitle}>🚗 Driver Details</p>
          <p style={styles.driverName}>{trip.driver_name}</p>
          {trip.driver_phone && <a href={`tel:${trip.driver_phone}`} style={styles.callBtn}>📞 Call Driver: {trip.driver_phone}</a>}
          {trip.vehicle_number && <p style={styles.vehicleText}>🚗 {trip.vehicle_color} {trip.vehicle_model} | {trip.vehicle_number}</p>}
        </div>
        <p style={styles.fareText}>💰 Fare: GH₵ {trip.price}</p>
        <p style={styles.updateText}>🔄 Updates every 10 seconds</p>
      </div>
      <div style={styles.footer}>
        <p style={styles.footerText}>Powered by Ryde Ghana 🇬🇭</p>
        <a href="https://rideshare-frontend-blush.vercel.app" style={styles.footerLink}>Download Ryde App</a>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
  loadingBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' },
  logo: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
  loadingText: { fontSize: '16px', color: '#888' },
  header: { backgroundColor: '#1a1a2e', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' },
  headerLogo: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: '18px', margin: 0 },
  card: { margin: '20px', backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  statusBadge: { color: 'white', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginBottom: '20px' },
  passengerRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px' },
  passengerAvatar: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', color: 'white' },
  passengerName: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 2px 0' },
  passengerLabel: { fontSize: '12px', color: '#888', margin: 0 },
  routeBox: { backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  routeRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  routeDotGreen: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#34a853', flexShrink: 0 },
  routeDotRed: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ea4335', flexShrink: 0 },
  routeLine: { width: '2px', height: '20px', backgroundColor: '#ddd', marginLeft: '5px', marginTop: '4px', marginBottom: '4px' },
  routeLabel: { fontSize: '11px', color: '#888', margin: '0 0 2px 0', fontWeight: 'bold', textTransform: 'uppercase' },
  routeText: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: 0 },
  driverBox: { backgroundColor: '#e8f0fe', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  driverTitle: { fontSize: '13px', color: '#1a73e8', fontWeight: 'bold', margin: '0 0 8px 0' },
  driverName: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
  callBtn: { display: 'block', color: '#34a853', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' },
  vehicleText: { fontSize: '13px', color: '#555', margin: 0 },
  fareText: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
  updateText: { fontSize: '12px', color: '#aaa', margin: 0, textAlign: 'center' },
  footer: { textAlign: 'center', padding: '24px' },
  footerText: { fontSize: '13px', color: '#888', margin: '0 0 8px 0' },
  footerLink: { color: '#1a73e8', fontWeight: 'bold', fontSize: '14px' },
};

export default TripShare;