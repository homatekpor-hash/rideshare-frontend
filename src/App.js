import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostRide from './pages/PostRide';
import FindRide from './pages/FindRide';
import Login from './pages/Login';
import Register from './pages/Register';
import MyRides from './pages/MyRides';
import Messages from './pages/Messages';
import Ratings from './pages/Ratings';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post-ride" element={<PostRide />} />
        <Route path="/find-ride" element={<FindRide />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-rides" element={<MyRides />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/ratings" element={<Ratings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;