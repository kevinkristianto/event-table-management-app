import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGuests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/guests');
      setGuests(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load guests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    setError('');

    if (!newGuestName.trim()) {
      setError('Please enter a guest name.');
      return;
    }

    if (
      guests.find(
        (g) => g.name.toLowerCase() === newGuestName.trim().toLowerCase()
      )
    ) {
      setError('Guest with this name already exists.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/guests', {
        name: newGuestName.trim(),
      });
      setNewGuestName('');
      fetchGuests();
    } catch (err) {
      console.error(err);
      setError('Failed to add guest.');
    }
  };

  const handleDeleteGuest = async (guestToken) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/guests/${guestToken}`);
      fetchGuests();
    } catch (err) {
      console.error(err);
      setError('Failed to delete guest.');
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
            <th>Steak Cook</th> {/* New Column */}
            <th>Allergies</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td colSpan={6}>No guests found.</td> {/* Updated colspan */}
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
                <td>{g.steakCook || 'N/A'}</td>{' '}
                {/* Render steak cook preference */}
                <td>
                  {Array.isArray(g.allergies) ? g.allergies.join(', ') : ''}
                </td>
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
