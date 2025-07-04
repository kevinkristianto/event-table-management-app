import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [layoutElements, setLayoutElements] = useState([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const layoutName = 'kevin-cia-lobo';

  const fetchGuests = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/guests`);
      setGuests(res.data || []);
    } catch {
      setError('Failed to load guests.');
    }
  };

  const fetchLayout = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/layouts/${layoutName}`
      );
      setLayoutElements(res.data.elements || []);
    } catch {
      setLayoutElements([]);
    }
  };

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      await Promise.all([fetchGuests(), fetchLayout()]);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const getSeatNameForGuest = (guestName) => {
    if (!guestName) return 'N/A';
    const seat = layoutElements.find(
      (el) => el.guest && el.guest.toLowerCase() === guestName.toLowerCase()
    );
    return seat ? seat.name : 'N/A';
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    setError('');
    if (!newGuestName.trim()) {
      setError('Guest name cannot be empty');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/guests`, {
        name: newGuestName.trim(),
      });
      setNewGuestName('');
      fetchGuests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add guest');
    }
  };

  const handleDeleteGuest = async (guestToken) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/guests/${guestToken}`);
      fetchGuests();
    } catch {
      setError('Failed to delete guest');
    }
  };

  if (loading) return <p>Loading guests...</p>;

  return (
    <div>
      <h2>Guest List (Admin)</h2>
      <form onSubmit={handleAddGuest} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter guest name"
          value={newGuestName}
          onChange={(e) => setNewGuestName(e.target.value)}
        />
        <button type="submit" style={{ marginLeft: 10 }}>
          Add Guest
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border={1} cellPadding={5} cellSpacing={0}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Guest Token (Link)</th>
            <th>Menu</th>
            <th>Steak Cook</th>
            <th>Allergies</th>
            <th>Seat Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td colSpan={7}>No guests found.</td>
            </tr>
          ) : (
            guests.map((g) => (
              <tr key={g.guestToken || g.id}>
                <td>{g.name || 'N/A'}</td>
                <td>
                  {g.guestToken ? (
                    <Link to={`/guest/${g.guestToken}`}>
                      {g.guestToken.slice(0, 8)}...
                    </Link>
                  ) : (
                    'No token'
                  )}
                </td>
                <td>{g.menu || 'Not selected'}</td>
                <td>{g.steakCook || 'N/A'}</td>
                <td>
                  {Array.isArray(g.allergies) ? g.allergies.join(', ') : ''}
                </td>
                <td>{getSeatNameForGuest(g.name)}</td>
                <td>
                  <button
                    onClick={() => handleDeleteGuest(g.guestToken)}
                    style={{
                      backgroundColor: 'red',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GuestList;
