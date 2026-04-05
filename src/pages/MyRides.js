import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyRides() {
  const [myPostedRides, setMyPostedRides] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

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

  if (!userId) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>Please login to see your rides.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Welcome, {userName}!</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Rides I Am Driving</h3>
        {myPostedRides.length === 0 ? (
          <p style={styles.empty}>You have not posted any rides yet.</p>
        ) : (
          myPostedRides.map((ride) => (
            <div key={ride.id} style={styles.rideCard}>
              <div style={styles.rideInfo}>
                <p style={styles.rideRoute}>{ride.from_location} to {ride.to_location}</p>
                <p style={styles.rideDetail}>Time: {ride.departure_time}</p>
                <p style={styles.rideDetail}>Seats remaining: {ride.seats_available}</p>
                <p style={styles.rideDetail}>Passengers booked: {ride.booking_count}</p>
              </div>
              <div style={{
                ...styles.statusBadge,
                backgroundColor: ride.status === 'active' ? '#34a853' : '#888'
              }}>
                {ride.status}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Rides I Have Booked</h3>
        {myBookings.length === 0 ? (
          <p style={styles.empty}>You have not booked any rides yet.</p>
        ) : (
          myBookings.map((booking) => (
            <div key={booking.id} style={styles.rideCard}>
              <div style={styles.rideInfo}>
                <p style={styles.rideRoute}>{booking.from_location} to {booking.to_location}</p>
                <p style={styles.rideDetail}>Time: {booking.departure_time}</p>
                <p style={styles.rideDetail}>Driver: {booking.driver_name}</p>
              </div>
              <div style={{
                ...styles.statusBadge,
                backgroundColor: booking.booking_status === 'pending' ? '#1a73e8' : '#34a853'
              }}>
                {booking.booking_status}
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
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    color: '#888',
    fontSize: '18px',
  },
};

export default MyRides;