import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostRide from './pages/PostRide';
import FindRide from './pages/FindRide';
import Login from './pages/Login';
import Register from './pages/Register';
import MyRides from './pages/MyRides';
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
      </Routes>
    </Router>
  );
}

export default App;