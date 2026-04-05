import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyRides() {
  const [myPostedRides, setMyPostedRides] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [message, setMessage] = useState('');

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (userId) {
      fetchMyRides();
      fetchMyBookings();
    }
  }, []);

  const fetchMyRides = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/my-rides/${userId}`);
      setMyPostedRides(response.data.rides);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/my-bookings/${userId}`);
      setMyBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleCancelRide = async (rideId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/rides/${rideId}/cancel`);
      setMessage('Ride cancelled successfully!');
      fetchMyRides();
    } catch (error) {
      setMessage('Error cancelling ride. Please try again.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/bookings/${bookingId}/cancel`);
      setMessage('Booking cancelled successfully!');
      fetchMyBookings();
    } catch (error) {
      setMessage('Error cancelling booking. Please try again.');
    }
  };

  if (!userId) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>Please login to see your rides.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Welcome, {userName}! 👋</h2>
      {message && <p style={styles.successMessage}>{message}</p>}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🚗 Rides I Am Driving</h3>
        {myPostedRides.length === 0 ? (
          <p style={styles.empty}>You have not posted any rides yet.</p>
        ) : (
          myPostedRides.map((ride) => (
            <div key={ride.id} style={styles.rideCard}>
              <div style={styles.rideInfo}>
                <p style={styles.rideRoute}>📍 {ride.from_location} → {ride.to_location}</p>
                <p style={styles.rideDetail}>🕐 {ride.departure_time}</p>
                <p style={styles.rideDetail}>💺 {ride.seats_available} seats remaining</p>
                <p style={styles.rideDetail}>👥 {ride.booking_count} passenger(s) booked</p>
              </div>
              <div style={styles.cardRight}>
                <div style={{
                  ...styles.statusBadge,
                  backgroundColor: ride.status === 'active' ? '#34a853' : '#888'
                }}>
                  {ride.status}
                </div>
                {ride.status === 'active' && (
                  <button
                    style={styles.cancelButton}
                    onClick={() => handleCancelRide(ride.id)}
                  >
                    Cancel Ride
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🎫 Rides I Have Booked</h3>
        {myBookings.length === 0 ? (
          <p style={styles.empty}>You have not booked any rides yet.</p>
        ) : (
          myBookings.map((booking) => (
            <div key={booking.id} style={styles.rideCard}>
              <div style={styles.rideInfo}>
                <p style={styles.rideRoute}>📍 {booking.from_location} → {booking.to_location}</p>
                <p style={styles.rideDetail}>🕐 {booking.departure_time}</p>
                <p style={styles.rideDetail}>🚗 Driver: {booking.driver_name}</p>
              </div>
              <div style={styles.cardRight}>
                <div style={{
                  ...styles.statusBadge,
                  backgroundColor: booking.booking_status === 'pending' ? '#1a73e8' : '#888'
                }}>
                  {booking.booking_status}
                </div>
                {booking.booking_status === 'pending' && (
                  <button
                    style={styles.cancelButton}
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '32px',
    maxWidth: '700px',
    margin: '0 auto',
  },
  pageTitle: {
    color: '#1a73e8',
    marginBottom: '32px',
    textAlign: 'center',
    fontSize: '28px',
  },
  successMessage: {
    textAlign: 'center',
    color: '#34a853',
    backgroundColor: '#e6f4ea',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    color: '#333',
    fontSize: '20px',
    marginBottom: '16px',
    borderBottom: '2px solid #1a73e8',
    paddingBottom: '8px',
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
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
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#ea4335',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default MyRides;