import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Ratings() {
  const [myBookings, setMyBookings] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [myRatings, setMyRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetchMyBookings();
      fetchMyRatings();
    }
  }, []);

  const fetchMyBookings = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/my-bookings/${userId}`);
      setMyBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchMyRatings = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/ratings/${userId}`);
      setMyRatings(response.data.ratings);
      setAvgRating(response.data.avgRating);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedRide) {
      setMessage('Please select a ride to rate.');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/ratings`, {
        ride_id: selectedRide.id,
        passenger_id: userId,
        driver_id: selectedRide.driver_id,
        rating,
        comment,
      });
      setMessage('Rating submitted successfully!');
      setSelectedRide(null);
      setRating(5);
      setComment('');
      fetchMyRatings();
    } catch (error) {
      setMessage('Error submitting rating. Please try again.');
    }
  };

  const renderStars = (count) => '⭐'.repeat(count);

  if (!userId) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>Please login to see ratings.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Ratings ⭐</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>My Driver Rating</h3>
        <div style={styles.avgCard}>
          <p style={styles.avgNumber}>{avgRating}</p>
          <p style={styles.avgStars}>{avgRating > 0 ? renderStars(Math.round(avgRating)) : 'No ratings yet'}</p>
          <p style={styles.avgLabel}>{myRatings.length} rating(s) received</p>
        </div>

        {myRatings.length > 0 && (
          <div style={styles.ratingsList}>
            {myRatings.map((r) => (
              <div key={r.id} style={styles.ratingCard}>
                <div style={styles.ratingHeader}>
                  <p style={styles.ratingName}>👤 {r.passenger_name}</p>
                  <p style={styles.ratingStars}>{renderStars(r.rating)}</p>
                </div>
                {r.comment && <p style={styles.ratingComment}>"{r.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Rate a Driver</h3>
        {myBookings.length === 0 ? (
          <p style={styles.empty}>You have no bookings to rate yet.</p>
        ) : (
          <>
            <p style={styles.label}>Select a ride you took:</p>
            <div style={styles.ridesList}>
              {myBookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    ...styles.rideOption,
                    backgroundColor: selectedRide?.id === booking.id ? '#e8f0fe' : 'white',
                    border: selectedRide?.id === booking.id ? '2px solid #1a73e8' : '1px solid #ddd',
                  }}
                  onClick={() => setSelectedRide(booking)}
                >
                  <p style={styles.rideRoute}>{booking.from_location} → {booking.to_location}</p>
                  <p style={styles.rideDriver}>Driver: {booking.driver_name}</p>
                </div>
              ))}
            </div>

            <p style={styles.label}>Your rating:</p>
            <div style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  style={{
                    ...styles.starButton,
                    fontSize: star <= rating ? '32px' : '24px',
                    opacity: star <= rating ? 1 : 0.4,
                  }}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>

            <textarea
              style={styles.textarea}
              placeholder="Leave a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />

            <button style={styles.button} onClick={handleSubmitRating}>
              Submit Rating
            </button>

            {message && <p style={styles.message}>{message}</p>}
          </>
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
  avgCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
    marginBottom: '16px',
  },
  avgNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#1a73e8',
    margin: '0 0 8px 0',
  },
  avgStars: {
    fontSize: '24px',
    margin: '0 0 8px 0',
  },
  avgLabel: {
    color: '#888',
    fontSize: '14px',
    margin: 0,
  },
  ratingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  ratingCard: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  ratingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  ratingName: {
    margin: 0,
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px',
  },
  ratingStars: {
    margin: 0,
    fontSize: '16px',
  },
  ratingComment: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  label: {
    color: '#555',
    fontSize: '14px',
    marginBottom: '8px',
  },
  ridesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  rideOption: {
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  rideRoute: {
    margin: '0 0 4px 0',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px',
  },
  rideDriver: {
    margin: 0,
    color: '#666',
    fontSize: '12px',
  },
  starsRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  starButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    transition: 'all 0.1s',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    marginBottom: '16px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
  },
  message: {
    textAlign: 'center',
    color: 'green',
    marginTop: '12px',
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
};

export default Ratings;