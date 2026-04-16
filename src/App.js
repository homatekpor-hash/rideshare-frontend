import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/DriverDashboard';
import RiderDashboard from './pages/RiderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PostRide from './pages/PostRide';
import ForgotPassword from './pages/ForgotPassword';
import DriverProfile from './pages/DriverProfile';
import Onboarding from './pages/Onboarding';
import { registerServiceWorker, requestNotificationPermission } from './utils/notifications';
import TripShare from './pages/TripShare';
function App() {
  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<Home />} />
        <Route path="/driver/:driverId" element={<DriverProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/rider" element={<RiderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/post-ride" element={<PostRide />} />
        <Route path="/trip/:bookingId" element={<TripShare />} />
      </Routes>
    </Router>
  );
}

export default App;