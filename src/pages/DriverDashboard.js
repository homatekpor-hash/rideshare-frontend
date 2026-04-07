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
    }, () => { map.setView([5.6037, -0.1870], 13); });
  }, []);
  return <Marker position={position} />;
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
  const [requests, setRequests] = useState([]);

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
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests();
    }, 5000);
    return () => clearInterval(interval);
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
    } catch (error) { console.error('Error:', error); }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/driver/requests/${userId}`);
      setRequests(res.data.requests);
    } catch (error) { console.error('Error fetching requests:', error); }
  };

  const handleAccept = async (bookingId) => {
    await axios.put(`${API}/bookings/${bookingId}/accept`);
    setMessage('✅ Booking accepted!');
    fetchRequests();
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDecline = async (bookingId) => {
    await axios.put(`${API}/bookings/${bookingId}/decline`);
    setMessage('❌ Booking declined.');
    fetchRequests();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleOnline = async () => {
    setToggling(true);
    const newStatus = !isOnline;
    try {
      await axios.put(`${API}/users/${userId}/status`, { is_online: newStatus ? 1 : 0 });
      setIsOnline(newStatus);
      localStorage.setItem('isOnline', newStatus ? '1' : '0');
      setMessage(newStatus ? '🟢 You are now Online!' : '⚫ You are now Offline.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) { console.error('Error:', error); }
    setToggling(false);
  };

  const handleUpdateProfile = async () => {
    await axios.put(`${API}/users/${userId}/profile`, { name, phone });
    setMessage('✅ Profile updated!');
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
        let width = img.width, height = img.height;
        if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
        else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        await axios.put(`${API}/users/${userId}/picture`, { profile_picture: compressed });
        setProfile({ ...profile, profile_picture: compressed });
        setMessage('✅ Photo updated!');
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
        let width = img.width, height = img.height;
        if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
        else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        setDocuments(prev => ({ ...prev, [type]: compressed }));
        setMessage('✅ Document uploaded! Click Submit to save.');
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
      setMessage('✅ Documents submitted for verification!');
      setTimeout(() => setMessage(''), 5000);
      fetchAll();
    } catch (error) { setMessage('❌ Error submitting. Try smaller images.'); }
  };

  const handleCancelRide = async (rideId) => {
    await axios.put(`${API}/rides/${rideId}/cancel`);
    fetchAll();
    setMessage('✅ Ride cancelled!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleComplaint = async () => {
    await axios.post(`${API}/complaints`, { user_id: userId, subject: complaint.subject, message: complaint.message });
    setComplaint({ subject: '', message: '' });
    setMessage('✅ Complaint submitted!');
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
    { id: 'referrals', icon: '👥', label: 'Referrals' },
    { id: 'help', icon: '🆘', label: 'Help Center' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div style={styles.app}>
      {/* Toast */}
      {message && <div style={styles.toast}>{message}</div>}

      {/* Ride Requests Popup - shows on top of everything when online */}
      {isOnline && requests.length > 0 && (
        <div style={styles.requestsPopup}>
          <p style={styles.requestsTitle}>🔔 New Ride Requests ({requests.length})</p>
          {requests.map(req => (
            <div key={req.id} style={styles.requestCard}>
              <div style={styles.requestHeader}>
                <div style={styles.requestAvatar}>
                  {req.passenger_pic
                    ? <img src={req.passenger_pic} alt="Passenger" style={styles.requestAvatarImg} />
                    : <span>{req.passenger_name?.charAt(0)}</span>}
                </div>
                <div style={styles.requestInfo}>
                  <p style={styles.requestName}>{req.passenger_name}</p>
                  {req.passenger_phone && (
                    <a href={`tel:${req.passenger_phone}`} style={styles.requestPhone}>📞 {req.passenger_phone}</a>
                  )}
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
                <button style={styles.acceptBtn} onClick={() => handleAccept(req.id)}>✓ Accept</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div style={styles.homeScreen}>
          <div style={styles.fullMap}>
            <MapContainer center={[5.6037, -0.1870]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker isOnline={isOnline} />
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
              {profile.profile_picture
                ? <img src={profile.profile_picture} alt="Profile" style={styles.topAvatar} />
                : <div style={styles.topAvatarPlaceholder}>{userName?.charAt(0)}</div>}
              <div>
                <p style={styles.topName}>{userName}</p>
                <p style={styles.topRole}>🚗 Driver</p>
              </div>
            </div>
            <div style={{...styles.statusPill, backgroundColor: isOnline ? '#34a853' : '#666'}}>
              {isOnline ? '🟢 Online' : '⚫ Offline'}
            </div>
          </div>

          <div style={styles.bottomPanel}>
            {isOnline && (
              <div style={styles.liveStats}>
                <div style={styles.liveStat}>
                  <p style={styles.liveNum}>{requests.length}</p>
                  <p style={styles.liveLbl}>Requests</p>
                </div>
                <div style={styles.liveDiv} />
                <div style={styles.liveStat}>
                  <p style={styles.liveNum}>{myRides.filter(r => r.status === 'active').length}</p>
                  <p style={styles.liveLbl}>Active Rides</p>
                </div>
                <div style={styles.liveDiv} />
                <div style={styles.liveStat}>
                  <p style={styles.liveNum}>GH₵{earnings.totalNet?.toFixed(0) || '0'}</p>
                  <p style={styles.liveLbl}>Earned</p>
                </div>
              </div>
            )}
            <button
              style={{...styles.goBtn, backgroundColor: isOnline ? '#ea4335' : '#1a73e8', transform: toggling ? 'scale(0.97)' : 'scale(1)'}}
              onClick={handleToggleOnline}
              disabled={toggling}
            >
              {toggling ? '...' : isOnline ? '⚫  GO OFFLINE' : '🟢  GO ONLINE'}
            </button>
            <Link to="/post-ride" style={styles.postRideLink}>+ Post a New Ride</Link>
          </div>
        </div>
      )}

      {/* RIDES TAB */}
      {activeTab === 'rides' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <h2 style={styles.screenTitle}>My Rides 🚗</h2>
            <Link to="/post-ride" style={styles.addBtn}>+ New</Link>
          </div>
          <div style={styles.content}>
            {myRides.length === 0 ? <p style={styles.empty}>No rides posted yet.</p> : (
              myRides.map(ride => (
                <div key={ride.id} style={styles.card}>
                  <p style={styles.cardRoute}>📍 {ride.from_location} → {ride.to_location}</p>
                  <p style={styles.cardDetail}>🕐 {ride.departure_time}</p>
                  <p style={styles.cardDetail}>💺 {ride.seats_available} seats | 👥 {ride.booking_count} booked | GH₵ {ride.price}</p>
                  <div style={styles.cardFooter}>
                    <span style={{...styles.badge, backgroundColor: ride.status === 'active' ? '#34a853' : '#888'}}>{ride.status}</span>
                    {ride.status === 'active' && <button style={styles.cancelBtn} onClick={() => handleCancelRide(ride.id)}>Cancel</button>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EARNINGS TAB */}
      {activeTab === 'earnings' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><h2 style={styles.screenTitle}>Earnings 💰</h2></div>
          <div style={styles.content}>
            <div style={styles.earningsCard}>
              <p style={styles.earningsBig}>GH₵ {earnings.totalNet?.toFixed(2) || '0.00'}</p>
              <p style={styles.earningsLbl}>Total received (after 10% commission)</p>
            </div>
            <div style={styles.earningsRow}>
              <div style={styles.earningMini}><p style={styles.earningMiniNum}>GH₵ {earnings.totalCommission?.toFixed(2) || '0.00'}</p><p style={styles.earningMiniLbl}>Commission paid</p></div>
              <div style={styles.earningMini}><p style={styles.earningMiniNum}>{earnings.totalPassengers || 0}</p><p style={styles.earningMiniLbl}>Passengers</p></div>
            </div>
            <h3 style={styles.sectionTitle}>Trip History</h3>
            {!earnings.earnings || earnings.earnings.length === 0 ? <p style={styles.empty}>No earnings yet.</p> : (
              earnings.earnings.map(e => (
                <div key={e.id} style={styles.card}>
                  <p style={styles.cardRoute}>📍 {e.from_location} → {e.to_location}</p>
                  <p style={styles.cardDetail}>👥 {e.passengers} passenger(s) | GH₵ {e.price} per seat</p>
                  <p style={styles.cardDetail}>Commission: GH₵ {e.commission?.toFixed(2)}</p>
                  <p style={{...styles.cardDetail, color: '#34a853', fontWeight: 'bold'}}>Received: GH₵ {e.net_earned?.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}><h2 style={styles.screenTitle}>Messages 💬</h2></div>
          {!selectedChat ? (
            <div style={styles.content}>
              {conversations.length === 0 ? <p style={styles.empty}>No conversations yet.</p> : (
                conversations.map(conv => (
                  <div key={conv.other_user_id} style={styles.convItem} onClick={() => { setSelectedChat(conv); fetchMessages(conv.other_user_id); }}>
                    <div style={styles.convAvatar}>{conv.other_user_name?.charAt(0)}</div>
                    <div>
                      <p style={styles.convName}>{conv.other_user_name}</p>
                      <p style={styles.convMsg}>{conv.last_message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={styles.chatScreen}>
              <div style={styles.chatTopBar}>
                <button style={styles.backBtn} onClick={() => setSelectedChat(null)}>←</button>
                <p style={styles.chatName}>{selectedChat.other_user_name}</p>
              </div>
              <div style={styles.msgList}>
                {messages.map(msg => (
                  <div key={msg.id} style={{...styles.msgBubble, alignSelf: msg.sender_id == userId ? 'flex-end' : 'flex-start', backgroundColor: msg.sender_id == userId ? '#1a73e8' : '#f1f3f4', color: msg.sender_id == userId ? 'white' : '#333'}}>
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

      {/* MENU TAB */}
      {activeTab === 'menu' && (
        <div style={styles.screen}>
          <div style={styles.menuHeader}>
            <div style={styles.menuProfile}>
              {profile.profile_picture
                ? <img src={profile.profile_picture} alt="Profile" style={styles.menuAvatar} />
                : <div style={styles.menuAvatarPlaceholder}>{userName?.charAt(0)}</div>}
              <div>
                <p style={styles.menuName}>{userName}</p>
                <p style={styles.menuRole}>🚗 Driver | ⭐ {ratings.avgRating || '0'}</p>
              </div>
            </div>
          </div>
          <div style={styles.content}>
            {menuItems.map(item => (
              <button key={item.id} style={styles.menuItem} onClick={() => setActiveTab(item.id)}>
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

      {/* DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('menu')}>←</button>
            <h2 style={styles.screenTitle}>Documents 📄</h2>
          </div>
          <div style={styles.content}>
            <div style={{...styles.verifyBanner, backgroundColor: documents.verified === 1 ? '#e6f4ea' : documents.face_photo ? '#fff8e1' : '#fce8e6'}}>
              <p style={{...styles.verifyText, color: documents.verified === 1 ? '#34a853' : documents.face_photo ? '#f9a825' : '#ea4335'}}>
                {documents.verified === 1 ? '✅ Fully Verified!' : documents.face_photo ? '⏳ Awaiting admin review...' : '❌ Upload all documents to get verified'}
              </p>
              {documents.rejection_reason && <p style={{ color: '#ea4335', fontSize: '13px', margin: '4px 0 0 0' }}>Reason: {documents.rejection_reason}</p>}
            </div>

            <div style={styles.docCard}>
              <p style={styles.docTitle}>📸 Face Selfie</p>
              <p style={styles.docHint}>Clear selfie for identity verification</p>
              {documents.face_photo ? <img src={documents.face_photo} alt="Face" style={styles.docImg} /> : <div style={styles.docEmpty}>No photo</div>}
              <label style={styles.docUploadBtn}>
                {documents.face_photo ? 'Retake' : 'Upload'}
                <input type="file" accept="image/*" capture="user" onChange={(e) => handleDocumentUpload('face_photo', e)} style={{ display: 'none' }} />
              </label>
            </div>

            {[
              { frontKey: 'license_front', backKey: 'license_back', title: "🪪 Driver's License" },
              { frontKey: 'national_id_front', backKey: 'national_id_back', title: '🇬🇭 Ghana Card' },
            ].map(doc => (
              <div key={doc.frontKey} style={styles.docCard}>
                <p style={styles.docTitle}>{doc.title}</p>
                <div style={styles.docRow}>
                  <div style={styles.docHalf}>
                    <p style={styles.docSide}>Front</p>
                    {documents[doc.frontKey] ? <img src={documents[doc.frontKey]} alt="Front" style={styles.docImgHalf} /> : <div style={styles.docEmptyHalf}>No photo</div>}
                    <label style={styles.docUploadBtn}>Upload<input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(doc.frontKey, e)} style={{ display: 'none' }} /></label>
                  </div>
                  <div style={styles.docHalf}>
                    <p style={styles.docSide}>Back</p>
                    {documents[doc.backKey] ? <img src={documents[doc.backKey]} alt="Back" style={styles.docImgHalf} /> : <div style={styles.docEmptyHalf}>No photo</div>}
                    <label style={styles.docUploadBtn}>Upload<input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(doc.backKey, e)} style={{ display: 'none' }} /></label>
                  </div>
                </div>
              </div>
            ))}

            {[
              { key: 'insurance_image', title: '🚗 Vehicle Insurance' },
              { key: 'roadworthiness_image', title: '✅ Roadworthiness Sticker' },
            ].map(doc => (
              <div key={doc.key} style={styles.docCard}>
                <p style={styles.docTitle}>{doc.title}</p>
                {documents[doc.key] ? <img src={documents[doc.key]} alt={doc.title} style={styles.docImg} /> : <div style={styles.docEmpty}>No photo</div>}
                <label style={styles.docUploadBtn}>
                  {documents[doc.key] ? 'Re-upload' : 'Upload'}
                  <input type="file" accept="image/*" onChange={(e) => handleDocumentUpload(doc.key, e)} style={{ display: 'none' }} />
                </label>
              </div>
            ))}

            <button style={styles.submitBtn} onClick={handleSubmitDocuments}>Submit All for Verification</button>
          </div>
        </div>
      )}

      {/* REFERRALS TAB */}
      {activeTab === 'referrals' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('menu')}>←</button>
            <h2 style={styles.screenTitle}>Referrals 👥</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.referralBox}>
              <p style={styles.referralLabel}>Your Referral Code</p>
              <p style={styles.referralCode}>{profile.referral_code}</p>
              <p style={styles.referralNote}>Earn GH₵ 5 for each friend who joins!</p>
            </div>
            <h3 style={styles.sectionTitle}>People You Referred ({referrals.length})</h3>
            {referrals.length === 0 ? <p style={styles.empty}>No referrals yet.</p> : (
              referrals.map(r => (
                <div key={r.id} style={styles.card}>
                  <p style={styles.cardRoute}>👤 {r.referred_name}</p>
                  <p style={styles.cardDetail}>Joined: {new Date(r.joined_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* HELP TAB */}
      {activeTab === 'help' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('menu')}>←</button>
            <h2 style={styles.screenTitle}>Help Center 🆘</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.card}>
              <input style={styles.input} type="text" placeholder="Subject" value={complaint.subject} onChange={(e) => setComplaint({ ...complaint, subject: e.target.value })} />
              <textarea style={styles.textarea} placeholder="Describe your issue..." value={complaint.message} onChange={(e) => setComplaint({ ...complaint, message: e.target.value })} rows={4} />
              <button style={styles.submitBtn} onClick={handleComplaint}>Submit Complaint</button>
            </div>
            <h3 style={styles.sectionTitle}>Safety Tips</h3>
            {['Verify passenger identity before starting', 'Share trip details with a trusted contact', 'Keep emergency contacts saved', 'Report suspicious activity immediately'].map((tip, i) => (
              <div key={i} style={styles.tipCard}><p style={styles.tipText}>🛡️ {tip}</p></div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('menu')}>←</button>
            <h2 style={styles.screenTitle}>Settings ⚙️</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.card}>
              <div style={styles.avatarSection}>
                {profile.profile_picture ? <img src={profile.profile_picture} alt="Profile" style={styles.settingsAvatar} /> : <div style={styles.settingsAvatarPlaceholder}>{userName?.charAt(0)}</div>}
                <label style={styles.docUploadBtn}>📷 Change Photo<input type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} /></label>
              </div>
              <input style={styles.input} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input style={styles.input} type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button style={styles.submitBtn} onClick={handleUpdateProfile}>Save Changes</button>
            </div>
            <div style={styles.card}>
              <p style={styles.infoRow}>📧 {profile.email}</p>
              <p style={styles.infoRow}>📅 Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p>
              <p style={styles.infoRow}>🔑 Referral: {profile.referral_code}</p>
              <p style={styles.infoRow}>🔒 Your data is encrypted and secure</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {['home', 'rides', 'earnings', 'messages', 'menu'].includes(activeTab) && (
        <div style={styles.bottomNav}>
          {bottomTabs.map(tab => (
            <button key={tab.id} style={{...styles.navBtn, color: activeTab === tab.id ? '#1a73e8' : '#888'}} onClick={() => setActiveTab(tab.id)}>
              <span style={styles.navIcon}>{tab.icon}</span>
              <span style={styles.navLabel}>{tab.label}</span>
              {tab.id === 'home' && requests.length > 0 && (
                <span style={styles.navBadge}>{requests.length}</span>
              )}
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
  requestBtns: { display: 'flex', gap: '10px' },
  declineBtn: { flex: 1, padding: '12px', backgroundColor: '#fce8e6', color: '#ea4335', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  acceptBtn: { flex: 2, padding: '12px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
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
  statusPill: { padding: '6px 14px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  bottomPanel: { position: 'absolute', bottom: '60px', left: 0, right: 0, backgroundColor: 'white', borderRadius: '24px 24px 0 0', padding: '20px', zIndex: 1000, boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' },
  liveStats: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' },
  liveStat: { textAlign: 'center' },
  liveNum: { fontSize: '18px', fontWeight: 'bold', color: '#1a73e8', margin: '0 0 2px 0' },
  liveLbl: { fontSize: '11px', color: '#888', margin: 0 },
  liveDiv: { width: '1px', height: '28px', backgroundColor: '#eee' },
  goBtn: { width: '100%', padding: '16px', color: 'white', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s', marginBottom: '10px' },
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
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '8px 0 12px 0' },
  convItem: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', borderRadius: '12px', padding: '14px', marginBottom: '8px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  convAvatar: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: 'white', flexShrink: 0 },
  convName: { margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#333' },
  convMsg: { margin: 0, fontSize: '12px', color: '#888' },
  chatScreen: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' },
  chatTopBar: { backgroundColor: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
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
  menuName: { color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0' },
  menuRole: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 },
  menuItem: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '8px', cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  menuIcon: { fontSize: '20px', width: '28px' },
  menuLabel: { flex: 1, fontSize: '15px', color: '#333', fontWeight: '500' },
  menuArrow: { fontSize: '20px', color: '#ccc' },
  logoutItem: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#fce8e6', borderRadius: '12px', padding: '16px', cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left' },
  verifyBanner: { borderRadius: '12px', padding: '14px', marginBottom: '16px' },
  verifyText: { margin: 0, fontWeight: 'bold', fontSize: '14px' },
  docCard: { backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  docTitle: { fontWeight: 'bold', color: '#333', fontSize: '15px', margin: '0 0 4px 0' },
  docHint: { color: '#888', fontSize: '12px', margin: '0 0 12px 0' },
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
  tipCard: { backgroundColor: 'white', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  tipText: { margin: 0, fontSize: '13px', color: '#444' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' },
  settingsAvatar: { width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' },
  settingsAvatarPlaceholder: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: 'white' },
  infoRow: { fontSize: '14px', color: '#555', margin: '0 0 10px 0' },
  empty: { textAlign: 'center', color: '#aaa', padding: '32px 16px', fontSize: '14px' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', backgroundColor: 'white', display: 'flex', borderTop: '1px solid #f0f0f0', zIndex: 2000, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  navBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' },
  navIcon: { fontSize: '22px' },
  navLabel: { fontSize: '10px', fontWeight: '500' },
  navBadge: { position: 'absolute', top: '4px', right: '18%', backgroundColor: '#ea4335', color: 'white', borderRadius: '10px', fontSize: '9px', padding: '2px 5px', fontWeight: 'bold' },
};

export default DriverDashboard;