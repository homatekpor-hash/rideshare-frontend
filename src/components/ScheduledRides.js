import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

const GHANA_STOPS = [
  'Accra Central', 'Circle', 'Kaneshie', 'Mallam Junction', 'Kasoa',
  'Tema', 'Madina', 'Adenta', 'Lapaz', 'Achimota', 'Kumasi',
  'Takoradi', 'Cape Coast', 'Manhean', 'Ablekuma', 'Dodowa',
  'Spintex', 'East Legon', 'Airport', 'Osu', 'Dansoman',
];

function ScheduledRides({ userId }) {
  const [rides, setRides] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [seats, setSeats] = useState(1);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  useEffect(() => {
    fetchScheduled();
  }, [userId]);

  const fetchScheduled = async () => {
    try {
      const res = await axios.get(`${API}/rides/scheduled/${userId}`);
      setRides(res.data.rides);
    } catch (e) { console.error(e); }
  };

  const handleSchedule = async () => {
    if (!from || !to || !scheduledTime) { setMessage('❌ Please fill all fields.'); setTimeout(() => setMessage(''), 3000); return; }
    try {
      await axios.post(`${API}/rides/schedule`, {
        passenger_id: userId, from_location: from, to_location: to,
        scheduled_time: scheduledTime, seats_needed: seats, notes,
      });
      setMessage('✅ Ride scheduled successfully!');
      setShowForm(false); setFrom(''); setTo(''); setScheduledTime(''); setNotes('');
      fetchScheduled();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) { setMessage('❌ Failed to schedule ride.'); setTimeout(() => setMessage(''), 3000); }
  };

  const handleCancel = async (id) => {
    await axios.delete(`${API}/rides/scheduled/${id}`);
    fetchScheduled();
  };

  const getStatusColor = (status) => status === 'pending' ? '#f9a825' : status === 'confirmed' ? '#34a853' : '#888';

  return (
    <div style={styles.container}>
      {message && <div style={styles.toast}>{message}</div>}
      <div style={styles.header}>
        <p style={styles.title}>📅 Scheduled Rides</p>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>+ Schedule</button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <p style={styles.formTitle}>📅 Schedule a Ride</p>
          <div style={styles.inputWrapper}>
            <input style={styles.input} type="text" placeholder="From (e.g. Accra Central)" value={from}
              onChange={(e) => { setFrom(e.target.value); setFromSuggestions(GHANA_STOPS.filter(s => s.toLowerCase().includes(e.target.value.toLowerCase())).slice(0, 4)); }} />
            {fromSuggestions.length > 0 && (
              <div style={styles.suggestions}>
                {fromSuggestions.map(s => <div key={s} style={styles.suggestion} onClick={() => { setFrom(s); setFromSuggestions([]); }}>{s}</div>)}
              </div>
            )}
          </div>
          <div style={styles.inputWrapper}>
            <input style={styles.input} type="text" placeholder="To (e.g. Kasoa)" value={to}
              onChange={(e) => { setTo(e.target.value); setToSuggestions(GHANA_STOPS.filter(s => s.toLowerCase().includes(e.target.value.toLowerCase())).slice(0, 4)); }} />
            {toSuggestions.length > 0 && (
              <div style={styles.suggestions}>
                {toSuggestions.map(s => <div key={s} style={styles.suggestion} onClick={() => { setTo(s); setToSuggestions([]); }}>{s}</div>)}
              </div>
            )}
          </div>
          <input style={styles.input} type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
          <div style={styles.seatsRow}>
            <p style={styles.seatsLabel}>Seats needed:</p>
            {[1,2,3,4].map(n => (
              <button key={n} style={{...styles.seatBtn, backgroundColor: seats === n ? '#34a853' : '#f0f0f0', color: seats === n ? 'white' : '#333'}} onClick={() => setSeats(n)}>{n}</button>
            ))}
          </div>
          <input style={styles.input} type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button style={styles.scheduleBtn} onClick={handleSchedule}>📅 Confirm Schedule</button>
          <button style={styles.cancelFormBtn} onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      {rides.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>📅</p>
          <p style={styles.emptyText}>No scheduled rides yet</p>
          <p style={styles.emptyHint}>Schedule a ride in advance and we'll find you a driver!</p>
        </div>
      ) : rides.map(ride => (
        <div key={ride.id} style={styles.rideCard}>
          <div style={styles.rideTop}>
            <div style={styles.rideRoute}>
              <div style={styles.routeDotGreen} />
              <p style={styles.routeText}>{ride.from_location}</p>
            </div>
            <div style={styles.routeLine} />
            <div style={styles.rideRoute}>
              <div style={styles.routeDotRed} />
              <p style={styles.routeText}>{ride.to_location}</p>
            </div>
          </div>
          <div style={styles.rideDetails}>
            <p style={styles.rideTime}>🕐 {new Date(ride.scheduled_time).toLocaleString('en-GH', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p style={styles.rideSeats}>💺 {ride.seats_needed} seat(s)</p>
            {ride.notes && <p style={styles.rideNotes}>📝 {ride.notes}</p>}
          </div>
          <div style={styles.rideFooter}>
            <span style={{...styles.statusBadge, backgroundColor: getStatusColor(ride.status)}}>{ride.status}</span>
            {ride.status === 'pending' && <button style={styles.cancelBtn} onClick={() => handleCancel(ride.id)}>Cancel</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { padding: '0' },
  toast: { backgroundColor: '#333', color: 'white', padding: '10px 16px', borderRadius: '10px', marginBottom: '12px', fontSize: '13px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 },
  addBtn: { padding: '8px 16px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  form: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 16px 0' },
  inputWrapper: { position: 'relative', marginBottom: '12px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8f9fa', marginBottom: '12px' },
  suggestions: { position: 'absolute', top: '44px', left: 0, right: 0, backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100 },
  suggestion: { padding: '10px 16px', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' },
  seatsRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  seatsLabel: { fontSize: '14px', color: '#333', margin: 0, fontWeight: 'bold' },
  seatBtn: { width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  scheduleBtn: { width: '100%', padding: '14px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' },
  cancelFormBtn: { width: '100%', padding: '12px', backgroundColor: '#f5f5f5', color: '#333', border: 'none', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '40px 20px' },
  emptyIcon: { fontSize: '48px', margin: '0 0 12px 0' },
  emptyText: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
  emptyHint: { fontSize: '13px', color: '#888', margin: 0 },
  rideCard: { backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  rideTop: { marginBottom: '10px' },
  rideRoute: { display: 'flex', alignItems: 'center', gap: '10px' },
  routeDotGreen: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34a853', flexShrink: 0 },
  routeDotRed: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ea4335', flexShrink: 0 },
  routeLine: { width: '1px', height: '14px', backgroundColor: '#ddd', marginLeft: '4px' },
  routeText: { fontSize: '14px', fontWeight: '500', color: '#333', margin: 0 },
  rideDetails: { backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px' },
  rideTime: { fontSize: '13px', color: '#333', margin: '0 0 4px 0', fontWeight: '500' },
  rideSeats: { fontSize: '13px', color: '#666', margin: '0 0 4px 0' },
  rideNotes: { fontSize: '13px', color: '#888', margin: 0 },
  rideFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  cancelBtn: { padding: '6px 14px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
};

export default ScheduledRides;