import React, { useState } from 'react';
import axios from 'axios';
import MapPicker from '../components/MapPicker';

function FindRide() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [fromLat, setFromLat] = useState(null);
  const [fromLng, setFromLng] = useState(null);
  const [toLat, setToLat] = useState(null);
  const [toLng, setToLng] = useState(null);
  const [rides, setRides] = useState([]);
  const [message, setMessage] = useState('');

  const handleFindRide = async () => {
    if (!fromLat || !toLat) {
      setMessage('Please select both your pickup and dropoff locations on the map.');
      return;
    }
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/rides/match`, {
        params: {
          from_lat: fromLat,
          from_lng: fromLng,
          to_lat: toLat,
          to_lng: toLng,
        },
      });
      const matches = response.data.matches;
      if (matches.length === 0) {
        setMessage('No rides found going that direction. Try again later.');
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
      await axios.post(`${process.env.REACT_APP_API_URL}/bookings`, {
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
        <h2 style={styles.title}>Find a Ride</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="From (e.g. Accra Central)"
          value={fromLocation}
          onChange={(e) => setFromLocation(e.target.value)}
        />
        <MapPicker
          label="Your Pickup Location"
          lat={fromLat}
          lng={fromLng}
          onLocationSelect={(lat, lng) => {
            setFromLat(lat);
            setFromLng(lng);
          }}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="To (e.g. Tema)"
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
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
        <button style={styles.button} onClick={handleFindRide}>Search Rides</button>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      {rides.length > 0 && (
        <div style={styles.results}>
          <h3 style={styles.resultsTitle}>Rides Going Your Way</h3>
          {rides.map((ride) => (
            <div key={ride.id} style={styles.rideCard}>
              <div style={styles.rideInfo}>
                <p style={styles.rideRoute}>{ride.from_location} to {ride.to_location}</p>
                <p style={styles.rideDetail}>Time: {ride.departure_time}</p>
                <p style={styles.rideDetail}>Seats: {ride.seats_available}</p>
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
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '500px',
  },
  title: {
    textAlign: 'center',
    color: '#1a73e8',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  message: {
    textAlign: 'center',
    color: 'green',
  },
  results: {
    marginTop: '32px',
    width: '100%',
    maxWidth: '600px',
  },
  resultsTitle: {
    color: '#1a73e8',
    marginBottom: '16px',
    textAlign: 'center',
  },
  rideCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  rideInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  rideRoute: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  rideDetail: {
    fontSize: '14px',
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
  },
};

export default FindRide;