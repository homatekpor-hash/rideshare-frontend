import React, { useState } from 'react';
import axios from 'axios';
import MapPicker from '../components/MapPicker';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function PostRide() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [fromLat, setFromLat] = useState(null);
  const [fromLng, setFromLng] = useState(null);
  const [toLat, setToLat] = useState(null);
  const [toLng, setToLng] = useState(null);
  const [seats, setSeats] = useState('');
  const [price, setPrice] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [message, setMessage] = useState('');

  const handlePostRide = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setMessage('Please login first before posting a ride.');
      return;
    }
    if (!fromLat || !toLat) {
      setMessage('Please select both pickup and dropoff locations on the map.');
      return;
    }
    try {
      await axios.post(`${API}/rides`, {
        driver_id: userId,
        from_location: fromLocation,
        to_location: toLocation,
        from_lat: fromLat,
        from_lng: fromLng,
        to_lat: toLat,
        to_lng: toLng,
        seats_available: seats,
        departure_time: departureTime,
        price: price || 0,
      });
      setMessage('Ride posted successfully!');
    } catch (error) {
      setMessage('Error posting ride. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Post a Ride 🚗</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="From (e.g. Accra Central)"
          value={fromLocation}
          onChange={(e) => setFromLocation(e.target.value)}
        />
        <MapPicker
          label="Pickup Location"
          lat={fromLat}
          lng={fromLng}
          onLocationSelect={(lat, lng) => { setFromLat(lat); setFromLng(lng); }}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="To (e.g. Tema)"
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
        />
        <MapPicker
          label="Dropoff Location"
          lat={toLat}
          lng={toLng}
          onLocationSelect={(lat, lng) => { setToLat(lat); setToLng(lng); }}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Available Seats"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Price per seat (GH₵)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          style={styles.input}
          type="datetime-local"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
        />
        <button style={styles.button} onClick={handlePostRide}>Post Ride</button>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '32px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '500px' },
  title: { textAlign: 'center', color: '#1a73e8', margin: 0, fontSize: '24px' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' },
  button: { padding: '14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  message: { textAlign: 'center', color: 'green', margin: 0, fontSize: '14px' },
};

export default PostRide;