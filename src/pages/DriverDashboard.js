import SOSButton from '../components/SOSButton';
import PerformanceScore from '../components/PerformanceScore';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { connectWebSocket, disconnectWebSocket, sendNotification } from '../utils/notifications';
import { initializePaystackPayment } from '../utils/payment';
import NotificationBell from '../components/NotificationBell';
import ChangePassword from '../components/ChangePassword';
import DarkModeToggle from '../components/DarkModeToggle';
import WithdrawModal from '../components/WithdrawModal';
const API = 'https://rideshare-backend-production-32f5.up.railway.app';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'online') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'offline') {
      osc.frequency.setValueAtTime(784, ctx.currentTime);
      osc.frequency.setValueAtTime(523, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'request') {
      [0, 0.2, 0.4].forEach(t => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(880, ctx.currentTime + t);
        g.gain.setValueAtTime(0.4, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.15);
      });
    }
  } catch (e) {}
};

const speak = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1; u.volume = 1;
    window.speechSynthesis.speak(u);
  }
};

function NavigationMap({ driverPos, targetLat, targetLng, color, onRouteInfo }) {
  const map = useMap();
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (driverPos) map.setView(driverPos, 16);
  }, [driverPos]);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const start = driverPos || [5.6037, -0.1870];
        if (!targetLat || !targetLng) return;
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${targetLng},${targetLat}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRouteCoords(coords);
          const durationMins = Math.round(data.routes[0].duration / 60);
          const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
          if (onRouteInfo) onRouteInfo({ durationMins, distanceKm });
          map.setView(start, 16);
        }
      } catch (e) { console.error('Route error:', e); }
    };
    if (driverPos && targetLat && targetLng) {
      fetchRoute();
      const routeInterval = setInterval(fetchRoute, 15000);
      return () => clearInterval(routeInterval);
    }
  }, [driverPos, targetLat, targetLng]);

  const targetIcon = L.divIcon({
    html: `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    className: '', iconSize: [20, 20], iconAnchor: [10, 10],
  });

  const driverIcon = L.divIcon({
    html: `<div style="background:#1a73e8;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;">🚗</div>`,
    className: '', iconSize: [24, 24], iconAnchor: [12, 12],
  });

  return (
    <>
      {driverPos && <Marker position={driverPos} icon={driverIcon} />}
      {targetLat && targetLng && <Marker position={[targetLat, targetLng]} icon={targetIcon} />}
      {routeCoords.length > 0 && (
        <>
          <Polyline positions={routeCoords} color="#ccc" weight={7} opacity={0.5} />
          <Polyline positions={routeCoords} color={color} weight={5} opacity={0.9} />
        </>
      )}
    </>
  );
}

function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(false);
  const [myRides, setMyRides] = useState([]);
  const [earnings, setEarnings] = useState({ totalNet: 0, totalCommission: 0, totalPassengers: 0, earnings: [] });
  const [ratings, setRatings] = useState({ ratings: [], avgRating: 0 });
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [complaint, setComplaint] = useState({ subject: '', message: '' });
  const [referrals, setReferrals] = useState([]);
  const [documents, setDocuments] = useState({});
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [toggling, setToggling] = useState(false);
  const [requests, setRequests] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [passengerRating, setPassengerRating] = useState(5);
  const [passengerComment, setPassengerComment] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const prevRequestCount = useRef(0);
const [showWithdraw, setShowWithdraw] = useState(false);
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || localStorage.getItem('userRole') !== 'driver') { navigate('/login'); return; }
    setIsOnline(localStorage.getItem('isOnline') === '1');
    fetchAll();
    fetchRequests();
    fetchActiveTrip();
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
      () => setDriverPos([5.6037, -0.1870]),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    connectWebSocket(userId, (data) => {
      const time = new Date().toLocaleTimeString();
      if (data.type === 'new_request') {
        fetchRequests();
        setNotifications(prev => [{ message: 'New ride request!', icon: '🔔', time, read: false }, ...prev]);
      }
      if (data.type === 'documents_verified') {
        sendNotification('✅ Documents Verified!', data.message);
        setNotifications(prev => [{ message: data.message, icon: '✅', time, read: false }, ...prev]);
        fetchAll();
      }
      if (data.type === 'documents_rejected') {
        sendNotification('❌ Documents Rejected', data.message);
        setNotifications(prev => [{ message: data.message, icon: '❌', time, read: false }, ...prev]);
        fetchAll();
      }
      if (data.type === 'new_message') {
        setNotifications(prev => [{ message: 'New message received!', icon: '💬', time, read: false }, ...prev]);
        fetchAll();
      }
    });
    const interval = setInterval(() => { fetchRequests(); fetchActiveTrip(); }, 10000);
    return () => { clearInterval(interval); navigator.geolocation.clearWatch(watchId); disconnectWebSocket(); };
  }, []);

  useEffect(() => {
    if (requests.length > prevRequestCount.current && requests.length > 0) {
      playSound('request');
      speak(`New ride request from ${requests[0].passenger_name}. From ${requests[0].from_location} to ${requests[0].to_location}.`);
      sendNotification('🔔 New Ride Request!', `${requests[0].passenger_name} wants a ride from ${requests[0].from_location} to ${requests[0].to_location}.`);
    }
    prevRequestCount.current = requests.length;
  }, [requests]);

  const fetchAll = async () => {
    try {
      const [profileRes, ridesRes, earningsRes, ratingsRes, referralsRes, docsRes, convsRes] = await Promise.all([
        axios.get(`${API}/profile/${userId}`),
        axios.get(`${API}/my-rides/${userId}`),
        axios.get(`${API}/earnings/${userId}`),
        axios.get(`${API}/ratings/${userId}`),
        axios.get(`${API}/referrals/${userId}`),
        axios.get(`${API}/driver/documents/${userId}`),
        axios.get(`${API}/conversations/${userId}`),
      ]);
      setProfile(profileRes.data.user);
      if (!name) setName(profileRes.data.user.name);
      if (!phone) setPhone(profileRes.data.user.phone || '');
      if (!vehicleNumber) setVehicleNumber(profileRes.data.user.vehicle_number || '');
      if (!vehicleModel) setVehicleModel(profileRes.data.user.vehicle_model || '');
      if (!vehicleColor) setVehicleColor(profileRes.data.user.vehicle_color || '');
      setMyRides(ridesRes.data.rides);
      setEarnings(earningsRes.data);
      setRatings(ratingsRes.data);
      setReferrals(referralsRes.data.referrals);
      setDocuments(docsRes.data.documents);
      setConversations(convsRes.data.conversations);
    } catch (e) { console.error(e); }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/driver/requests/${userId}`);
      setRequests(res.data.requests);
    } catch (e) {}
  };

  const fetchActiveTrip = async () => {
    try {
      const res = await axios.get(`${API}/driver/active-trip/${userId}`);
      setActiveTrip(res.data.trip);
    } catch (e) {}
  };

  const fetchCompletedTrips = async () => {
    try {
      const res = await axios.get(`${API}/driver/completed-trips/${userId}`);
      setCompletedTrips(res.data.trips);
    } catch (e) {}
  };

  const openChatWithPassenger = (passengerId, passengerName) => {
    if (!passengerId) return;
    setSelectedChat({ other_user_id: String(passengerId), other_user_name: passengerName || 'Passenger' });
    fetchChatMessages(passengerId);
    setActiveTab('messages');
  };

  const handleAccept = async (bookingId, req) => {
    await axios.put(`${API}/bookings/${bookingId}/accept`);
    setMessage('✅ Booking accepted!');
    speak(`Booking accepted. Navigating to pick up ${req.passenger_name} at ${req.from_location}.`);
    fetchRequests(); fetchActiveTrip(); fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDecline = async (bookingId) => {
    await axios.put(`${API}/bookings/${bookingId}/decline`);
    setMessage('❌ Booking declined.');
    fetchRequests();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    await axios.put(`${API}/bookings/${activeTrip.id}/start`);
    setMessage('🚗 Trip started!');
    speak(`Trip started. Navigating to ${activeTrip.to_location}.`);
    fetchActiveTrip();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEndTrip = async () => {
    if (!activeTrip) return;
    const res = await axios.put(`${API}/bookings/${activeTrip.id}/end`);
    const net = res.data.netAmount?.toFixed(2);
    setMessage(`✅ Trip completed! GH₵ ${net} added to your wallet.`);
    speak(`Trip completed. You earned GH₵ ${net}.`);
    setActiveTrip(null);
    fetchAll();
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmitPassengerRating = async () => {
    if (!selectedPassenger) return;
    await axios.post(`${API}/ratings`, {
      ride_id: selectedPassenger.id,
      rater_id: userId,
      rated_id: selectedPassenger.passenger_id,
      rating: passengerRating,
      comment: passengerComment,
      rater_role: 'driver',
    });
    setMessage('✅ Passenger rated!');
    setSelectedPassenger(null); setPassengerRating(5); setPassengerComment('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleOnline = async () => {
    setToggling(true);
    const newStatus = !isOnline;
    try {
      await axios.put(`${API}/users/${userId}/status`, { is_online: newStatus ? 1 : 0 });
      setIsOnline(newStatus);
      localStorage.setItem('isOnline', newStatus ? '1' : '0');
      playSound(newStatus ? 'online' : 'offline');
      speak(newStatus ? 'You are now online.' : 'You are now offline.');
      setMessage(newStatus ? '🟢 You are now Online!' : '⚫ You are now Offline.');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {}
    setToggling(false);
  };

  const handleUpdateProfile = async () => {
    await axios.put(`${API}/users/${userId}/profile`, {
      name, phone,
      vehicle_number: vehicleNumber,
      vehicle_model: vehicleModel,
      vehicle_color: vehicleColor,
    });
    setMessage('✅ Profile updated!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400; let w = img.width, h = img.height;
        if (w > h) { if (w > maxSize) { h *= maxSize/w; w = maxSize; } } else { if (h > maxSize) { w *= maxSize/h; h = maxSize; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        await axios.put(`${API}/users/${userId}/picture`, { profile_picture: compressed });
        setProfile({ ...profile, profile_picture: compressed });
        setMessage('✅ Photo updated!'); setTimeout(() => setMessage(''), 3000);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (type, e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800; let w = img.width, h = img.height;
        if (w > h) { if (w > maxSize) { h *= maxSize/w; w = maxSize; } } else { if (h > maxSize) { w *= maxSize/h; h = maxSize; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        setDocuments(prev => ({ ...prev, [type]: compressed }));
        setMessage('✅ Uploaded! Click Submit to save.'); setTimeout(() => setMessage(''), 3000);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDocuments = async () => {
    try {
      await axios.post(`${API}/driver/documents`, { driver_id: userId, ...documents });
      setMessage('✅ Documents submitted!'); setTimeout(() => setMessage(''), 5000); fetchAll();
    } catch (e) { setMessage('❌ Error. Try smaller images.'); }
  };

  const handleCancelRide = async (rideId) => {
    await axios.put(`${API}/rides/${rideId}/cancel`);
    fetchAll(); setMessage('✅ Ride cancelled!'); setTimeout(() => setMessage(''), 3000);
  };

  const handleComplaint = async () => {
    await axios.post(`${API}/complaints`, { user_id: userId, subject: complaint.subject, message: complaint.message });
    setComplaint({ subject: '', message: '' });
    setMessage('✅ Complaint submitted!'); setTimeout(() => setMessage(''), 3000);
  };

  const fetchChatMessages = async (otherUserId) => {
    try {
      const res = await axios.get(`${API}/messages/${userId}/${otherUserId}`);
      setChatMessages(res.data.messages || []);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      await axios.post(`${API}/messages`, {
        sender_id: parseInt(userId),
        receiver_id: parseInt(selectedChat.other_user_id),
        message: newMessage.trim()
      });
      setNewMessage('');
      fetchChatMessages(selectedChat.other_user_id);
      fetchAll();
    } catch (e) { setMessage('❌ Failed to send message.'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const bottomTabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'rides', icon: '🚗', label: 'Rides' },
    { id: 'earnings', icon: '💰', label: 'Earnings' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'menu', icon: '☰', label: 'Menu' },
  ];

  const menuItems = [
    { id: 'documents', icon: '📄', label: 'Documents & Verification' },
    { id: 'rate-passenger', icon: '⭐', label: 'Rate a Passenger' },
    { id: 'referrals', icon: '👥', label: 'Referrals' },
    { id: 'help', icon: '🆘', label: 'Help Center' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  const tripStatus = activeTrip?.status;

  return (
    <div style={styles.app}>
      {message && <div style={styles.toast}>{message}</div>}

      {activeTrip && activeTab === 'home' && (
        <div style={styles.tripScreen}>
          <div style={styles.tripMap}>
            <MapContainer center={driverPos || [5.6037, -0.1870]} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <NavigationMap
                driverPos={driverPos}
                targetLat={tripStatus === 'accepted' ? activeTrip.from_lat : activeTrip.to_lat}
                targetLng={tripStatus === 'accepted' ? activeTrip.from_lng : activeTrip.to_lng}
                color={tripStatus === 'accepted' ? '#34a853' : '#1a73e8'}
                onRouteInfo={setRouteInfo}
              />
            </MapContainer>
          </div>
          <div style={styles.tripPanel}>
            {routeInfo && (
              <div style={styles.etaBar}>
                <div style={styles.etaItem}><p style={styles.etaNum}>{routeInfo.durationMins} min</p><p style={styles.etaLbl}>{tripStatus === 'accepted' ? 'To Pickup' : 'To Dropoff'}</p></div>
                <div style={styles.etaDivider} />
                <div style={styles.etaItem}><p style={styles.etaNum}>{routeInfo.distanceKm} km</p><p style={styles.etaLbl}>Distance</p></div>
                <div style={styles.etaDivider} />
                <div style={styles.etaItem}><p style={styles.etaNum}>GH₵ {activeTrip.price}</p><p style={styles.etaLbl}>Fare</p></div>
              </div>
            )}
            <div style={styles.tripPassengerRow}>
              {activeTrip.passenger_pic ? <img src={activeTrip.passenger_pic} alt="" style={styles.tripAvatar} /> : <div style={styles.tripAvatarPlaceholder}>{activeTrip.passenger_name?.charAt(0)}</div>}
              <div style={{ flex: 1 }}>
                <p style={styles.tripPassengerName}>{activeTrip.passenger_name}</p>
                {activeTrip.passenger_phone && <a href={`tel:${activeTrip.passenger_phone}`} style={styles.tripPhone}>📞 {activeTrip.passenger_phone}</a>}
              </div>
              <p style={styles.tripFare}>GH₵ {activeTrip.price}</p>
            </div>
            <div style={styles.tripRouteBox}>
              <p style={{...styles.tripStatusLabel, color: tripStatus === 'accepted' ? '#f9a825' : '#1a73e8'}}>
                {tripStatus === 'accepted' ? '🟡 Heading to Pickup' : '🔵 Trip in Progress'}
              </p>
              <p style={styles.tripLocation}>{tripStatus === 'accepted' ? `📍 ${activeTrip.from_location}` : `🏁 ${activeTrip.to_location}`}</p>
            </div>
            {tripStatus === 'accepted' && <button style={styles.startTripBtn} onClick={handleStartTrip}>🚦 Arrived at Pickup — Start Trip</button>}
            {tripStatus === 'started' && <button style={styles.endTripBtn} onClick={handleEndTrip}>🏁 End Trip & Get Paid</button>}
            <div style={styles.tripActionRow}>
              <button style={styles.voiceBtn} onClick={() => speak(tripStatus === 'accepted' ? `Head to ${activeTrip.from_location} to pick up ${activeTrip.passenger_name}. ${routeInfo ? `Estimated ${routeInfo.durationMins} minutes.` : ''}` : `Navigate to ${activeTrip.to_location}. ${routeInfo ? `Estimated ${routeInfo.durationMins} minutes.` : ''}`)}>
                🔊 Voice
              </button>
              <button style={styles.msgPassengerBtn} onClick={() => openChatWithPassenger(activeTrip.passenger_id, activeTrip.passenger_name)}>
                💬 Message Passenger
              </button>
            </div>
          </div>
        </div>
      )}

      {isOnline && requests.length > 0 && !activeTrip && (
        <div style={styles.requestsPopup}>
          <p style={styles.requestsTitle}>🔔 New Ride Requests ({requests.length})</p>
          {requests.map(req => (
            <div key={req.id} style={styles.requestCard}>
              <div style={styles.requestHeader}>
                <div style={styles.requestAvatar}>
                  {req.passenger_pic ? <img src={req.passenger_pic} alt="" style={styles.requestAvatarImg} /> : <span>{req.passenger_name?.charAt(0)}</span>}
                </div>
                <div style={styles.requestInfo}>
                  <p style={styles.requestName}>{req.passenger_name}</p>
                  {req.passenger_phone && <a href={`tel:${req.passenger_phone}`} style={styles.requestPhone}>📞 {req.passenger_phone}</a>}
                </div>
                <p style={styles.requestPrice}>GH₵ {req.price}</p>
              </div>
              <div style={styles.requestRoute}>
                <p style={styles.requestFrom}>📍 {req.from_location}</p>
                <p style={styles.requestTo}>🏁 {req.to_location}</p>
                <p style={styles.requestTime}>🕐 {req.departure_time}</p>
              </div>
              <div style={styles.requestBtns}>
                <button style={styles.declineBtn} onClick={() => handleDecline(req.id)}>✕ Decline</button>
                <button style={styles.acceptBtn} onClick={() => handleAccept(req.id, req)}>✓ Accept</button>
              </div>
              <button style={styles.msgRiderBtn} onClick={() => openChatWithPassenger(req.passenger_id, req.passenger_name)}>
                💬 Message Rider Before Accepting
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'home' && !activeTrip && (
        <div style={styles.homeScreen}>
          <div style={styles.fullMap}>
            <MapContainer center={driverPos || [5.6037, -0.1870]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {driverPos && <Marker position={driverPos} />}
            </MapContainer>
            {!isOnline && (
              <div style={styles.mapOverlay}>
                <div style={styles.offlineCard}>
                  <p style={styles.offlineTitle}>You are Offline</p>
                  <p style={styles.offlineSub}>Go online to receive ride requests</p>
                </div>
              </div>
            )}
          </div>
          <div style={styles.topBar}>
            <div style={styles.topLeft}>
              {profile.profile_picture ? <img src={profile.profile_picture} alt="" style={styles.topAvatar} /> : <div style={styles.topAvatarPlaceholder}>{userName?.charAt(0)}</div>}
              <div>
                <p style={styles.topName}>{userName}</p>
                <p style={styles.topRole}>🚗 {profile.vehicle_number || 'Driver'}</p>
              </div>
            </div>
            <div style={styles.homeTitle}>
              <img src="/logo.png" alt="Ryde" style={{ width: '26px', height: '26px', borderRadius: '50%', marginRight: '6px', objectFit: 'cover' }} />
              Ryde
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NotificationBell notifications={notifications} onClear={() => setNotifications([])} />
              <div style={{...styles.statusPill, backgroundColor: isOnline ? '#34a853' : '#666'}}>{isOnline ? '🟢 Online' : '⚫ Offline'}</div>
            </div>
          </div>
          <div style={styles.bottomPanel}>
            {isOnline && (
              <div style={styles.liveStats}>
                <div style={styles.liveStat}><p style={styles.liveNum}>{requests.length}</p><p style={styles.liveLbl}>Requests</p></div>
                <div style={styles.liveDiv} />
                <div style={styles.liveStat}><p style={styles.liveNum}>{myRides.filter(r => r.status === 'active').length}</p><p style={styles.liveLbl}>Active Rides</p></div>
                <div style={styles.liveDiv} />
                <div style={styles.liveStat}><p style={styles.liveNum}>GH₵{earnings.totalNet?.toFixed(0) || '0'}</p><p style={styles.liveLbl}>Earned</p></div>
              </div>
            )}
            <button style={{...styles.goBtn, backgroundColor: isOnline ? '#ea4335' : '#1a73e8'}} onClick={handleToggleOnline} disabled={toggling}>
              {toggling ? '...' : isOnline ? '⚫  GO OFFLINE' : '🟢  GO ONLINE'}
            </button>
            <Link to="/post-ride" style={styles.postRideLink}>+ Post a New Ride</Link>
          </div>
        </div>
      )}

      {activeTab === 'rides' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><h2 style={styles.screenTitle}>My Rides 🚗</h2><Link to="/post-ride" style={styles.addBtn}>+ New</Link></div>
          <div style={styles.content}>
            {myRides.length === 0 ? <p style={styles.emptyText}>No rides posted yet.</p> : myRides.map(ride => (
              <div key={ride.id} style={styles.card}>
                <p style={styles.cardRoute}>📍 {ride.from_location} → {ride.to_location}</p>
                <p style={styles.cardDetail}>🕐 {ride.departure_time} | 💺 {ride.seats_available} seats | GH₵ {ride.price}</p>
                <div style={styles.cardFooter}>
                  <span style={{...styles.badge, backgroundColor: ride.status === 'active' ? '#34a853' : '#888'}}>{ride.status}</span>
                  {ride.status === 'active' && <button style={styles.cancelBtn} onClick={() => handleCancelRide(ride.id)}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'earnings' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><h2 style={styles.screenTitle}>Earnings 💰</h2></div>
          <div style={styles.content}>
            <div style={styles.earningsCard}>
              <PerformanceScore userId={userId} />
              <p style={styles.earningsBig}>GH₵ {earnings.totalNet?.toFixed(2) || '0.00'}</p>
              <p style={styles.earningsLbl}>Total received (after 10% commission)</p>
            </div>
            <button style={styles.withdrawBtn2} onClick={() => setShowWithdraw(true)}>
  💸 Withdraw to Mobile Money
</button>
{showWithdraw && (
  <WithdrawModal
    userId={userId}
    balance={earnings.totalNet}
    onClose={() => setShowWithdraw(false)}
    onSuccess={(msg) => { setMessage(msg); fetchAll(); setTimeout(() => setMessage(''), 5000); }}
  />
)}
            <div style={styles.earningsRow}>
              <div style={styles.earningMini}><p style={styles.earningMiniNum}>GH₵ {earnings.totalCommission?.toFixed(2) || '0.00'}</p><p style={styles.earningMiniLbl}>Commission</p></div>
              <div style={styles.earningMini}><p style={styles.earningMiniNum}>{earnings.totalPassengers || 0}</p><p style={styles.earningMiniLbl}>Passengers</p></div>
            </div>
            {/* Earnings Bar Chart */}
            {earnings.earnings && earnings.earnings.length > 0 && (
              <div style={styles.chartBox}>
                <p style={styles.chartTitle}>📊 Earnings per Ride</p>
                <div style={styles.barChart}>
                  {earnings.earnings.slice(0, 6).map((e, i) => {
                    const maxEarning = Math.max(...earnings.earnings.map(x => x.net_earned || 0), 1);
                    return (
                      <div key={i} style={styles.barGroup}>
                        <p style={styles.barValue}>GH₵{e.net_earned?.toFixed(0)}</p>
                        <div style={styles.barWrapper}>
                          <div style={{...styles.bar, height: `${(e.net_earned / maxEarning) * 100}px`, backgroundColor: '#34a853'}} />
                        </div>
                        <p style={styles.barLabel}>{e.from_location?.split(' ')[0]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {earnings.earnings?.map(e => (
              <div key={e.id} style={styles.card}>
                <p style={styles.cardRoute}>📍 {e.from_location} → {e.to_location}</p>
                <p style={styles.cardDetail}>👥 {e.passengers} passenger(s) | GH₵ {e.price}</p>
                <p style={{...styles.cardDetail, color: '#34a853', fontWeight: 'bold'}}>Received: GH₵ {e.net_earned?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><h2 style={styles.screenTitle}>Messages 💬</h2></div>
          {!selectedChat ? (
            <div style={styles.content}>
              {conversations.length === 0 ? (
                <div style={styles.emptyBox}><p style={styles.emptyIcon}>💬</p><p style={styles.emptyText}>No conversations yet</p><p style={styles.emptyHint}>Messages from riders will appear here</p></div>
              ) : conversations.map(conv => (
                <div key={conv.other_user_id} style={styles.convItem} onClick={() => { setSelectedChat(conv); fetchChatMessages(conv.other_user_id); }}>
                  <div style={styles.convAvatar}>{conv.other_user_name?.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.convName}>{conv.other_user_name}</p>
                    <p style={styles.convMsg}>{conv.last_message}</p>
                  </div>
                  <span style={styles.convArrow}>›</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.chatScreen}>
              <div style={styles.chatTopBar}>
                <button style={styles.backBtn} onClick={() => setSelectedChat(null)}>←</button>
                <div style={styles.chatAvatar}>{selectedChat.other_user_name?.charAt(0)}</div>
                <p style={styles.chatName}>{selectedChat.other_user_name}</p>
              </div>
              <div style={styles.msgList}>
                {chatMessages.length === 0 && <p style={{textAlign:'center',color:'#aaa',padding:'20px',fontSize:'13px'}}>No messages yet. Say hello! 👋</p>}
                {chatMessages.map(msg => (
                  <div key={msg.id} style={{...styles.msgBubble, alignSelf: String(msg.sender_id) === String(userId) ? 'flex-end' : 'flex-start', backgroundColor: String(msg.sender_id) === String(userId) ? '#1a73e8' : '#f1f3f4', color: String(msg.sender_id) === String(userId) ? 'white' : '#333'}}>
                    <p style={{ margin: 0, fontSize: '14px' }}>{msg.message}</p>
                  </div>
                ))}
              </div>
              <div style={styles.msgInputBar}>
                <input style={styles.msgField} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div style={styles.screen}>
          <div style={styles.menuHeader}>
            <div style={styles.menuProfile}>
              {profile.profile_picture ? <img src={profile.profile_picture} alt="" style={styles.menuAvatar} /> : <div style={styles.menuAvatarPlaceholder}>{userName?.charAt(0)}</div>}
              <div>
                <p style={styles.menuName}>{userName}</p>
                <p style={styles.menuRole}>🚗 Driver | ⭐ {ratings.avgRating || '0'}</p>
                {profile.vehicle_number && <p style={styles.menuVehicle}>🚙 {profile.vehicle_color} {profile.vehicle_model} | {profile.vehicle_number}</p>}
              </div>
            </div>
          </div>
          <div style={styles.content}>
            {menuItems.map(item => (
              <button key={item.id} style={styles.menuItem} onClick={() => { setActiveTab(item.id); if (item.id === 'rate-passenger') fetchCompletedTrips(); }}>
                <span style={styles.menuIcon}>{item.icon}</span>
                <span style={styles.menuLabel}>{item.label}</span>
                <span style={styles.menuArrow}>›</span>
              </button>
            ))}
            <button style={styles.logoutItem} onClick={handleLogout}>
              <span style={styles.menuIcon}>🚪</span>
              <span style={{...styles.menuLabel, color: '#ea4335'}}>Logout</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rate-passenger' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><button style={styles.backBtn} onClick={() => setActiveTab('menu')}>←</button><h2 style={styles.screenTitle}>Rate a Passenger ⭐</h2></div>
          <div style={styles.content}>
            {completedTrips.length === 0 ? (
              <div style={styles.emptyBox}><p style={styles.emptyIcon}>⭐</p><p style={styles.emptyText}>No completed trips yet</p></div>
            ) : completedTrips.map(trip => (
              <div key={trip.id} style={{...styles.card, border: selectedPassenger?.id === trip.id ? '2px solid #34a853' : 'none', cursor: 'pointer'}} onClick={() => setSelectedPassenger(trip)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {trip.passenger_pic ? <img src={trip.passenger_pic} alt="" style={{ width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover' }} /> : <div style={{ width:'40px', height:'40px', borderRadius:'50%', backgroundColor:'#34a853', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold' }}>{trip.passenger_name?.charAt(0)}</div>}
                  <div><p style={styles.cardRoute}>👤 {trip.passenger_name}</p><p style={styles.cardDetail}>📍 {trip.from_location} → {trip.to_location}</p></div>
                </div>
              </div>
            ))}
            {selectedPassenger && (
              <div style={styles.ratingBox}>
                <p style={styles.ratingTitle}>Rate {selectedPassenger.passenger_name}</p>
                <div style={styles.starsRow}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} style={{...styles.star, fontSize: star <= passengerRating ? '36px' : '28px', opacity: star <= passengerRating ? 1 : 0.3}} onClick={() => setPassengerRating(star)}>⭐</button>
                  ))}
                </div>
                <textarea style={styles.ratingInput} placeholder="Leave feedback..." value={passengerComment} onChange={(e) => setPassengerComment(e.target.value)} rows={3} />
                <button style={styles.submitBtn} onClick={handleSubmitPassengerRating}>Submit Rating</button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><button style={styles.backBtn} onClick={() => setActiveTab('menu')}>←</button><h2 style={styles.screenTitle}>Documents 📄</h2></div>
          <div style={styles.content}>
            <div style={{...styles.verifyBanner, backgroundColor: documents.verified === 1 ? '#e6f4ea' : documents.face_photo ? '#fff8e1' : '#fce8e6'}}>
              <p style={{...styles.verifyText, color: documents.verified === 1 ? '#34a853' : documents.face_photo ? '#f9a825' : '#ea4335'}}>
                {documents.verified === 1 ? '✅ Fully Verified!' : documents.face_photo ? '⏳ Awaiting admin review...' : '❌ Upload all documents to get verified'}
              </p>
            </div>
            <div style={styles.docCard}>
              <p style={styles.docTitle}>📸 Face Selfie</p>
              {documents.face_photo ? <img src={documents.face_photo} alt="" style={styles.docImg} /> : <div style={styles.docEmpty}>No photo</div>}
              <label style={styles.docUploadBtn}>{documents.face_photo ? 'Retake' : 'Upload'}<input type="file" accept="image/*" capture="user" onChange={(e) => handleDocumentUpload('face_photo', e)} style={{ display: 'none' }} /></label>
            </div>
            {[{frontKey:'license_front',backKey:'license_back',title:"🪪 Driver's License"},{frontKey:'national_id_front',backKey:'national_id_back',title:'🇬🇭 Ghana Card'}].map(doc => (
              <div key={doc.frontKey} style={styles.docCard}>
                <p style={styles.docTitle}>{doc.title}</p>
                <div style={styles.docRow}>
                  <div style={styles.docHalf}>
                    <p style={styles.docSide}>Front</p>
                    {documents[doc.frontKey] ? <img src={documents[doc.frontKey]} alt="" style={styles.docImgHalf} /> : <div style={styles.docEmptyHalf}>No photo</div>}
                    <label style={styles.docUploadBtn}>Upload<input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(doc.frontKey, e)} style={{ display: 'none' }} /></label>
                  </div>
                  <div style={styles.docHalf}>
                    <p style={styles.docSide}>Back</p>
                    {documents[doc.backKey] ? <img src={documents[doc.backKey]} alt="" style={styles.docImgHalf} /> : <div style={styles.docEmptyHalf}>No photo</div>}
                    <label style={styles.docUploadBtn}>Upload<input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(doc.backKey, e)} style={{ display: 'none' }} /></label>
                  </div>
                </div>
              </div>
            ))}
            {[{key:'insurance_image',title:'🚗 Vehicle Insurance'},{key:'roadworthiness_image',title:'✅ Roadworthiness'}].map(doc => (
              <div key={doc.key} style={styles.docCard}>
                <p style={styles.docTitle}>{doc.title}</p>
                {documents[doc.key] ? <img src={documents[doc.key]} alt="" style={styles.docImg} /> : <div style={styles.docEmpty}>No photo</div>}
                <label style={styles.docUploadBtn}>{documents[doc.key] ? 'Re-upload' : 'Upload'}<input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(doc.key, e)} style={{ display: 'none' }} /></label>
              </div>
            ))}
            <button style={styles.submitBtn} onClick={handleSubmitDocuments}>Submit All for Verification</button>
          </div>
        </div>
      )}

      {activeTab === 'referrals' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><button style={styles.backBtn} onClick={() => setActiveTab('menu')}>←</button><h2 style={styles.screenTitle}>Referrals 👥</h2></div>
          <div style={styles.content}>
            <div style={styles.referralBox}>
              <p style={styles.referralLabel}>Your Referral Code</p>
              <p style={styles.referralCode}>{profile.referral_code}</p>
              <p style={styles.referralNote}>Earn GH₵ 5 for each friend who joins!</p>
            </div>
            {referrals.length === 0 ? <p style={styles.emptyText}>No referrals yet.</p> : referrals.map(r => (
              <div key={r.id} style={styles.card}><p style={styles.cardRoute}>👤 {r.referred_name}</p><p style={styles.cardDetail}>Joined: {new Date(r.joined_at).toLocaleDateString()}</p></div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'help' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><button style={styles.backBtn} onClick={() => setActiveTab('menu')}>←</button><h2 style={styles.screenTitle}>Help Center 🆘</h2></div>
          <div style={styles.content}>
            <div style={styles.card}>
              <input style={styles.input} type="text" placeholder="Subject" value={complaint.subject} onChange={(e) => setComplaint({ ...complaint, subject: e.target.value })} />
              <textarea style={styles.textarea} placeholder="Describe your issue..." value={complaint.message} onChange={(e) => setComplaint({ ...complaint, message: e.target.value })} rows={4} />
              <button style={styles.submitBtn} onClick={handleComplaint}>Submit Complaint</button>
            </div>
            <div style={{...styles.card, backgroundColor: '#fce8e6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <div><p style={{...styles.cardRoute, color: '#ea4335'}}>SOS Emergency</p>
              <p style={{...styles.cardDetail, color: '#888'}}>Tap to alert Ryde admin</p></div>
              <SOSButton userId={userId} />
            </div>
            {['Verify passenger identity before starting','Share trip details with a trusted contact','Keep emergency contacts saved','Report suspicious activity immediately'].map((tip, i) => (
              <div key={i} style={styles.tipCard}><p style={styles.tipText}>{tip}</p></div>
            ))}


          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><button style={styles.backBtn} onClick={() => setActiveTab('menu')}>←</button><h2 style={styles.screenTitle}>Settings ⚙️</h2></div>
          <div style={styles.content}>
            <div style={styles.card}>
              <p style={styles.sectionTitle}>👤 Personal Information</p>
              <div style={styles.avatarSection}>
                {profile.profile_picture ? <img src={profile.profile_picture} alt="" style={styles.settingsAvatar} /> : <div style={styles.settingsAvatarPlaceholder}>{userName?.charAt(0)}</div>}
                <label style={styles.docUploadBtn}>📷 Change<input type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} /></label>
              </div>
              <input style={styles.input} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input style={styles.input} type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div style={styles.card}>
              <p style={styles.sectionTitle}>🚗 Vehicle Information</p>
              <input style={styles.input} type="text" placeholder="Vehicle Plate Number (e.g. GR 1234-23)" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
              <input style={styles.input} type="text" placeholder="Vehicle Model (e.g. Toyota Corolla)" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
              <input style={styles.input} type="text" placeholder="Vehicle Color (e.g. Blue)" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} />
              <button style={styles.submitBtn} onClick={handleUpdateProfile}>Save All Changes</button>
            </div>
            <div style={styles.card}>
              <p style={styles.sectionTitle}>🔑 Change Password</p>
              <ChangePassword userId={userId} />
            </div>
            <div style={styles.card}>
              <DarkModeToggle />
              <p style={styles.sectionTitle}>📋 Account Info</p>
              <p style={styles.infoRow}>📧 {profile.email}</p>
              <p style={styles.infoRow}>📅 Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p>
              <p style={styles.infoRow}>🔑 Referral: {profile.referral_code}</p>
              <p style={styles.infoRow}>🚗 Plate: {profile.vehicle_number || 'Not set'}</p>
              <p style={styles.infoRow}>🚙 Model: {profile.vehicle_model || 'Not set'}</p>
              <p style={styles.infoRow}>🎨 Color: {profile.vehicle_color || 'Not set'}</p>
            </div>
          </div>
        </div>
      )}

      {['home','rides','earnings','messages','menu'].includes(activeTab) && !activeTrip && (
        <div style={styles.bottomNav}>
          {bottomTabs.map(tab => (
            <button key={tab.id} style={{...styles.navBtn, color: activeTab === tab.id ? '#1a73e8' : '#888'}} onClick={() => setActiveTab(tab.id)}>
              <span style={styles.navIcon}>{tab.icon}</span>
              <span style={styles.navLabel}>{tab.label}</span>
              {tab.id === 'home' && requests.length > 0 && <span style={styles.navBadge}>{requests.length}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  app: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', overflow: 'hidden', maxWidth: '480px', margin: '0 auto', position: 'relative' },
  toast: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', color: 'white', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  tripScreen: { position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100vh', zIndex: 4000, display: 'flex', flexDirection: 'column' },
  tripMap: { flex: 1 },
  withdrawBtn2: { width: '100%', padding: '14px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' },
  tripPanel: { backgroundColor: 'white', borderRadius: '24px 24px 0 0', padding: '16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '10px' },
  etaBar: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '12px' },
  etaItem: { textAlign: 'center' },
  etaNum: { fontSize: '18px', fontWeight: 'bold', color: 'white', margin: '0 0 2px 0' },
  etaLbl: { fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 },
  etaDivider: { width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.2)' },
  tripPassengerRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  tripAvatar: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' },
  tripAvatarPlaceholder: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', color: 'white' },
  tripPassengerName: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 2px 0' },
  tripPhone: { fontSize: '13px', color: '#34a853', textDecoration: 'none' },
  tripFare: { fontSize: '22px', fontWeight: 'bold', color: '#1a73e8', margin: 0 },
  tripRouteBox: { backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px' },
  tripStatusLabel: { fontSize: '13px', fontWeight: 'bold', margin: '0 0 6px 0' },
  tripLocation: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: 0 },
  startTripBtn: { padding: '16px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  endTripBtn: { padding: '16px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  tripActionRow: { display: 'flex', gap: '8px' },
  voiceBtn: { flex: 1, padding: '10px', backgroundColor: '#f8f9fa', color: '#333', border: '1px solid #ddd', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' },
  msgPassengerBtn: { flex: 2, padding: '10px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  requestsPopup: { position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', width: '92%', maxWidth: '440px', zIndex: 3000, display: 'flex', flexDirection: 'column', gap: '10px' },
  requestsTitle: { backgroundColor: '#1a1a2e', color: 'white', padding: '10px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', margin: 0, textAlign: 'center' },
  requestCard: { backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '2px solid #34a853' },
  requestHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  requestAvatar: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: 'white', flexShrink: 0, overflow: 'hidden' },
  requestAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  requestInfo: { flex: 1 },
  requestName: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: '0 0 2px 0' },
  requestPhone: { fontSize: '12px', color: '#34a853', textDecoration: 'none' },
  requestPrice: { fontSize: '20px', fontWeight: 'bold', color: '#34a853', margin: 0 },
  requestRoute: { backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' },
  requestFrom: { fontSize: '13px', color: '#333', margin: '0 0 4px 0', fontWeight: '500' },
  requestTo: { fontSize: '13px', color: '#333', margin: '0 0 4px 0', fontWeight: '500' },
  requestTime: { fontSize: '12px', color: '#888', margin: 0 },
  requestBtns: { display: 'flex', gap: '10px', marginBottom: '8px' },
  declineBtn: { flex: 1, padding: '12px', backgroundColor: '#fce8e6', color: '#ea4335', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  acceptBtn: { flex: 2, padding: '12px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  msgRiderBtn: { width: '100%', padding: '10px', backgroundColor: '#e8f0fe', color: '#1a73e8', border: '1px solid #1a73e8', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  homeScreen: { flex: 1, position: 'relative', height: '100vh' },
  fullMap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapOverlay: { position: 'absolute', top: '80px', left: '20px', right: '20px', zIndex: 500 },
  offlineCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  offlineTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 6px 0' },
  offlineSub: { fontSize: '13px', color: '#888', margin: 0 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  topLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  topAvatar: { width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' },
  topAvatarPlaceholder: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'white' },
  topName: { margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#333' },
  topRole: { margin: 0, fontSize: '11px', color: '#888' },
  homeTitle: { display: 'flex', alignItems: 'center', fontSize: '15px', fontWeight: 'bold', color: '#333', backgroundColor: '#f0f4f8', padding: '6px 14px', borderRadius: '20px' },
  statusPill: { padding: '6px 14px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  bottomPanel: { position: 'absolute', bottom: '60px', left: 0, right: 0, backgroundColor: 'white', borderRadius: '24px 24px 0 0', padding: '20px', zIndex: 1000, boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' },
  liveStats: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' },
  liveStat: { textAlign: 'center' },
  liveNum: { fontSize: '18px', fontWeight: 'bold', color: '#1a73e8', margin: '0 0 2px 0' },
  liveLbl: { fontSize: '11px', color: '#888', margin: 0 },
  liveDiv: { width: '1px', height: '28px', backgroundColor: '#eee' },
  goBtn: { width: '100%', padding: '16px', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px', marginBottom: '10px' },
  postRideLink: { display: 'block', textAlign: 'center', padding: '8px', color: '#1a73e8', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' },
  screen: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8f9fa' },
  screenHeader: { backgroundColor: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  screenTitle: { fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0, flex: 1 },
  addBtn: { padding: '8px 16px', backgroundColor: '#34a853', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' },
  backBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#333', fontWeight: 'bold', padding: '0 4px' },
  content: { flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '80px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '6px' },
  cardRoute: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: 0 },
  cardDetail: { fontSize: '13px', color: '#666', margin: 0 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
  badge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  cancelBtn: { padding: '6px 14px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  earningsCard: { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '20px', padding: '28px', textAlign: 'center', color: 'white', marginBottom: '16px' },
  earningsBig: { fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px 0' },
  earningsLbl: { fontSize: '13px', opacity: 0.8, margin: 0 },
  earningsRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  earningMini: { flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  earningMiniNum: { fontSize: '18px', fontWeight: 'bold', color: '#1a73e8', margin: '0 0 4px 0' },
  earningMiniLbl: { fontSize: '12px', color: '#888', margin: 0 },
  chartBox: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: '0 0 16px 0' },
  barChart: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '130px', gap: '8px' },
  barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 },
  barValue: { fontSize: '10px', fontWeight: 'bold', color: '#333', margin: 0 },
  barWrapper: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100px' },
  bar: { width: '70%', borderRadius: '6px 6px 0 0', minHeight: '4px' },
  barLabel: { fontSize: '10px', color: '#888', margin: 0, textAlign: 'center' },
  emptyBox: { textAlign: 'center', padding: '48px 24px' },
  emptyIcon: { fontSize: '48px', margin: '0 0 12px 0' },
  emptyText: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
  emptyHint: { fontSize: '13px', color: '#888', margin: 0 },
  convItem: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', borderRadius: '12px', padding: '14px', marginBottom: '8px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  convAvatar: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: 'white', flexShrink: 0 },
  convName: { margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#333' },
  convMsg: { margin: 0, fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  convArrow: { fontSize: '20px', color: '#ccc' },
  chatScreen: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' },
  chatTopBar: { backgroundColor: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chatAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'white' },
  chatName: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 },
  msgList: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8f9fa' },
  msgBubble: { maxWidth: '75%', padding: '10px 14px', borderRadius: '18px' },
  msgInputBar: { padding: '12px 16px', backgroundColor: 'white', display: 'flex', gap: '8px', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' },
  msgField: { flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  sendBtn: { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  menuHeader: { backgroundColor: '#1a1a2e', padding: '24px 20px' },
  menuProfile: { display: 'flex', alignItems: 'center', gap: '14px' },
  menuAvatar: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #34a853' },
  menuAvatarPlaceholder: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold', color: 'white' },
  menuName: { color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0 0 2px 0' },
  menuRole: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 2px 0' },
  menuVehicle: { color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 },
  menuItem: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '8px', cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  menuIcon: { fontSize: '20px', width: '28px' },
  menuLabel: { flex: 1, fontSize: '15px', color: '#333', fontWeight: '500' },
  menuArrow: { fontSize: '20px', color: '#ccc' },
  logoutItem: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#fce8e6', borderRadius: '12px', padding: '16px', cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left' },
  ratingBox: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginTop: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  ratingTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 12px 0' },
  starsRow: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' },
  star: { background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  ratingInput: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
  verifyBanner: { borderRadius: '12px', padding: '14px', marginBottom: '16px' },
  verifyText: { margin: 0, fontWeight: 'bold', fontSize: '14px' },
  docCard: { backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  docTitle: { fontWeight: 'bold', color: '#333', fontSize: '15px', margin: '0 0 4px 0' },
  docImg: { width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #34a853', marginBottom: '8px' },
  docEmpty: { width: '100%', height: '120px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '13px', marginBottom: '8px' },
  docRow: { display: 'flex', gap: '12px' },
  docHalf: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  docSide: { fontWeight: 'bold', fontSize: '13px', color: '#555', margin: 0 },
  docImgHalf: { width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #34a853' },
  docEmptyHalf: { width: '100%', height: '100px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px' },
  docUploadBtn: { padding: '8px 16px', backgroundColor: '#1a73e8', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '8px' },
  referralBox: { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '20px', padding: '28px', textAlign: 'center', color: 'white', marginBottom: '16px' },
  referralLabel: { fontSize: '13px', opacity: 0.7, margin: '0 0 8px 0' },
  referralCode: { fontSize: '32px', fontWeight: 'bold', letterSpacing: '6px', margin: '0 0 8px 0' },
  referralNote: { fontSize: '13px', opacity: 0.75, margin: 0 },
  tipCard: { backgroundColor: 'white', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px' },
  tipText: { margin: 0, fontSize: '13px', color: '#444' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' },
  sectionTitle: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: '0 0 12px 0' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' },
  settingsAvatar: { width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' },
  settingsAvatarPlaceholder: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: 'white' },
  infoRow: { fontSize: '14px', color: '#555', margin: '0 0 10px 0' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', backgroundColor: 'white', display: 'flex', borderTop: '1px solid #f0f0f0', zIndex: 2000, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  navBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' },
  navIcon: { fontSize: '22px' },
  navLabel: { fontSize: '10px', fontWeight: '500' },
  navBadge: { position: 'absolute', top: '4px', right: '18%', backgroundColor: '#ea4335', color: 'white', borderRadius: '10px', fontSize: '9px', padding: '2px 5px', fontWeight: 'bold' },
};

export default DriverDashboard;


