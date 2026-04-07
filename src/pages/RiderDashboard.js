import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function RiderDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [myBookings, setMyBookings] = useState([]);
  const [rides, setRides] = useState([]);
  const [profile, setProfile] = useState({});
  const [ratings, setRatings] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchMode, setSearchMode] = useState('city');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromLat, setFromLat] = useState(null);
  const [fromLng, setFromLng] = useState(null);
  const [toLat, setToLat] = useState(null);
  const [toLng, setToLng] = useState(null);
  const [matchedRides, setMatchedRides] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [complaint, setComplaint] = useState({ subject: '', message: '' });
  const [selectedRide, setSelectedRide] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [idImage, setIdImage] = useState(null);

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || localStorage.getItem('userRole') !== 'rider') {
      navigate('/login');
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [profileRes, bookingsRes, walletRes, referralsRes, convsRes] = await Promise.all([
        axios.get(`${API}/profile/${userId}`),
        axios.get(`${API}/my-bookings/${userId}`),
        axios.get(`${API}/wallet/${userId}`),
        axios.get(`${API}/referrals/${userId}`),
        axios.get(`${API}/conversations/${userId}`),
      ]);
      setProfile(profileRes.data.user);
      setName(profileRes.data.user.name);
      setPhone(profileRes.data.user.phone || '');
      setMyBookings(bookingsRes.data.bookings);
      setWallet(walletRes.data);
      setReferrals(referralsRes.data.referrals);
      setConversations(convsRes.data.conversations);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFindRide = async () => {
    try {
      let params = {};
      if (searchMode === 'city') {
        params = { from_city: fromCity, to_city: toCity };
      } else {
        params = { from_lat: fromLat, from_lng: fromLng, to_lat: toLat, to_lng: toLng };
      }
      const response = await axios.get(`${API}/rides/match`, { params });
      setMatchedRides(response.data.matches);
      if (response.data.matches.length === 0) setMessage('No rides found. Try different locations.');
      else setMessage('');
    } catch (error) {
      setMessage('Error finding rides.');
    }
  };

  const handleBookRide = async (rideId) => {
    try {
      await axios.post(`${API}/bookings`, { ride_id: rideId, passenger_id: userId });
      setMessage('Ride booked successfully! 🎉');
      fetchAll();
    } catch (error) {
      setMessage('Error booking ride.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    await axios.put(`${API}/bookings/${bookingId}/cancel`);
    setMessage('Booking cancelled.');
    fetchAll();
  };

  const handleSubmitRating = async () => {
    if (!selectedRide) return;
    await axios.post(`${API}/ratings`, {
      ride_id: selectedRide.id,
      passenger_id: userId,
      driver_id: selectedRide.driver_id,
      rating,
      comment,
    });
    setMessage('Rating submitted!');
    setSelectedRide(null);
    setRating(5);
    setComment('');
  };

  const handleUpdateProfile = async () => {
    await axios.put(`${API}/users/${userId}/profile`, { name, phone });
    setMessage('Profile updated!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await axios.put(`${API}/users/${userId}/picture`, { profile_picture: reader.result });
      setProfile({ ...profile, profile_picture: reader.result });
      setMessage('Profile picture updated!');
      setTimeout(() => setMessage(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleIdUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdImage(reader.result);
      setMessage('ID card uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleComplaint = async () => {
    await axios.post(`${API}/complaints`, { user_id: userId, subject: complaint.subject, message: complaint.message });
    setComplaint({ subject: '', message: '' });
    setMessage('Complaint submitted! Admin will respond soon.');
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
    { id: 'find', label: '🔍 Find a Ride' },
    { id: 'bookings', label: '🎫 My Bookings' },
    { id: 'messages', label: '💬 Messages' },
    { id: 'ratings', label: '⭐ Rate Driver' },
    { id: 'wallet', label: '👛 Wallet' },
    { id: 'referrals', label: '👥 Referrals' },
    { id: 'help', label: '🆘 Help' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          {profile.profile_picture ? (
            <img src={profile.profile_picture} alt="Profile" style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder}>{userName?.charAt(0)}</div>
          )}
          <p style={styles.sidebarName}>{userName}</p>
          <p style={styles.sidebarRole}>🧑 Rider</p>
        </div>

        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{...styles.tabBtn, ...(activeTab === tab.id ? styles.tabActive : {})}}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}

        <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {message && <div style={styles.successMsg}>{message}</div>}

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div>
            <h2 style={styles.pageTitle}>Welcome, {userName}! 👋</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <p style={styles.statNum}>{myBookings.length}</p>
                <p style={styles.statLbl}>Total Trips</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statNum}>GH₵ {wallet.balance?.toFixed(2) || '0.00'}</p>
                <p style={styles.statLbl}>Wallet Balance</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statNum}>{referrals.length}</p>
                <p style={styles.statLbl}>Referrals</p>
              </div>
            </div>
            <button style={styles.findRideBtn} onClick={() => setActiveTab('find')}>🔍 Find a Ride Now</button>

            <h3 style={styles.sectionTitle}>Recent Trips</h3>
            {myBookings.slice(0, 3).map(booking => (
              <div key={booking.id} style={styles.rideCard}>
                <p style={styles.rideRoute}>📍 {booking.from_location} → {booking.to_location}</p>
                <p style={styles.rideDetail}>🚗 Driver: {booking.driver_name}</p>
                <p style={styles.rideDetail}>💰 GH₵ {booking.price}</p>
              </div>
            ))}
          </div>
        )}

        {/* FIND RIDE TAB */}
        {activeTab === 'find' && (
          <div>
            <h2 style={styles.pageTitle}>Find a Ride 🔍</h2>
            <div style={styles.searchCard}>
              <div style={styles.toggleRow}>
                <button style={{...styles.toggleBtn, ...(searchMode === 'city' ? styles.toggleActive : {})}} onClick={() => setSearchMode('city')}>🏙️ By City</button>
                <button style={{...styles.toggleBtn, ...(searchMode === 'map' ? styles.toggleActive : {})}} onClick={() => setSearchMode('map')}>🗺️ By Map</button>
              </div>
              {searchMode === 'city' ? (
                <>
                  <input style={styles.input} type="text" placeholder="From city (e.g. Accra)" value={fromCity} onChange={(e) => setFromCity(e.target.value)} />
                  <input style={styles.input} type="text" placeholder="To city (e.g. Tema)" value={toCity} onChange={(e) => setToCity(e.target.value)} />
                </>
              ) : (
                <>
                  <MapPicker label="Pickup Location" lat={fromLat} lng={fromLng} onLocationSelect={(lat, lng) => { setFromLat(lat); setFromLng(lng); }} />
                  <MapPicker label="Dropoff Location" lat={toLat} lng={toLng} onLocationSelect={(lat, lng) => { setToLat(lat); setToLng(lng); }} />
                </>
              )}
              <button style={styles.button} onClick={handleFindRide}>Search Rides</button>
            </div>

            {matchedRides.length > 0 && (
              <div>
                <h3 style={styles.sectionTitle}>Available Rides</h3>
                {matchedRides.map(ride => (
                  <div key={ride.id} style={styles.rideCard}>
                    <div>
                      <p style={styles.rideRoute}>📍 {ride.from_location} → {ride.to_location}</p>
                      <p style={styles.rideDetail}>🚗 Driver: {ride.driver_name} {ride.is_online ? '🟢' : '⚫'}</p>
                      <p style={styles.rideDetail}>🕐 {ride.departure_time}</p>
                      <p style={styles.rideDetail}>💺 {ride.seats_available} seats | GH₵ {ride.price}</p>
                      {ride.driver_phone && (
                        <a href={`tel:${ride.driver_phone}`} style={styles.callBtn}>📞 Call Driver</a>
                      )}
                    </div>
                    <button style={styles.bookBtn} onClick={() => handleBookRide(ride.id)}>Book</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={styles.pageTitle}>My Bookings 🎫</h2>
            {myBookings.length === 0 ? (
              <p style={styles.empty}>No bookings yet.</p>
            ) : (
              myBookings.map(booking => (
                <div key={booking.id} style={styles.rideCard}>
                  <div>
                    <p style={styles.rideRoute}>📍 {booking.from_location} → {booking.to_location}</p>
                    <p style={styles.rideDetail}>🚗 Driver: {booking.driver_name}</p>
                    <p style={styles.rideDetail}>🕐 {booking.departure_time}</p>
                    <p style={styles.rideDetail}>💰 GH₵ {booking.price}</p>
                    {booking.driver_phone && (
                      <a href={`tel:${booking.driver_phone}`} style={styles.callBtn}>📞 Call Driver</a>
                    )}
                  </div>
                  <div style={styles.rideRight}>
                    <span style={{...styles.badge, backgroundColor: booking.booking_status === 'pending' ? '#1a73e8' : '#888'}}>{booking.booking_status}</span>
                    {booking.booking_status === 'pending' && (
                      <button style={styles.cancelBtn} onClick={() => handleCancelBooking(booking.id)}>Cancel</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div style={styles.chatContainer}>
            <div style={styles.chatSidebar}>
              <h3 style={styles.chatTitle}>Conversations</h3>
              {conversations.length === 0 ? (
                <p style={styles.empty}>No conversations yet.</p>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.other_user_id}
                    style={{...styles.convItem, backgroundColor: selectedChat?.other_user_id === conv.other_user_id ? '#e8f0fe' : 'white'}}
                    onClick={() => { setSelectedChat(conv); fetchMessages(conv.other_user_id); }}
                  >
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
                      <div key={msg.id} style={{
                        ...styles.msgBubble,
                        alignSelf: msg.sender_id == userId ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.sender_id == userId ? '#1a73e8' : '#f1f3f4',
                        color: msg.sender_id == userId ? 'white' : '#333',
                      }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  <div style={styles.msgInput}>
                    <input style={styles.msgField} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                    <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
                  </div>
                </>
              ) : (
                <div style={styles.noChatSelected}>Select a conversation to start messaging</div>
              )}
            </div>
          </div>
        )}

        {/* RATINGS TAB */}
        {activeTab === 'ratings' && (
          <div>
            <h2 style={styles.pageTitle}>Rate a Driver ⭐</h2>
            <p style={styles.helpNote}>Select a trip to rate the driver</p>
            {myBookings.map(booking => (
              <div
                key={booking.id}
                style={{...styles.rideCard, border: selectedRide?.id === booking.id ? '2px solid #1a73e8' : '1px solid #eee', cursor: 'pointer'}}
                onClick={() => setSelectedRide(booking)}
              >
                <p style={styles.rideRoute}>📍 {booking.from_location} → {booking.to_location}</p>
                <p style={styles.rideDetail}>🚗 Driver: {booking.driver_name}</p>
              </div>
            ))}
            {selectedRide && (
              <div style={styles.ratingBox}>
                <p style={styles.sectionTitle}>Rate your trip with {selectedRide.driver_name}</p>
                <div style={styles.starsRow}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} style={{...styles.starBtn, fontSize: star <= rating ? '32px' : '24px', opacity: star <= rating ? 1 : 0.4}} onClick={() => setRating(star)}>⭐</button>
                  ))}
                </div>
                <textarea style={styles.textarea} placeholder="Leave a comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                <button style={styles.button} onClick={handleSubmitRating}>Submit Rating</button>
              </div>
            )}
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div>
            <h2 style={styles.pageTitle}>Wallet 👛</h2>
            <div style={styles.walletCard}>
              <p style={styles.walletLabel}>Current Balance</p>
              <p style={styles.walletBalance}>GH₵ {wallet.balance?.toFixed(2) || '0.00'}</p>
              <p style={styles.walletNote}>Earn more by referring friends!</p>
            </div>
            <h3 style={styles.sectionTitle}>Transaction History</h3>
            {wallet.transactions?.length === 0 ? (
              <p style={styles.empty}>No transactions yet.</p>
            ) : (
              wallet.transactions?.map(t => (
                <div key={t.id} style={styles.rideCard}>
                  <p style={styles.rideRoute}>{t.description}</p>
                  <p style={{...styles.rideDetail, color: t.amount > 0 ? '#34a853' : '#ea4335'}}>GH₵ {t.amount}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* REFERRALS TAB */}
        {activeTab === 'referrals' && (
          <div>
            <h2 style={styles.pageTitle}>Referrals 👥</h2>
            <div style={styles.referralCard}>
              <p style={styles.referralLabel}>Your Referral Code</p>
              <p style={styles.referralCode}>{profile.referral_code}</p>
              <p style={styles.referralNote}>Share this code with friends. You earn GH₵ 5 for each person who joins!</p>
            </div>
            <h3 style={styles.sectionTitle}>People You Referred ({referrals.length})</h3>
            {referrals.length === 0 ? (
              <p style={styles.empty}>No referrals yet. Share your code!</p>
            ) : (
              referrals.map(r => (
                <div key={r.id} style={styles.rideCard}>
                  <p style={styles.rideRoute}>👤 {r.referred_name}</p>
                  <p style={styles.rideDetail}>Joined: {new Date(r.joined_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* HELP TAB */}
        {activeTab === 'help' && (
          <div>
            <h2 style={styles.pageTitle}>Help Center 🆘</h2>
            <div style={styles.helpCard}>
              <input style={styles.input} type="text" placeholder="Subject" value={complaint.subject} onChange={(e) => setComplaint({ ...complaint, subject: e.target.value })} />
              <textarea style={styles.textarea} placeholder="Describe your issue..." value={complaint.message} onChange={(e) => setComplaint({ ...complaint, message: e.target.value })} rows={5} />
              <button style={styles.button} onClick={handleComplaint}>Submit Complaint</button>
            </div>
            <h3 style={styles.sectionTitle}>Safety Tips</h3>
            {['Always verify the driver and vehicle before boarding',
              'Share your trip details with a trusted contact',
              'Sit in the back seat when possible',
              'Trust your instincts — cancel if you feel unsafe',
              'Keep emergency contacts saved on your phone'].map((tip, i) => (
              <div key={i} style={styles.tipCard}>
                <p style={styles.tipText}>🛡️ {tip}</p>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div>
            <h2 style={styles.pageTitle}>Settings ⚙️</h2>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.settingsCard}>
              <div style={styles.avatarSection}>
                {profile.profile_picture ? (
                  <img src={profile.profile_picture} alt="Profile" style={styles.bigAvatar} />
                ) : (
                  <div style={styles.bigAvatarPlaceholder}>{userName?.charAt(0)}</div>
                )}
                <label style={styles.uploadBtn}>
                  📷 Change Photo
                  <input type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} />
                </label>
              </div>
              <input style={styles.input} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input style={styles.input} type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button style={styles.button} onClick={handleUpdateProfile}>Save Changes</button>
            </div>

            <h3 style={styles.sectionTitle}>Upload ID Card</h3>
            <div style={styles.settingsCard}>
              <p style={styles.helpNote}>Upload your ID card for verification and safety purposes.</p>
              {idImage && <img src={idImage} alt="ID" style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }} />}
              <label style={styles.uploadBtn}>
                📄 Upload ID Card
                <input type="file" accept="image/*" onChange={handleIdUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <h3 style={styles.sectionTitle}>Account Info</h3>
            <div style={styles.settingsCard}>
              <p style={styles.infoRow}>📧 Email: {profile.email}</p>
              <p style={styles.infoRow}>🎭 Role: Rider</p>
              <p style={styles.infoRow}>📅 Member since: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p>
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
  sidebar: { width: '220px', backgroundColor: '#34a853', display: 'flex', flexDirection: 'column', padding: '16px', gap: '4px', flexShrink: 0 },
  sidebarHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' },
  avatarPlaceholder: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: 'white' },
  sidebarName: { color: 'white', fontWeight: 'bold', fontSize: '14px', margin: 0, textAlign: 'center' },
  sidebarRole: { color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 },
  tabBtn: { padding: '10px 12px', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', textAlign: 'left' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' },
  logoutBtn: { marginTop: 'auto', padding: '10px', backgroundColor: 'rgba(255,0,0,0.3)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  successMsg: { backgroundColor: '#e6f4ea', color: '#34a853', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' },
  pageTitle: { color: '#34a853', fontSize: '24px', marginBottom: '24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
  statNum: { fontSize: '24px', fontWeight: 'bold', color: '#34a853', margin: '0 0 4px 0' },
  statLbl: { fontSize: '12px', color: '#888', margin: 0 },
  findRideBtn: { display: 'inline-block', padding: '14px 32px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '24px' },
  sectionTitle: { color: '#333', fontSize: '18px', marginBottom: '12px', marginTop: '24px' },
  rideCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rideRoute: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' },
  rideDetail: { fontSize: '13px', color: '#666', margin: '0 0 2px 0' },
  rideRight: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  badge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  cancelBtn: { padding: '6px 12px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  callBtn: { display: 'inline-block', marginTop: '4px', padding: '4px 10px', backgroundColor: '#34a853', color: 'white', borderRadius: '6px', fontSize: '12px', textDecoration: 'none' },
  bookBtn: { padding: '10px 20px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  searchCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  toggleRow: { display: 'flex', gap: '8px' },
  toggleBtn: { flex: 1, padding: '10px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', backgroundColor: 'white', color: '#333' },
  toggleActive: { borderColor: '#34a853', backgroundColor: '#e8f5e9', color: '#34a853' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  button: { padding: '12px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  ratingBox: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  starsRow: { display: 'flex', gap: '8px' },
  starBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', outline: 'none' },
  walletCard: { background: 'linear-gradient(135deg, #34a853 0%, #1e7e34 100%)', padding: '32px', borderRadius: '16px', textAlign: 'center', color: 'white', marginBottom: '24px' },
  walletLabel: { fontSize: '14px', opacity: 0.9, margin: '0 0 8px 0' },
  walletBalance: { fontSize: '48px', fontWeight: 'bold', margin: '0 0 8px 0' },
  walletNote: { fontSize: '13px', opacity: 0.85, margin: 0 },
  referralCard: { backgroundColor: '#34a853', padding: '24px', borderRadius: '12px', textAlign: 'center', color: 'white', marginBottom: '24px' },
  referralLabel: { fontSize: '14px', opacity: 0.9, margin: '0 0 8px 0' },
  referralCode: { fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '4px' },
  referralNote: { fontSize: '13px', opacity: 0.85, margin: 0 },
  helpNote: { color: '#888', fontSize: '14px', marginBottom: '16px' },
  helpCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  tipCard: { backgroundColor: 'white', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '8px' },
  tipText: { margin: 0, fontSize: '14px', color: '#333' },
  settingsCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '16px' },
  bigAvatar: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
  bigAvatarPlaceholder: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'white' },
  uploadBtn: { padding: '8px 16px', backgroundColor: '#34a853', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  infoRow: { margin: '0 0 8px 0', fontSize: '14px', color: '#555' },
  chatContainer: { display: 'flex', height: 'calc(100vh - 100px)', gap: '16px' },
  chatSidebar: { width: '240px', backgroundColor: 'white', borderRadius: '12px', padding: '16px', overflowY: 'auto' },
  chatTitle: { color: '#34a853', fontSize: '16px', margin: '0 0 12px 0' },
  convItem: { padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', border: '1px solid #eee' },
  convName: { margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#333' },
  convMsg: { margin: 0, fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chatMain: { flex: 1, backgroundColor: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '16px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#333' },
  msgList: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  msgBubble: { maxWidth: '60%', padding: '10px 14px', borderRadius: '16px' },
  msgInput: { padding: '12px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' },
  msgField: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  sendBtn: { padding: '10px 20px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
  noChatSelected: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' },
  empty: { color: '#888', textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '12px' },
};

export default RiderDashboard;