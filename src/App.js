import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/DriverDashboard';
import RiderDashboard from './pages/RiderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PostRide from './pages/PostRide';
import { registerServiceWorker, requestNotificationPermission } from './utils/notifications';

function App() {
  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/rider" element={<RiderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/post-ride" element={<PostRide />} />
      </Routes>
    </Router>
  );
}

export default App;