import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

const GHANA_STOPS = [
  'Accra Central', 'Circle', 'Kaneshie', 'Mallam Junction', 'Odorkor',
  'Darkuman', 'Lapaz', 'Achimota', 'Ofankor', 'Weija Junction', 'Weija',
  'Kasoa', 'Budumburam', 'Winneba', 'Cape Coast', 'Takoradi',
  'Tema', 'Ashaiman', 'Spintex', 'Teshie', 'Nungua',
  'Madina', 'Adenta', 'Oyibi', 'Aburi', 'Koforidua',
  'Kumasi', 'Ejisu', 'Konongo', 'Nsawam', 'Amasaman',
  'Pokuase', 'Tantra Hill', 'North Kaneshie', 'Adabraka',
  'Osu', 'Labone', 'Airport', 'East Legon', 'Legon',
  'Haatso', 'Taifa', 'Kwabenya', 'Atomic', 'Dome',
  'Dansoman', 'Mamprobi', 'Korle Bu', 'Agbogbloshie',
  'Tudu', 'Makola', 'Rawlings Park', 'Nkrumah Circle','Manhean', 'Ablekuma', 'Ablekuma North', 'Ablekuma Central',
'Ablekuma West', 'Darkuman Junction', 'Dansoman Last Stop',
'Prampram', 'Afienya', 'Dodowa', 'Oyibi', 'Ashongman',
'Atomic Junction', 'Adenta', 'Madina Zongo', 'Pantang',
'Abokobi', 'Kwabenya', 'Taifa', 'Dome Market',
];

function PostRide() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [waypointInput, setWaypointInput] = useState('');
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [waypointSuggestions, setWaypointSuggestions] = useState([]);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const getSuggestions = (value) =>
    GHANA_STOPS.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 5);

  const addWaypoint = (stop) => {
    if (stop && !waypoints.includes(stop)) {
      setWaypoints([...waypoints, stop]);
    }
    setWaypointInput('');
    setWaypointSuggestions([]);
  };

  const removeWaypoint = (stop) => {
    setWaypoints(waypoints.filter(w => w !== stop));
  };

  const handleSubmit = async () => {
    if (!fromLocation || !toLocation || !departureTime || !price) {
      setMessage('Please fill in all required fields.');
      return;
    }
    try {
      const fullRoute = [fromLocation, ...waypoints, toLocation].join(' → ');
      await axios.post(`${API}/rides`, {
        driver_id: userId,
        from_location: fromLocation,
        to_location: toLocation,
        waypoints: waypoints.join(','),
        full_route: fullRoute,
        from_lat: 5.6037,
        from_lng: -0.1870,
        to_lat: 5.6037,
        to_lng: -0.1870,
        seats_available: seats,
        departure_time: departureTime,
        price,
      });
      setSuccess(true);
      setMessage('✅ Ride posted successfully!');
      setTimeout(() => navigate('/driver'), 2000);
    } catch (e) {
      setMessage('❌ Error posting ride. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/driver')}>←</button>
        <h2 style={styles.title}>Post a Ride 🚗</h2>
      </div>

      <div style={styles.content}>
        {message && (
          <div style={{...styles.msgBox, backgroundColor: success ? '#e6f4ea' : '#fce8e6', color: success ? '#34a853' : '#ea4335'}}>
            {message}
          </div>
        )}

        <div style={styles.card}>
          <p style={styles.sectionTitle}>🗺️ Route Details</p>

          {/* From */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>From (Pickup Point) *</label>
            <div style={styles.dotRow}>
              <div style={styles.greenDot} />
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. Accra Central"
                value={fromLocation}
                onChange={(e) => {
                  setFromLocation(e.target.value);
                  setFromSuggestions(getSuggestions(e.target.value));
                }}
              />
            </div>
            {fromSuggestions.length > 0 && (
              <div style={styles.suggestions}>
                {fromSuggestions.map(s => (
                  <button key={s} style={styles.suggestion} onClick={() => { setFromLocation(s); setFromSuggestions([]); }}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Waypoints */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>📍 Stops Along the Way (Optional)</label>
            <p style={styles.hint}>Add all stops you will pass through so riders can board along your route</p>
            <div style={styles.dotRow}>
              <div style={styles.orangeDot} />
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. Kaneshie, Mallam Junction..."
                value={waypointInput}
                onChange={(e) => {
                  setWaypointInput(e.target.value);
                  setWaypointSuggestions(getSuggestions(e.target.value));
                }}
                onKeyPress={(e) => e.key === 'Enter' && addWaypoint(waypointInput)}
              />
            </div>
            {waypointSuggestions.length > 0 && (
              <div style={styles.suggestions}>
                {waypointSuggestions.map(s => (
                  <button key={s} style={styles.suggestion} onClick={() => addWaypoint(s)}>{s}</button>
                ))}
              </div>
            )}
            {waypoints.length > 0 && (
              <div style={styles.waypointList}>
                {waypoints.map((w, i) => (
                  <div key={i} style={styles.waypointTag}>
                    <span>📍 {w}</span>
                    <button style={styles.removeBtn} onClick={() => removeWaypoint(w)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* To */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>To (Final Destination) *</label>
            <div style={styles.dotRow}>
              <div style={styles.redDot} />
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. Kasoa"
                value={toLocation}
                onChange={(e) => {
                  setToLocation(e.target.value);
                  setToSuggestions(getSuggestions(e.target.value));
                }}
              />
            </div>
            {toSuggestions.length > 0 && (
              <div style={styles.suggestions}>
                {toSuggestions.map(s => (
                  <button key={s} style={styles.suggestion} onClick={() => { setToLocation(s); setToSuggestions([]); }}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Route Preview */}
          {(fromLocation || waypoints.length > 0 || toLocation) && (
            <div style={styles.routePreview}>
              <p style={styles.routePreviewTitle}>Route Preview:</p>
              <div style={styles.routeStops}>
                {fromLocation && <div style={styles.routeStop}><div style={styles.greenDot} /><span>{fromLocation}</span></div>}
                {waypoints.map((w, i) => (
                  <div key={i} style={styles.routeStop}><div style={styles.orangeDot} /><span>{w}</span></div>
                ))}
                {toLocation && <div style={styles.routeStop}><div style={styles.redDot} /><span>{toLocation}</span></div>}
              </div>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <p style={styles.sectionTitle}>⏰ Trip Details</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Departure Time *</label>
            <input style={styles.input} type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Available Seats *</label>
            <div style={styles.seatsRow}>
              <button style={styles.seatBtn} onClick={() => setSeats(Math.max(1, seats - 1))}>−</button>
              <span style={styles.seatsNum}>{seats}</span>
              <button style={styles.seatBtn} onClick={() => setSeats(Math.min(8, seats + 1))}>+</button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Price per Seat (GH₵) *</label>
            <input style={styles.input} type="number" placeholder="e.g. 5" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
          </div>
        </div>

        <div style={styles.card}>
          <p style={styles.sectionTitle}>💡 Tips for Drivers</p>
          <p style={styles.tip}>✅ Add all major stops along your route</p>
          <p style={styles.tip}>✅ Riders going to stops along your way will see your ride</p>
          <p style={styles.tip}>✅ Example: Accra → Kaneshie → Mallam → Kasoa</p>
          <p style={styles.tip}>✅ Set a fair price per seat to attract more riders</p>
        </div>

        <button style={styles.submitBtn} onClick={handleSubmit}>
          Post Ride 🚗
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8f9fa', maxWidth: '480px', margin: '0 auto' },
  header: { backgroundColor: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100 },
  backBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#333', fontWeight: 'bold' },
  title: { fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0 },
  content: { padding: '16px', paddingBottom: '32px' },
  msgBox: { padding: '14px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 16px 0' },
  inputGroup: { marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '6px' },
  hint: { fontSize: '12px', color: '#888', margin: '0 0 8px 0' },
  dotRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  greenDot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#34a853', flexShrink: 0 },
  orangeDot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f9a825', flexShrink: 0 },
  redDot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ea4335', flexShrink: 0 },
  input: { flex: 1, width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa', boxSizing: 'border-box' },
  suggestions: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', marginTop: '4px', overflow: 'hidden' },
  suggestion: { display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#333', textAlign: 'left', borderBottom: '1px solid #f5f5f5' },
  waypointList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
  waypointTag: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff8e1', border: '1px solid #f9a825', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', color: '#333' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#ea4335', fontSize: '14px', padding: 0, fontWeight: 'bold' },
  routePreview: { backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '14px', marginTop: '8px' },
  routePreviewTitle: { fontSize: '13px', fontWeight: 'bold', color: '#888', margin: '0 0 10px 0' },
  routeStops: { display: 'flex', flexDirection: 'column', gap: '8px' },
  routeStop: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#333' },
  seatsRow: { display: 'flex', alignItems: 'center', gap: '20px' },
  seatBtn: { width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #1a73e8', backgroundColor: 'white', color: '#1a73e8', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' },
  seatsNum: { fontSize: '24px', fontWeight: 'bold', color: '#333', minWidth: '30px', textAlign: 'center' },
  tip: { fontSize: '13px', color: '#555', margin: '0 0 8px 0' },
  submitBtn: { width: '100%', padding: '16px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
};

export default PostRide;