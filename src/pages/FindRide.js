import React, { useState } from 'react';
import axios from 'axios';
import MapPicker from '../components/MapPicker';

function FindRide() {
  const [searchMode, setSearchMode] = useState('city');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromLat, setFromLat] = useState(null);
  const [fromLng, setFromLng] = useState(null);
  const [toLat, setToLat] = useState(null);
  const [toLng, setToLng] = useState(null);
  const [rides, setRides] = useState([]);
  const [message, setMessage] = useState('');

  const handleFindRide = async () => {
    try {
      let params = {};
      if (searchMode === 'city') {
        if (!fromCity && !toCity) {
          setMessage('Please enter at least one city name.');
          return;
        }
        params = { from_city: fromCity, to_city: toCity };
      } else {
        if (!fromLat || !toLat) {
          setMessage('Please select both locations on the map.');
          return;
        }
        params = { from_lat: fromLat, from_lng: fromLng, to_lat: toLat, to_lng: toLng };
      }

      const response = await axios.get(`/rides/match`, { params });
      const matches = response.data.matches;
      if (matches.length === 0) {
        setMessage('No rides found. Try different locations.');
        setRides([]);
      } else {
        setMessage('');
        setRides(matches);
      }
    } catch (error) {
      setMessage('Error finding rides. Please try again.');
    }
  };

  const handleBookRide = async (rideId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setMessage('Please login first before booking a ride.');
      return;
    }
    try {
      await axios.post(`/bookings`, {
        ride_id: rideId,
        passenger_id: userId,
      });
      setMessage('Ride booked successfully!');
    } catch (error) {
      setMessage('Error booking ride. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Find a Ride 🔍</h2>

        <div style={styles.toggleRow}>
          <button
            style={{
              ...styles.toggleBtn,
              backgroundColor: searchMode === 'city' ? '#1a73e8' : '#f1f3f4',
              color: searchMode === 'city' ? 'white' : '#333',
            }}
            onClick={() => setSearchMode('city')}
          >
            🏙️ Search by City
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              backgroundColor: searchMode === 'map' ? '#1a73e8' : '#f1f3f4',
              color: searchMode === 'map' ? 'white' : '#333',
            }}
            onClick={() => setSearchMode('map')}
          >
            🗺️ Search by Map
          </button>
        </div>

        {searchMode === 'city' ? (
          <div style={styles.citySearch}>
            <input
              style={styles.input}
              type="text"
              placeholder="From city (e.g. Accra)"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="To city (e.g. Tema)"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <MapPicker
              label="Your Pickup Location"
              lat={fromLat}
              lng={fromLng}
              onLocationSelect={(lat, lng) => {
                setFromLat(lat);
                setFromLng(lng);
              }}
            />
            <MapPicker
              label="Your Dropoff Location"
              lat={toLat}
              lng={toLng}
              onLocationSelect={(lat, lng) => {
                setToLat(lat);
                setToLng(lng);
              }}
            />
          </div>
        )}

        <button style={styles.button} onClick={handleFindRide}>Search Rides</button>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      {rides.length > 0 && (
        <div style={styles.results}>
          <h3 style={styles.resultsTitle}>Available Rides 🚗</h3>
          {rides.map((ride) => (
            <div key={ride.id} style={styles.rideCard}>
              <div style={styles.rideInfo}>
                <p style={styles.rideRoute}>📍 {ride.from_location} → {ride.to_location}</p>
                <p style={styles.rideDetail}>🕐 {ride.departure_time}</p>
                <p style={styles.rideDetail}>💺 {ride.seats_available} seats available</p>
                <p style={styles.rideDetail}>🚗 Driver: {ride.driver_name}</p>
              </div>
              <button
                style={styles.bookButton}
                onClick={() => handleBookRide(ride.id)}
              >
                Book Ride
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '540px',
  },
  title: {
    textAlign: 'center',
    color: '#1a73e8',
    margin: 0,
    fontSize: '24px',
  },
  toggleRow: {
    display: 'flex',
    gap: '8px',
  },
  toggleBtn: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  citySearch: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    color: '#e53935',
    margin: 0,
    fontSize: '14px',
  },
  results: {
    marginTop: '32px',
    width: '100%',
    maxWidth: '540px',
  },
  resultsTitle: {
    color: '#1a73e8',
    marginBottom: '16px',
    fontSize: '20px',
  },
  rideCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  rideInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  rideRoute: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  rideDetail: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  },
  bookButton: {
    padding: '10px 20px',
    backgroundColor: '#34a853',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default FindRide;