import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GuestStyles.css';
import logo from '../../src/assets/images/wedding_logo.svg';

const GuestLanding = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/guests');
      const guests = res.data;

      const guest = guests.find(
        (g) => g.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (!guest) {
        setError('Guest not found. Please check your name or contact admin.');
        return;
      }

      navigate(`/guest/menu-selection/${encodeURIComponent(guest.guestToken)}`);
    } catch (err) {
      setError('Failed to check guest. Please try again.');
    }
  };

  return (
    <div className="guest-landing">
      <img alt="Wedding Logo" className="app-body-logo" src={logo} />
      <h2 className="guest-title">
        Welcome to Kevin and Leticia's Wedding Reception
      </h2>
      <div className="guest-container centered-content">
        <form onSubmit={handleSubmit} className="guest-form">
          <label className="guest-landing-label">
            What is your name?
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="guest-landing-input"
            />
          </label>

          {error && <p className="guest-error">{error}</p>}

          <button type="submit" className="guest-submit-button">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestLanding;
