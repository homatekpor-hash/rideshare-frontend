import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ isOnline }) {
  const [position, setPosition] = useState([5.6037, -0.1870]);
  const map = useMap();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setPosition([latitude, longitude]);
      map.setView([latitude, longitude], 15);
    }, () => {
      map.setView([5.6037, -0.1870], 13);
    });
  }, []);

  return isOnline ? <Marker position={position} /> : null;
}

function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(false);
  const [myRides, setMyRides] = useState([]);
  const [earnings, setEarnings] = useState({ totalNet: 0, totalCommission: 0, totalPassengers: 0, earnings: [] });
  const [notifications, setNotifications] = useState([]);
  const [ratings, setRatings] = useState({ ratings: [], avgRating: 0 });
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [complaint, setComplaint] = useState({ subject: '', message: '' });
  const [referrals, setReferrals] = useState([]);
  const [documents, setDocuments] = useState({});
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [toggling, setToggling] = useState(false);

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || localStorage.getItem('userRole') !== 'driver') {
      navigate('/login');
      return;
    }
    setIsOnline(localStorage.getItem('isOnline') === '1');
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [profileRes, ridesRes, earningsRes, notifRes, ratingsRes, referralsRes, docsRes, convsRes] = await Promise.all([
        axios.get(`${API}/profile/${userId}`),
        axios.get(`${API}/my-rides/${userId}`),
        axios.get(`${API}/earnings/${userId}`),
        axios.get(`${API}/notifications/${userId}`),
        axios.get(`${API}/ratings/${userId}`),
        axios.get(`${API}/referrals/${userId}`),
        axios.get(`${API}/driver/documents/${userId}`),
        axios.get(`${API}/conversations/${userId}`),
      ]);
      setProfile(profileRes.data.user);
      setName(profileRes.data.user.name);
      setPhone(profileRes.data.user.phone || '');
      setMyRides(ridesRes.data.rides);
      setEarnings(earningsRes.data);
      setNotifications(notifRes.data.notifications);
      setRatings(ratingsRes.data);
      setReferrals(referralsRes.data.referrals);
      setDocuments(docsRes.data.documents);
      setConversations(convsRes.data.conversations);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleToggleOnline = async () => {
    setToggling(true);
    const newStatus = !isOnline;
    try {
      await axios.put(`${API}/users/${userId}/status`, { is_online: newStatus ? 1 : 0 });
      setIsOnline(newStatus);
      localStorage.setItem('isOnline', newStatus ? '1' : '0');
      setMessage(newStatus ? 'You are now Online! Riders can see you.' : 'You are now Offline.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling status:', error);
    }
    setToggling(false);
  };

  const handleUpdateProfile = async () => {
    await axios.put(`${API}/users/${userId}/profile`, { name, phone });
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        await axios.put(`${API}/users/${userId}/picture`, { profile_picture: compressed });
        setProfile({ ...profile, profile_picture: compressed });
        setMessage('Profile picture updated!');
        setTimeout(() => setMessage(''), 3000);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        setDocuments(prev => ({ ...prev, [type]: compressed }));
        setMessage('Document uploaded! Click Submit to save.');
        setTimeout(() => setMessage(''), 3000);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDocuments = async () => {
    try {
      await axios.post(`${API}/driver/documents`, {
        driver_id: userId,
        license_front: documents.license_front,
        license_back: documents.license_back,
        national_id_front: documents.national_id_front,
        national_id_back: documents.national_id_back,
        insurance_image: documents.insurance_image,
        roadworthiness_image: documents.roadworthiness_image,
        face_photo: documents.face_photo,
      });
      setMessage('Documents submitted for verification!');
      setTimeout(() => setMessage(''), 5000);
      fetchAll();
    } catch (error) {
      setMessage('Error submitting. Try uploading smaller images.');
    }
  };

  const handleCancelRide = async (rideId) => {
    await axios.put(`${API}/rides/${rideId}/cancel`);
    fetchAll();
    setMessage('Ride cancelled!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleComplaint = async () => {
    await axios.post(`${API}/complaints`, { user_id: userId, subject: complaint.subject, message: complaint.message });
    setComplaint({ subject: '', message: '' });
    setMessage('Complaint submitted!');
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchMessages = async (otherUserId) => {
    const res = await axios.get(`${API}/messages/${userId}/${otherUserId}`);
    setMessages(res.data.messages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    await axios.post(`${API}/messages`, { sender_id: userId, receiver_id: selectedChat.other_user_id, message: newMessage });
    setNewMessage('');
    fetchMessages(selectedChat.other_user_id);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const tabs = [
    { id: 'home', label: '🏠 Home' },
    { id: 'rides', label: '🚗 My Rides' },
    { id: 'earnings', label: '💰 Earnings' },
    { id: 'messages', label: '💬 Messages' },
    { id: 'documents', label: '📄 Documents' },
    { id: 'referrals', label: '👥 Referrals' },
    { id: 'help', label: '🆘 Help' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          {profile.profile_picture ? (
            <img src={profile.profile_picture} alt="Profile" style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder}>{userName?.charAt(0)}</div>
          )}
          <p style={styles.sidebarName}>{userName}</p>
          <p style={styles.sidebarRole}>🚗 Driver</p>
        </div>
        {tabs.map(tab => (
          <button key={tab.id} style={{...styles.tabBtn, ...(activeTab === tab.id ? styles.tabActive : {})}} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
            {tab.id === 'messages' && notifications.length > 0 && (
              <span style={styles.notifBadge}>{notifications.length}</span>
            )}
          </button>
        ))}
        <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div style={styles.main}>
        {message && (
          <div style={{...styles.successMsg, backgroundColor: message.includes('Online') ? '#e6f4ea' : message.includes('Offline') ? '#fce8e6' : '#e6f4ea', color: message.includes('Online') ? '#34a853' : message.includes('Offline') ? '#ea4335' : '#34a853'}}>
            {message}
          </div>
        )}

        {activeTab === 'home' && (
          <div>
            {/* Uber-style Online/Offline */}
            <div style={{...styles.uberCard, backgroundColor: isOnline ? '#f0fff4' : '#f8f9fa', border: `2px solid ${isOnline ? '#34a853' : '#ddd'}`}}>
              <div style={styles.uberHeader}>
                <div>
                  <h2 style={{...styles.uberTitle, color: isOnline ? '#34a853' : '#888'}}>
                    {isOnline ? '🟢 You are Online' : '⚫ You are Offline'}
                  </h2>
                  <p style={styles.uberSubtitle}>
                    {isOnline ? 'Riders can see and book your rides' : 'Go online to start receiving ride requests'}
                  </p>
                </div>
                <button
                  style={{...styles.uberToggle, backgroundColor: isOnline ? '#ea4335' : '#34a853', transform: toggling ? 'scale(0.95)' : 'scale(1)'}}
                  onClick={handleToggleOnline}
                  disabled={toggling}
                >
                  {toggling ? '...' : isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
                </button>
              </div>

              <div style={{...styles.mapWrapper, filter: isOnline ? 'none' : 'grayscale(100%) opacity(0.5)'}}>
                <MapContainer center={[5.6037, -0.1870]} zoom={13} style={styles.map} zoomControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker isOnline={isOnline} />
                </MapContainer>
                {!isOnline && (
                  <div style={styles.mapOverlay}>
                    <p style={styles.mapOverlayText}>Go Online to activate your location</p>
                    <button style={styles.mapOverlayBtn} onClick={handleToggleOnline}>GO ONLINE</button>
                  </div>
                )}
              </div>

              {isOnline && (
                <div style={styles.onlineStats}>
                  <div style={styles.onlineStat}>
                    <p style={styles.onlineStatNum}>{notifications.length}</p>
                    <p style={styles.onlineStatLbl}>New Bookings</p>
                  </div>
                  <div style={styles.onlineStat}>
                    <p style={styles.onlineStatNum}>{myRides.filter(r => r.status === 'active').length}</p>
                    <p style={styles.onlineStatLbl}>Active Rides</p>
                  </div>
                  <div style={styles.onlineStat}>
                    <p style={styles.onlineStatNum}>GH₵ {earnings.totalNet?.toFixed(2) || '0.00'}</p>
                    <p style={styles.onlineStatLbl}>Total Earned</p>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}><p style={styles.statNum}>{myRides.length}</p><p style={styles.statLbl}>Total Rides</p></div>
              <div style={styles.statCard}><p style={styles.statNum}>GH₵ {earnings.totalNet?.toFixed(2) || '0.00'}</p><p style={styles.statLbl}>Net Earned</p></div>
              <div style={styles.statCard}><p style={styles.statNum}>{ratings.avgRating || '0'} ⭐</p><p style={styles.statLbl}>Rating</p></div>
              <div style={styles.statCard}><p style={styles.statNum}>{earnings.totalPassengers || 0}</p><p style={styles.statLbl}>Passengers</p></div>
            </div>

            <h3 style={styles.sectionTitle}>Recent Bookings</h3>
            {notifications.length === 0 ? <p style={styles.empty}>No bookings yet.</p> : (
              notifications.slice(0, 5).map(n => (
                <div key={n.id} style={styles.notifCard}>
                  <p style={styles.notifText}>👤 <strong>{n.passenger_name}</strong> booked your ride</p>
                  <p style={styles.notifRoute}>📍 {n.from_location} → {n.to_location}</p>
                </div>
              ))
            )}
            <Link to="/post-ride" style={styles.postRideBtn}>+ Post a New Ride</Link>
          </div>
        )}

        {activeTab === 'rides' && (
          <div>
            <h2 style={styles.pageTitle}>My Rides 🚗</h2>
            <Link to="/post-ride" style={styles.postRideBtn}>+ Post a New Ride</Link>
            <div style={{ marginTop: '16px' }}>
              {myRides.length === 0 ? <p style={styles.empty}>No rides posted yet.</p> : (
                myRides.map(ride => (
                  <div key={ride.id} style={styles.rideCard}>
                    <div>
                      <p style={styles.rideRoute}>📍 {ride.from_location} → {ride.to_location}</p>
                      <p style={styles.rideDetail}>🕐 {ride.departure_time}</p>
                      <p style={styles.rideDetail}>💺 {ride.seats_available} seats | 👥 {ride.booking_count} booked</p>
                      <p style={styles.rideDetail}>💰 GH₵ {ride.price} per seat</p>
                    </div>
                    <div style={styles.rideRight}>
                      <span style={{...styles.badge, backgroundColor: ride.status === 'active' ? '#34a853' : '#888'}}>{ride.status}</span>
                      {ride.status === 'active' && <button style={styles.cancelBtn} onClick={() => handleCancelRide(ride.id)}>Cancel</button>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div>
            <h2 style={styles.pageTitle}>Earnings 💰</h2>
            <div style={styles.earningsHeader}>
              <div style={styles.earningsStat}><p style={styles.earningsBig}>GH₵ {earnings.totalNet?.toFixed(2) || '0.00'}</p><p style={styles.earningsLbl}>Total Received (after 10% commission)</p></div>
              <div style={styles.earningsStat}><p style={styles.earningsBig}>GH₵ {earnings.totalCommission?.toFixed(2) || '0.00'}</p><p style={styles.earningsLbl}>Total Commission Paid</p></div>
              <div style={styles.earningsStat}><p style={styles.earningsBig}>{earnings.totalPassengers || 0}</p><p style={styles.earningsLbl}>Total Passengers</p></div>
            </div>
            <h3 style={styles.sectionTitle}>Trip History</h3>
            {!earnings.earnings || earnings.earnings.length === 0 ? <p style={styles.empty}>No earnings yet. Post a ride with a price!</p> : (
              earnings.earnings.map(e => (
                <div key={e.id} style={styles.rideCard}>
                  <div>
                    <p style={styles.rideRoute}>📍 {e.from_location} → {e.to_location}</p>
                    <p style={styles.rideDetail}>🕐 {e.departure_time}</p>
                    <p style={styles.rideDetail}>👥 {e.passengers} passenger(s) | Price: GH₵ {e.price}</p>
                    <p style={styles.rideDetail}>Commission (10%): GH₵ {e.commission?.toFixed(2)}</p>
                  </div>
                  <div style={styles.rideRight}>
                    <p style={styles.earnAmt}>GH₵ {e.net_earned?.toFixed(2)}</p>
                    <p style={styles.earnLbl}>received</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div style={styles.chatContainer}>
            <div style={styles.chatSidebar}>
              <h3 style={styles.chatTitle}>Conversations</h3>
              {conversations.length === 0 ? <p style={styles.empty}>No conversations yet.</p> : (
                conversations.map(conv => (
                  <div key={conv.other_user_id} style={{...styles.convItem, backgroundColor: selectedChat?.other_user_id === conv.other_user_id ? '#e8f0fe' : 'white'}} onClick={() => { setSelectedChat(conv); fetchMessages(conv.other_user_id); }}>
                    <p style={styles.convName}>👤 {conv.other_user_name}</p>
                    <p style={styles.convMsg}>{conv.last_message}</p>
                  </div>
                ))
              )}
            </div>
            <div style={styles.chatMain}>
              {selectedChat ? (
                <>
                  <div style={styles.chatHeader}>👤 {selectedChat.other_user_name}</div>
                  <div style={styles.msgList}>
                    {messages.map(msg => (
                      <div key={msg.id} style={{...styles.msgBubble, alignSelf: msg.sender_id == userId ? 'flex-end' : 'flex-start', backgroundColor: msg.sender_id == userId ? '#1a73e8' : '#f1f3f4', color: msg.sender_id == userId ? 'white' : '#333'}}>
                        <p style={{ margin: 0, fontSize: '14px' }}>{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  <div style={styles.msgInput}>
                    <input style={styles.msgField} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                    <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
                  </div>
                </>
              ) : <div style={styles.noChatSelected}>Select a conversation to start messaging</div>}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 style={styles.pageTitle}>Documents & Verification 📄</h2>
            <div style={{...styles.verificationBanner, backgroundColor: documents.verified === 1 ? '#e6f4ea' : documents.face_photo ? '#fff8e1' : '#fce8e6'}}>
              <p style={{...styles.verificationText, color: documents.verified === 1 ? '#34a853' : documents.face_photo ? '#f9a825' : '#ea4335'}}>
                {documents.verified === 1 ? '✅ Your account is fully verified!' : documents.face_photo ? '⏳ Documents submitted. Awaiting admin review...' : '❌ Please upload all required documents to get verified.'}
              </p>
              {documents.rejection_reason && <p style={styles.rejectionReason}>❗ Rejection reason: {documents.rejection_reason}</p>}
            </div>

            {[
              { key: 'face_photo', title: '📸 Face Photo (Selfie)', hint: 'Take a clear selfie. This will be compared with your ID photo by admin.', front: true, capture: 'user' },
            ].map(doc => (
              <div key={doc.key} style={styles.docSection}>
                <h3 style={styles.docSectionTitle}>{doc.title}</h3>
                <p style={styles.docHint}>{doc.hint}</p>
                <div style={styles.docRow}>
                  <div style={styles.docBox}>
                    {documents[doc.key] ? <img src={documents[doc.key]} alt={doc.title} style={styles.docPreview} /> : <div style={styles.docPlaceholder}>📷 No photo yet</div>}
                    <label style={styles.uploadBtn}>
                      {documents[doc.key] ? '📷 Retake' : '📷 Upload'}
                      <input type="file" accept="image/*" capture={doc.capture} onChange={(e) => handleDocumentUpload(doc.key, e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {[
              { frontKey: 'license_front', backKey: 'license_back', title: "🪪 Driver's License", hint: "Upload clear photos of the front and back of your driver's license." },
              { frontKey: 'national_id_front', backKey: 'national_id_back', title: '🇬🇭 Ghana Card (ECOWAS Identity Card)', hint: 'Upload clear photos of the front and back of your Ghana Card.' },
            ].map(doc => (
              <div key={doc.frontKey} style={styles.docSection}>
                <h3 style={styles.docSectionTitle}>{doc.title}</h3>
                <p style={styles.docHint}>{doc.hint}</p>
                <div style={styles.docRow}>
                  <div style={styles.docBox}>
                    <p style={styles.docLabel}>Front</p>
                    {documents[doc.frontKey] ? <img src={documents[doc.frontKey]} alt="Front" style={styles.docPreview} /> : <div style={styles.docPlaceholder}>📄 Not uploaded</div>}
                    <label style={styles.uploadBtn}>
                      {documents[doc.frontKey] ? 'Re-upload' : 'Upload Front'}
                      <input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(doc.frontKey, e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <div style={styles.docBox}>
                    <p style={styles.docLabel}>Back</p>
                    {documents[doc.backKey] ? <img src={documents[doc.backKey]} alt="Back" style={styles.docPreview} /> : <div style={styles.docPlaceholder}>📄 Not uploaded</div>}
                    <label style={styles.uploadBtn}>
                      {documents[doc.backKey] ? 'Re-upload' : 'Upload Back'}
                      <input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(doc.backKey, e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {[
              { key: 'insurance_image', title: '🚗 Vehicle Insurance Sticker', hint: 'Upload a clear photo of your vehicle insurance sticker.' },
              { key: 'roadworthiness_image', title: '✅ Roadworthiness Sticker', hint: 'Upload a clear photo of your vehicle roadworthiness sticker.' },
            ].map(doc => (
              <div key={doc.key} style={styles.docSection}>
                <h3 style={styles.docSectionTitle}>{doc.title}</h3>
                <p style={styles.docHint}>{doc.hint}</p>
                <div style={styles.docRow}>
                  <div style={styles.docBox}>
                    {documents[doc.key] ? <img src={documents[doc.key]} alt={doc.title} style={styles.docPreview} /> : <div style={styles.docPlaceholder}>📄 Not uploaded</div>}
                    <label style={styles.uploadBtn}>
                      {documents[doc.key] ? 'Re-upload' : 'Upload'}
                      <input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(doc.key, e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button style={styles.submitDocsBtn} onClick={handleSubmitDocuments}>
              Submit All Documents for Verification
            </button>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div>
            <h2 style={styles.pageTitle}>Referrals 👥</h2>
            <div style={styles.referralCard}>
              <p style={styles.referralLabel}>Your Referral Code</p>
              <p style={styles.referralCode}>{profile.referral_code}</p>
              <p style={styles.referralNote}>Share this code with friends. You earn GH₵ 5 for each person who joins!</p>
            </div>
            <h3 style={styles.sectionTitle}>People You Referred ({referrals.length})</h3>
            {referrals.length === 0 ? <p style={styles.empty}>No referrals yet. Share your code!</p> : (
              referrals.map(r => (
                <div key={r.id} style={styles.rideCard}>
                  <p style={styles.rideRoute}>👤 {r.referred_name}</p>
                  <p style={styles.rideDetail}>Joined: {new Date(r.joined_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'help' && (
          <div>
            <h2 style={styles.pageTitle}>Help Center 🆘</h2>
            <div style={styles.helpCard}>
              <input style={styles.input} type="text" placeholder="Subject" value={complaint.subject} onChange={(e) => setComplaint({ ...complaint, subject: e.target.value })} />
              <textarea style={styles.textarea} placeholder="Describe your issue..." value={complaint.message} onChange={(e) => setComplaint({ ...complaint, message: e.target.value })} rows={5} />
              <button style={styles.button} onClick={handleComplaint}>Submit Complaint</button>
            </div>
            <h3 style={styles.sectionTitle}>Safety Tips</h3>
            {['Always verify passenger identity before starting a trip',
              'Share your trip details with a trusted contact',
              'Keep emergency contacts saved on your phone',
              'Do not accept cash from suspicious passengers',
              'Report any suspicious activity immediately'].map((tip, i) => (
              <div key={i} style={styles.tipCard}><p style={styles.tipText}>🛡️ {tip}</p></div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={styles.pageTitle}>Settings ⚙️</h2>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.settingsCard}>
              <div style={styles.avatarSection}>
                {profile.profile_picture ? <img src={profile.profile_picture} alt="Profile" style={styles.bigAvatar} /> : <div style={styles.bigAvatarPlaceholder}>{userName?.charAt(0)}</div>}
                <label style={styles.uploadBtn}>
                  📷 Change Photo
                  <input type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} />
                </label>
              </div>
              <input style={styles.input} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input style={styles.input} type="text" placeholder="Phone Number (e.g. 0244123456)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button style={styles.button} onClick={handleUpdateProfile}>Save Changes</button>
            </div>
            <h3 style={styles.sectionTitle}>Account Info</h3>
            <div style={styles.settingsCard}>
              <p style={styles.infoRow}>📧 Email: {profile.email}</p>
              <p style={styles.infoRow}>🎭 Role: Driver</p>
              <p style={styles.infoRow}>📅 Member since: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p>
              <p style={styles.infoRow}>🔑 Referral Code: {profile.referral_code}</p>
            </div>
            <h3 style={styles.sectionTitle}>Security & Privacy</h3>
            <div style={styles.settingsCard}>
              <p style={styles.infoRow}>🔒 Your data is encrypted and secure</p>
              <p style={styles.infoRow}>🛡️ We never share your personal information</p>
              <p style={styles.infoRow}>📱 Location is only shared during active trips</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' },
  sidebar: { width: '220px', backgroundColor: '#1a1a2e', display: 'flex', flexDirection: 'column', padding: '16px', gap: '4px', flexShrink: 0 },
  sidebarHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #34a853' },
  avatarPlaceholder: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: 'white' },
  sidebarName: { color: 'white', fontWeight: 'bold', fontSize: '14px', margin: 0, textAlign: 'center' },
  sidebarRole: { color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 },
  tabBtn: { padding: '10px 12px', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', textAlign: 'left', position: 'relative' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold' },
  notifBadge: { position: 'absolute', right: '8px', top: '8px', backgroundColor: '#ea4335', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { marginTop: 'auto', padding: '10px', backgroundColor: 'rgba(255,0,0,0.2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  main: { flex: 1, padding: '24px', overflowY: 'auto' },
  successMsg: { padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' },
  uberCard: { borderRadius: '20px', padding: '24px', marginBottom: '24px', transition: 'all 0.3s' },
  uberHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  uberTitle: { fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0' },
  uberSubtitle: { fontSize: '13px', color: '#888', margin: 0 },
  uberToggle: { padding: '16px 32px', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'all 0.3s', minWidth: '160px' },
  mapWrapper: { borderRadius: '16px', overflow: 'hidden', position: 'relative', marginBottom: '16px', transition: 'filter 0.5s' },
  map: { height: '300px', width: '100%' },
  mapOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' },
  mapOverlayText: { color: 'white', fontSize: '16px', fontWeight: 'bold', margin: 0 },
  mapOverlayBtn: { padding: '14px 40px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' },
  onlineStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  onlineStat: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  onlineStatNum: { fontSize: '20px', fontWeight: 'bold', color: '#34a853', margin: '0 0 4px 0' },
  onlineStatLbl: { fontSize: '12px', color: '#888', margin: 0 },
  pageTitle: { color: '#1a1a2e', fontSize: '24px', marginBottom: '24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
  statNum: { fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 4px 0' },
  statLbl: { fontSize: '12px', color: '#888', margin: 0 },
  sectionTitle: { color: '#333', fontSize: '18px', marginBottom: '12px', marginTop: '24px' },
  notifCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '8px' },
  notifText: { margin: '0 0 4px 0', fontSize: '14px', color: '#333' },
  notifRoute: { margin: 0, fontSize: '12px', color: '#888' },
  postRideBtn: { display: 'inline-block', padding: '12px 24px', backgroundColor: '#34a853', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', marginTop: '16px' },
  rideCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rideRoute: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' },
  rideDetail: { fontSize: '13px', color: '#666', margin: '0 0 2px 0' },
  rideRight: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  badge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  cancelBtn: { padding: '6px 12px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  earningsHeader: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  earningsStat: { backgroundColor: '#1a1a2e', padding: '20px', borderRadius: '12px', textAlign: 'center', color: 'white' },
  earningsBig: { fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' },
  earningsLbl: { fontSize: '12px', opacity: 0.8, margin: 0 },
  earnAmt: { fontSize: '20px', fontWeight: 'bold', color: '#34a853', margin: 0 },
  earnLbl: { fontSize: '12px', color: '#888', margin: 0 },
  chatContainer: { display: 'flex', height: 'calc(100vh - 100px)', gap: '16px' },
  chatSidebar: { width: '240px', backgroundColor: 'white', borderRadius: '12px', padding: '16px', overflowY: 'auto' },
  chatTitle: { color: '#1a1a2e', fontSize: '16px', margin: '0 0 12px 0' },
  convItem: { padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', border: '1px solid #eee' },
  convName: { margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#333' },
  convMsg: { margin: 0, fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chatMain: { flex: 1, backgroundColor: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '16px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#333' },
  msgList: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  msgBubble: { maxWidth: '60%', padding: '10px 14px', borderRadius: '16px' },
  msgInput: { padding: '12px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' },
  msgField: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  sendBtn: { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
  noChatSelected: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' },
  verificationBanner: { padding: '16px', borderRadius: '12px', marginBottom: '24px' },
  verificationText: { margin: 0, fontWeight: 'bold', fontSize: '15px' },
  rejectionReason: { margin: '8px 0 0 0', color: '#ea4335', fontSize: '13px' },
  docSection: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' },
  docSectionTitle: { color: '#1a1a2e', fontSize: '16px', margin: '0 0 4px 0', fontWeight: 'bold' },
  docHint: { color: '#888', fontSize: '13px', margin: '0 0 16px 0' },
  docRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  docBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' },
  docPreview: { width: '100%', maxWidth: '250px', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #34a853' },
  docPlaceholder: { width: '100%', maxWidth: '250px', height: '160px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '14px' },
  docLabel: { fontWeight: 'bold', color: '#333', margin: '0 0 4px 0', fontSize: '14px' },
  submitDocsBtn: { width: '100%', padding: '14px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '8px' },
  referralCard: { backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '12px', textAlign: 'center', color: 'white', marginBottom: '24px' },
  referralLabel: { fontSize: '14px', opacity: 0.8, margin: '0 0 8px 0' },
  referralCode: { fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '4px' },
  referralNote: { fontSize: '13px', opacity: 0.75, margin: 0 },
  helpCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', outline: 'none' },
  button: { padding: '12px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  tipCard: { backgroundColor: 'white', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '8px' },
  tipText: { margin: 0, fontSize: '14px', color: '#333' },
  settingsCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '16px' },
  bigAvatar: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
  bigAvatarPlaceholder: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'white' },
  uploadBtn: { padding: '8px 16px', backgroundColor: '#1a1a2e', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  infoRow: { margin: '0 0 8px 0', fontSize: '14px', color: '#555' },
  empty: { color: '#888', textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '12px' },
};

export default DriverDashboard;