import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

function LocationMarker() {
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

function RiderDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [myBookings, setMyBookings] = useState([]);
  const [profile, setProfile] = useState({});
  const [ratings, setRatings] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [matchedRides, setMatchedRides] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [complaint, setComplaint] = useState({ subject: '', message: '' });
  const [selectedRide, setSelectedRide] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

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
    } catch (error) { console.error('Error:', error); }
  };

  const handleSearch = async () => {
    if (!fromCity && !toCity) return;
    try {
      const response = await axios.get(`${API}/rides/match`, {
        params: { from_city: fromCity, to_city: toCity }
      });
      setSearchResults(response.data.matches);
      setShowSearch(false);
      setActiveTab('results');
      if (response.data.matches.length === 0) setMessage('No rides found. Try different locations.');
    } catch (error) { setMessage('Error finding rides.'); }
  };

  const handleBookRide = async (rideId) => {
    try {
      await axios.post(`${API}/bookings`, { ride_id: rideId, passenger_id: userId });
      setMessage('✅ Ride booked successfully!');
      fetchAll();
      setActiveTab('rides');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) { setMessage('❌ Error booking ride.'); }
  };

  const handleCancelBooking = async (bookingId) => {
    await axios.put(`${API}/bookings/${bookingId}/cancel`);
    setMessage('✅ Booking cancelled.');
    fetchAll();
    setTimeout(() => setMessage(''), 3000);
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
    setMessage('✅ Rating submitted!');
    setSelectedRide(null);
    setRating(5);
    setComment('');
    setTimeout(() => setMessage(''), 3000);
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
    { id: 'rides', icon: '🎫', label: 'Rides' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'account', icon: '👤', label: 'Account' },
  ];

  return (
    <div style={styles.app}>
      {/* Toast */}
      {message && <div style={styles.toast}>{message}</div>}

      {/* Search Modal */}
      {showSearch && (
        <div style={styles.searchModal}>
          <div style={styles.searchHeader}>
            <button style={styles.closeSearch} onClick={() => setShowSearch(false)}>✕</button>
            <p style={styles.searchTitle}>Where are you going?</p>
          </div>
          <div style={styles.searchBody}>
            <div style={styles.searchInputGroup}>
              <div style={styles.searchDot} />
              <input
                style={styles.searchInput}
                type="text"
                placeholder="From (e.g. Accra Central)"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                autoFocus
              />
            </div>
            <div style={styles.searchDivider} />
            <div style={styles.searchInputGroup}>
              <div style={{...styles.searchDot, backgroundColor: '#ea4335'}} />
              <input
                style={styles.searchInput}
                type="text"
                placeholder="To (e.g. Tema)"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button style={styles.searchBtn} onClick={handleSearch}>
            🔍 Find Available Rides
          </button>

          {/* Quick Suggestions */}
          <div style={styles.suggestions}>
            <p style={styles.suggestTitle}>Popular Routes</p>
            {[['Accra', 'Tema'], ['Accra', 'Kasoa'], ['Accra', 'Kumasi'], ['Accra', 'Takoradi']].map(([from, to]) => (
              <button key={from+to} style={styles.suggestItem} onClick={() => { setFromCity(from); setToCity(to); }}>
                <span style={styles.suggestIcon}>🕐</span>
                <span style={styles.suggestText}>{from} → {to}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div style={styles.homeScreen}>
          {/* Full Screen Map */}
          <div style={styles.fullMap}>
            <MapContainer center={[5.6037, -0.1870]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
            </MapContainer>
          </div>

          {/* Top Bar */}
          <div style={styles.homeTopBar}>
            <div style={styles.hamburger}>☰</div>
            <div style={styles.homeTitle}>🚗 RideShare</div>
            {profile.profile_picture ? (
              <img src={profile.profile_picture} alt="Profile" style={styles.homeAvatar} onClick={() => setActiveTab('account')} />
            ) : (
              <div style={styles.homeAvatarPlaceholder} onClick={() => setActiveTab('account')}>{userName?.charAt(0)}</div>
            )}
          </div>

          {/* Bottom Sheet */}
          <div style={styles.homeBottomSheet}>
            {/* Where to bar */}
            <button style={styles.whereToBar} onClick={() => setShowSearch(true)}>
              <span style={styles.whereToIcon}>🔍</span>
              <span style={styles.whereToText}>Where to?</span>
              <span style={styles.whereLater}>Later</span>
            </button>

            {/* Quick Stats */}
            <div style={styles.quickStats}>
              <div style={styles.quickStat}>
                <p style={styles.quickStatNum}>{myBookings.length}</p>
                <p style={styles.quickStatLbl}>Total Trips</p>
              </div>
              <div style={styles.quickStatDivider} />
              <div style={styles.quickStat}>
                <p style={styles.quickStatNum}>GH₵ {wallet.balance?.toFixed(2) || '0.00'}</p>
                <p style={styles.quickStatLbl}>Wallet</p>
              </div>
              <div style={styles.quickStatDivider} />
              <div style={styles.quickStat}>
                <p style={styles.quickStatNum}>{referrals.length}</p>
                <p style={styles.quickStatLbl}>Referrals</p>
              </div>
            </div>

            {/* Recent Trip */}
            {myBookings.length > 0 && (
              <div style={styles.recentTrip}>
                <p style={styles.recentTitle}>Recent Trip</p>
                <div style={styles.recentCard}>
                  <div style={styles.recentIcon}>🚗</div>
                  <div style={styles.recentInfo}>
                    <p style={styles.recentRoute}>{myBookings[0].from_location} → {myBookings[0].to_location}</p>
                    <p style={styles.recentDetail}>Driver: {myBookings[0].driver_name} | GH₵ {myBookings[0].price}</p>
                  </div>
                  <span style={{...styles.recentBadge, backgroundColor: myBookings[0].booking_status === 'pending' ? '#1a73e8' : '#34a853'}}>{myBookings[0].booking_status}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH RESULTS */}
      {activeTab === 'results' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => { setActiveTab('home'); setSearchResults([]); }}>←</button>
            <h2 style={styles.screenTitle}>Available Rides</h2>
          </div>
          <div style={styles.content}>
            {searchResults.length === 0 ? (
              <div style={styles.noResults}>
                <p style={styles.noResultsIcon}>🔍</p>
                <p style={styles.noResultsText}>No rides found</p>
                <p style={styles.noResultsSub}>Try different locations or check back later</p>
                <button style={styles.tryAgainBtn} onClick={() => { setShowSearch(true); setActiveTab('home'); }}>Try Again</button>
              </div>
            ) : (
              searchResults.map(ride => (
                <div key={ride.id} style={styles.rideResultCard}>
                  <div style={styles.rideResultTop}>
                    <div style={styles.driverInfo}>
                      {ride.profile_picture ? (
                        <img src={ride.profile_picture} alt="Driver" style={styles.driverAvatar} />
                      ) : (
                        <div style={styles.driverAvatarPlaceholder}>{ride.driver_name?.charAt(0)}</div>
                      )}
                      <div>
                        <p style={styles.driverName}>{ride.driver_name}</p>
                        <p style={styles.driverStatus}>{ride.is_online ? '🟢 Online' : '⚫ Offline'}</p>
                      </div>
                    </div>
                    <div style={styles.ridePrice}>
                      <p style={styles.ridePriceNum}>GH₵ {ride.price}</p>
                      <p style={styles.ridePriceLbl}>per seat</p>
                    </div>
                  </div>
                  <div style={styles.rideResultRoute}>
                    <div style={styles.routeDot} />
                    <p style={styles.routeText}>{ride.from_location}</p>
                  </div>
                  <div style={styles.routeLine} />
                  <div style={styles.rideResultRoute}>
                    <div style={{...styles.routeDot, backgroundColor: '#ea4335'}} />
                    <p style={styles.routeText}>{ride.to_location}</p>
                  </div>
                  <div style={styles.rideResultBottom}>
                    <p style={styles.rideSeats}>💺 {ride.seats_available} seats available</p>
                    <p style={styles.rideTime}>🕐 {ride.departure_time}</p>
                  </div>
                  {ride.driver_phone && (
                    <a href={`tel:${ride.driver_phone}`} style={styles.callDriverBtn}>📞 Call Driver</a>
                  )}
                  <button style={styles.bookNowBtn} onClick={() => handleBookRide(ride.id)}>
                    Book Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RIDES TAB */}
      {activeTab === 'rides' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <h2 style={styles.screenTitle}>My Trips 🎫</h2>
            <button style={styles.addBtn} onClick={() => { setShowSearch(true); setActiveTab('home'); }}>+ Book</button>
          </div>
          <div style={styles.content}>
            {myBookings.length === 0 ? (
              <div style={styles.noResults}>
                <p style={styles.noResultsIcon}>🚗</p>
                <p style={styles.noResultsText}>No trips yet</p>
                <button style={styles.tryAgainBtn} onClick={() => { setShowSearch(true); setActiveTab('home'); }}>Book Your First Ride</button>
              </div>
            ) : (
              myBookings.map(booking => (
                <div key={booking.id} style={styles.tripCard}>
                  <div style={styles.tripHeader}>
                    <div style={styles.tripRoute}>
                      <div style={styles.routeDot} />
                      <p style={styles.tripRouteText}>{booking.from_location}</p>
                    </div>
                    <div style={styles.tripRouteLine} />
                    <div style={styles.tripRoute}>
                      <div style={{...styles.routeDot, backgroundColor: '#ea4335'}} />
                      <p style={styles.tripRouteText}>{booking.to_location}</p>
                    </div>
                  </div>
                  <div style={styles.tripDetails}>
                    <p style={styles.tripDetail}>🚗 {booking.driver_name}</p>
                    <p style={styles.tripDetail}>🕐 {booking.departure_time}</p>
                    <p style={styles.tripDetail}>💰 GH₵ {booking.price}</p>
                    {booking.driver_phone && (
                      <a href={`tel:${booking.driver_phone}`} style={styles.callBtn}>📞 Call</a>
                    )}
                  </div>
                  <div style={styles.tripFooter}>
                    <span style={{...styles.statusBadge, backgroundColor: booking.booking_status === 'pending' ? '#1a73e8' : '#888'}}>{booking.booking_status}</span>
                    <div style={styles.tripActions}>
                      {booking.booking_status === 'pending' && (
                        <button style={styles.cancelBtn} onClick={() => handleCancelBooking(booking.id)}>Cancel</button>
                      )}
                      <button style={styles.rateBtn} onClick={() => setSelectedRide(booking)}>Rate</button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Rating Modal */}
            {selectedRide && (
              <div style={styles.ratingModal}>
                <div style={styles.ratingCard}>
                  <p style={styles.ratingTitle}>Rate your trip</p>
                  <p style={styles.ratingDriver}>🚗 {selectedRide.driver_name}</p>
                  <div style={styles.starsRow}>
                    {[1,2,3,4,5].map(star => (
                      <button key={star} style={{...styles.star, fontSize: star <= rating ? '36px' : '28px', opacity: star <= rating ? 1 : 0.3}} onClick={() => setRating(star)}>⭐</button>
                    ))}
                  </div>
                  <textarea style={styles.ratingInput} placeholder="Leave a comment..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                  <div style={styles.ratingBtns}>
                    <button style={styles.cancelRatingBtn} onClick={() => setSelectedRide(null)}>Cancel</button>
                    <button style={styles.submitRatingBtn} onClick={handleSubmitRating}>Submit</button>
                  </div>
                </div>
              </div>
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
              {conversations.length === 0 ? (
                <div style={styles.noResults}>
                  <p style={styles.noResultsIcon}>💬</p>
                  <p style={styles.noResultsText}>No messages yet</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div key={conv.other_user_id} style={styles.convItem} onClick={() => { setSelectedChat(conv); fetchMessages(conv.other_user_id); }}>
                    <div style={styles.convAvatar}>{conv.other_user_name?.charAt(0)}</div>
                    <div style={styles.convInfo}>
                      <p style={styles.convName}>{conv.other_user_name}</p>
                      <p style={styles.convMsg}>{conv.last_message}</p>
                    </div>
                    <span style={styles.convArrow}>›</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={styles.chatScreen}>
              <div style={styles.chatTopBar}>
                <button style={styles.backBtn} onClick={() => setSelectedChat(null)}>←</button>
                <div style={styles.chatAvatar}>{selectedChat.other_user_name?.charAt(0)}</div>
                <p style={styles.chatName}>{selectedChat.other_user_name}</p>
              </div>
              <div style={styles.msgList}>
                {messages.map(msg => (
                  <div key={msg.id} style={{...styles.msgBubble, alignSelf: msg.sender_id == userId ? 'flex-end' : 'flex-start', backgroundColor: msg.sender_id == userId ? '#34a853' : '#f1f3f4', color: msg.sender_id == userId ? 'white' : '#333'}}>
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

      {/* ACCOUNT TAB */}
      {activeTab === 'account' && (
        <div style={styles.screen}>
          <div style={styles.accountHeader}>
            <div style={styles.accountProfile}>
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile" style={styles.accountAvatar} />
              ) : (
                <div style={styles.accountAvatarPlaceholder}>{userName?.charAt(0)}</div>
              )}
              <div>
                <p style={styles.accountName}>{userName}</p>
                <p style={styles.accountRole}>🧑 Rider</p>
              </div>
              <label style={styles.editPhotoBtn}>
                📷
                <input type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Wallet Card */}
            <div style={styles.walletCard}>
              <p style={styles.walletLabel}>Wallet Balance</p>
              <p style={styles.walletBalance}>GH₵ {wallet.balance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          <div style={styles.content}>
            {/* Account Menu */}
            {[
              { icon: '👤', label: 'Personal Info', id: 'personal' },
              { icon: '👛', label: 'Wallet & Transactions', id: 'wallet' },
              { icon: '⭐', label: 'Rate a Driver', id: 'rate' },
              { icon: '👥', label: 'Referrals', id: 'referrals' },
              { icon: '🆘', label: 'Help Center', id: 'help' },
              { icon: '🛡️', label: 'Safety', id: 'safety' },
              { icon: '🔒', label: 'Privacy & Security', id: 'privacy' },
            ].map(item => (
              <button key={item.id} style={styles.accountMenuItem} onClick={() => setActiveTab(item.id)}>
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

      {/* PERSONAL INFO */}
      {activeTab === 'personal' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('account')}>←</button>
            <h2 style={styles.screenTitle}>Personal Info</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.formCard}>
              <input style={styles.input} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input style={styles.input} type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input style={{...styles.input, color: '#888'}} type="email" value={profile.email || ''} disabled />
              <button style={styles.saveBtn} onClick={handleUpdateProfile}>Save Changes</button>
            </div>
            <div style={styles.formCard}>
              <p style={styles.sectionLabel}>Upload ID Card</p>
              <p style={styles.sectionHint}>Upload your Ghana Card for identity verification</p>
              {idImage && <img src={idImage} alt="ID" style={styles.idPreview} />}
              <label style={styles.uploadIdBtn}>
                📄 Upload Ghana Card
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setIdImage(reader.result);
                    reader.readAsDataURL(file);
                  }
                }} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* WALLET */}
      {activeTab === 'wallet' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('account')}>←</button>
            <h2 style={styles.screenTitle}>Wallet 👛</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.walletBigCard}>
              <p style={styles.walletBigLabel}>Available Balance</p>
              <p style={styles.walletBigNum}>GH₵ {wallet.balance?.toFixed(2) || '0.00'}</p>
              <p style={styles.walletBigNote}>Earn more by referring friends!</p>
            </div>
            <p style={styles.sectionLabel}>Transaction History</p>
            {!wallet.transactions || wallet.transactions.length === 0 ? (
              <p style={styles.emptyText}>No transactions yet.</p>
            ) : (
              wallet.transactions.map(t => (
                <div key={t.id} style={styles.transCard}>
                  <p style={styles.transDesc}>{t.description}</p>
                  <p style={{...styles.transAmt, color: t.amount > 0 ? '#34a853' : '#ea4335'}}>
                    {t.amount > 0 ? '+' : ''}GH₵ {t.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RATE A DRIVER */}
      {activeTab === 'rate' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('account')}>←</button>
            <h2 style={styles.screenTitle}>Rate a Driver ⭐</h2>
          </div>
          <div style={styles.content}>
            <p style={styles.sectionHint}>Select a trip to rate the driver</p>
            {myBookings.map(booking => (
              <div key={booking.id} style={{...styles.tripCard, border: selectedRide?.id === booking.id ? '2px solid #34a853' : '1px solid transparent', cursor: 'pointer'}} onClick={() => setSelectedRide(booking)}>
                <p style={styles.cardRoute}>📍 {booking.from_location} → {booking.to_location}</p>
                <p style={styles.cardDetail}>🚗 {booking.driver_name}</p>
              </div>
            ))}
            {selectedRide && (
              <div style={styles.formCard}>
                <p style={styles.sectionLabel}>Rating for {selectedRide.driver_name}</p>
                <div style={styles.starsRow}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} style={{...styles.star, fontSize: star <= rating ? '36px' : '28px', opacity: star <= rating ? 1 : 0.3}} onClick={() => setRating(star)}>⭐</button>
                  ))}
                </div>
                <textarea style={styles.ratingInput} placeholder="Leave a comment..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                <button style={styles.saveBtn} onClick={handleSubmitRating}>Submit Rating</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REFERRALS */}
      {activeTab === 'referrals' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('account')}>←</button>
            <h2 style={styles.screenTitle}>Referrals 👥</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.referralBox}>
              <p style={styles.referralLabel}>Your Code</p>
              <p style={styles.referralCode}>{profile.referral_code}</p>
              <p style={styles.referralNote}>Earn GH₵ 5 for each friend who joins!</p>
            </div>
            <p style={styles.sectionLabel}>People You Referred ({referrals.length})</p>
            {referrals.length === 0 ? <p style={styles.emptyText}>No referrals yet.</p> : (
              referrals.map(r => (
                <div key={r.id} style={styles.tripCard}>
                  <p style={styles.cardRoute}>👤 {r.referred_name}</p>
                  <p style={styles.cardDetail}>Joined: {new Date(r.joined_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* HELP */}
      {activeTab === 'help' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('account')}>←</button>
            <h2 style={styles.screenTitle}>Help Center 🆘</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.formCard}>
              <input style={styles.input} type="text" placeholder="Subject" value={complaint.subject} onChange={(e) => setComplaint({ ...complaint, subject: e.target.value })} />
              <textarea style={styles.ratingInput} placeholder="Describe your issue..." value={complaint.message} onChange={(e) => setComplaint({ ...complaint, message: e.target.value })} rows={4} />
              <button style={styles.saveBtn} onClick={handleComplaint}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* SAFETY */}
      {activeTab === 'safety' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('account')}>←</button>
            <h2 style={styles.screenTitle}>Safety 🛡️</h2>
          </div>
          <div style={styles.content}>
            {['Always verify the driver and vehicle before boarding',
              'Share your trip details with a trusted contact',
              'Sit in the back seat when possible',
              'Trust your instincts — cancel if you feel unsafe',
              'Keep emergency contacts saved on your phone',
              'Call 911 or 191 in case of emergency'].map((tip, i) => (
              <div key={i} style={styles.tipCard}><p style={styles.tipText}>🛡️ {tip}</p></div>
            ))}
          </div>
        </div>
      )}

      {/* PRIVACY */}
      {activeTab === 'privacy' && (
        <div style={styles.screen}>
          <div style={styles.screenHeader}>
            <button style={styles.backBtn} onClick={() => setActiveTab('account')}>←</button>
            <h2 style={styles.screenTitle}>Privacy & Security 🔒</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.formCard}>
              <p style={styles.infoRow}>🔒 Your data is encrypted end-to-end</p>
              <p style={styles.infoRow}>🛡️ We never sell your personal information</p>
              <p style={styles.infoRow}>📱 Location is only shared during active trips</p>
              <p style={styles.infoRow}>📧 Email: {profile.email}</p>
              <p style={styles.infoRow}>📅 Member since: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p>
              <p style={styles.infoRow}>🔑 Referral Code: {profile.referral_code}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {['home', 'rides', 'messages', 'account', 'results'].includes(activeTab) && !showSearch && (
        <div style={styles.bottomNav}>
          {bottomTabs.map(tab => (
            <button key={tab.id} style={{...styles.navBtn, color: activeTab === tab.id ? '#34a853' : '#888'}} onClick={() => setActiveTab(tab.id)}>
              <span style={styles.navIcon}>{tab.icon}</span>
              <span style={styles.navLabel}>{tab.label}</span>
              {tab.id === 'rides' && myBookings.length > 0 && (
                <span style={styles.navBadge}>{myBookings.length}</span>
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
  searchModal: { position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '100vh', backgroundColor: 'white', zIndex: 5000, display: 'flex', flexDirection: 'column' },
  searchHeader: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f0f0f0' },
  closeSearch: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#333', padding: '4px' },
  searchTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 },
  searchBody: { padding: '20px', backgroundColor: '#f8f9fa', margin: '16px', borderRadius: '16px' },
  searchInputGroup: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' },
  searchDot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#34a853', flexShrink: 0 },
  searchDivider: { height: '1px', backgroundColor: '#e0e0e0', marginLeft: '6px' },
  searchInput: { flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: '16px', outline: 'none', color: '#333' },
  searchBtn: { margin: '0 16px', padding: '16px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  suggestions: { padding: '16px 20px', flex: 1 },
  suggestTitle: { fontSize: '13px', color: '#888', margin: '0 0 12px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' },
  suggestItem: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' },
  suggestIcon: { fontSize: '18px' },
  suggestText: { fontSize: '15px', color: '#333', fontWeight: '500' },
  homeScreen: { flex: 1, position: 'relative', height: '100vh' },
  fullMap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  homeTopBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' },
  hamburger: { width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', cursor: 'pointer' },
  homeTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', backgroundColor: 'white', padding: '8px 16px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  homeAvatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', cursor: 'pointer' },
  homeAvatarPlaceholder: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', cursor: 'pointer' },
  homeBottomSheet: { position: 'absolute', bottom: '60px', left: 0, right: 0, backgroundColor: 'white', borderRadius: '24px 24px 0 0', padding: '20px', zIndex: 1000, boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' },
  whereToBar: { width: '100%', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f5f5f5', borderRadius: '14px', padding: '16px', border: 'none', cursor: 'pointer', marginBottom: '16px' },
  whereToIcon: { fontSize: '18px' },
  whereToText: { flex: 1, fontSize: '16px', color: '#555', textAlign: 'left', fontWeight: '500' },
  whereLater: { fontSize: '13px', color: '#1a73e8', fontWeight: 'bold', backgroundColor: 'white', padding: '6px 12px', borderRadius: '8px' },
  quickStats: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f5f5f5', marginBottom: '12px' },
  quickStat: { textAlign: 'center' },
  quickStatNum: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 2px 0' },
  quickStatLbl: { fontSize: '11px', color: '#888', margin: 0 },
  quickStatDivider: { width: '1px', height: '28px', backgroundColor: '#eee' },
  recentTrip: {},
  recentTitle: { fontSize: '13px', color: '#888', margin: '0 0 8px 0', fontWeight: 'bold' },
  recentCard: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px' },
  recentIcon: { fontSize: '24px' },
  recentInfo: { flex: 1 },
  recentRoute: { fontSize: '14px', fontWeight: 'bold', color: '#333', margin: '0 0 2px 0' },
  recentDetail: { fontSize: '12px', color: '#888', margin: 0 },
  recentBadge: { padding: '4px 10px', borderRadius: '12px', color: 'white', fontSize: '11px', fontWeight: 'bold' },
  screen: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8f9fa' },
  screenHeader: { backgroundColor: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  screenTitle: { fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0, flex: 1 },
  addBtn: { padding: '8px 16px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  backBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#333', fontWeight: 'bold', padding: '0 4px' },
  content: { flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '80px' },
  noResults: { textAlign: 'center', padding: '48px 24px' },
  noResultsIcon: { fontSize: '48px', margin: '0 0 12px 0' },
  noResultsText: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
  noResultsSub: { fontSize: '14px', color: '#888', margin: '0 0 24px 0' },
  tryAgainBtn: { padding: '14px 32px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  rideResultCard: { backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  rideResultTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  driverInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  driverAvatar: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' },
  driverAvatarPlaceholder: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: 'white' },
  driverName: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: '0 0 2px 0' },
  driverStatus: { fontSize: '12px', color: '#888', margin: 0 },
  ridePrice: { textAlign: 'right' },
  ridePriceNum: { fontSize: '22px', fontWeight: 'bold', color: '#34a853', margin: '0 0 2px 0' },
  ridePriceLbl: { fontSize: '11px', color: '#888', margin: 0 },
  rideResultRoute: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' },
  routeDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34a853', flexShrink: 0 },
  routeText: { fontSize: '14px', color: '#333', margin: 0 },
  routeLine: { width: '1px', height: '16px', backgroundColor: '#ddd', marginLeft: '4px', marginBottom: '4px' },
  rideResultBottom: { display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f5f5f5' },
  rideSeats: { fontSize: '13px', color: '#666', margin: 0 },
  rideTime: { fontSize: '13px', color: '#666', margin: 0 },
  callDriverBtn: { display: 'block', textAlign: 'center', padding: '10px', color: '#34a853', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', marginTop: '10px', border: '1px solid #34a853', borderRadius: '10px' },
  bookNowBtn: { width: '100%', padding: '14px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  tripCard: { backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  tripHeader: { marginBottom: '12px' },
  tripRoute: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  tripRouteLine: { width: '1px', height: '12px', backgroundColor: '#ddd', marginLeft: '4px', marginBottom: '4px' },
  tripRouteText: { fontSize: '14px', fontWeight: '500', color: '#333', margin: 0 },
  tripDetails: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  tripDetail: { fontSize: '13px', color: '#666', margin: 0 },
  callBtn: { fontSize: '13px', color: '#34a853', textDecoration: 'none', fontWeight: 'bold' },
  tripFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  tripActions: { display: 'flex', gap: '8px' },
  cancelBtn: { padding: '6px 14px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  rateBtn: { padding: '6px 14px', backgroundColor: '#f9a825', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  ratingModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 5000 },
  ratingCard: { backgroundColor: 'white', borderRadius: '24px 24px 0 0', padding: '28px', width: '100%' },
  ratingTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' },
  ratingDriver: { fontSize: '14px', color: '#888', margin: '0 0 16px 0' },
  starsRow: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' },
  star: { background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  ratingInput: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
  ratingBtns: { display: 'flex', gap: '10px' },
  cancelRatingBtn: { flex: 1, padding: '12px', backgroundColor: '#f5f5f5', color: '#333', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer' },
  submitRatingBtn: { flex: 1, padding: '12px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  convItem: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', borderRadius: '12px', padding: '14px', marginBottom: '8px', cursor: 'pointer' },
  convAvatar: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: 'white', flexShrink: 0 },
  convInfo: { flex: 1 },
  convName: { margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#333' },
  convMsg: { margin: 0, fontSize: '12px', color: '#888' },
  convArrow: { fontSize: '20px', color: '#ccc' },
  chatScreen: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' },
  chatTopBar: { backgroundColor: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chatAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'white' },
  chatName: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 },
  msgList: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8f9fa' },
  msgBubble: { maxWidth: '75%', padding: '10px 14px', borderRadius: '18px' },
  msgInputBar: { padding: '12px 16px', backgroundColor: 'white', display: 'flex', gap: '8px', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' },
  msgField: { flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  sendBtn: { padding: '10px 20px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  accountHeader: { backgroundColor: '#1a1a2e', padding: '24px 20px 20px' },
  accountProfile: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' },
  accountAvatar: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #34a853' },
  accountAvatarPlaceholder: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold', color: 'white' },
  accountName: { color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0', flex: 1 },
  accountRole: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 },
  editPhotoBtn: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px' },
  walletCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px', textAlign: 'center' },
  walletLabel: { color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 4px 0' },
  walletBalance: { color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 },
  accountMenuItem: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '8px', cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  menuIcon: { fontSize: '20px', width: '28px' },
  menuLabel: { flex: 1, fontSize: '15px', color: '#333', fontWeight: '500' },
  menuArrow: { fontSize: '20px', color: '#ccc' },
  logoutItem: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#fce8e6', borderRadius: '12px', padding: '16px', cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left' },
  formCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  saveBtn: { width: '100%', padding: '14px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  sectionLabel: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
  sectionHint: { fontSize: '13px', color: '#888', margin: '0 0 12px 0' },
  idPreview: { width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px', border: '2px solid #34a853' },
  uploadIdBtn: { display: 'block', textAlign: 'center', padding: '12px', backgroundColor: '#f0fdf4', color: '#34a853', borderRadius: '10px', border: '2px dashed #34a853', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  walletBigCard: { background: 'linear-gradient(135deg, #34a853, #1e7e34)', borderRadius: '20px', padding: '28px', textAlign: 'center', color: 'white', marginBottom: '20px' },
  walletBigLabel: { fontSize: '13px', opacity: 0.85, margin: '0 0 8px 0' },
  walletBigNum: { fontSize: '40px', fontWeight: 'bold', margin: '0 0 8px 0' },
  walletBigNote: { fontSize: '13px', opacity: 0.75, margin: 0 },
  transCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: '12px', padding: '14px', marginBottom: '8px' },
  transDesc: { fontSize: '14px', color: '#333', margin: 0 },
  transAmt: { fontSize: '16px', fontWeight: 'bold', margin: 0 },
  referralBox: { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '20px', padding: '28px', textAlign: 'center', color: 'white', marginBottom: '16px' },
  referralLabel: { fontSize: '13px', opacity: 0.7, margin: '0 0 8px 0' },
  referralCode: { fontSize: '32px', fontWeight: 'bold', letterSpacing: '6px', margin: '0 0 8px 0' },
  referralNote: { fontSize: '13px', opacity: 0.75, margin: 0 },
  tipCard: { backgroundColor: 'white', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  tipText: { margin: 0, fontSize: '14px', color: '#444' },
  cardRoute: { fontSize: '15px', fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' },
  cardDetail: { fontSize: '13px', color: '#666', margin: 0 },
  infoRow: { fontSize: '14px', color: '#555', margin: '0 0 12px 0' },
  emptyText: { textAlign: 'center', color: '#aaa', padding: '24px', fontSize: '14px' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', backgroundColor: 'white', display: 'flex', borderTop: '1px solid #f0f0f0', zIndex: 2000, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  navBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' },
  navIcon: { fontSize: '22px' },
  navLabel: { fontSize: '10px', fontWeight: '500' },
  navBadge: { position: 'absolute', top: '4px', right: '20%', backgroundColor: '#ea4335', color: 'white', borderRadius: '10px', fontSize: '9px', padding: '2px 5px', fontWeight: 'bold' },
};

export default RiderDashboard;