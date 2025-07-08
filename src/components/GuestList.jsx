import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [layoutElements, setLayoutElements] = useState([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGuestForEdit, setSelectedGuestForEdit] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc or desc

  const layoutName = 'kevin-cia-lobo';

  const fetchGuests = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/guests`
      );
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

  const handleGuestAction = (action, guest) => {
    if (action === 'update') {
      setSelectedGuestForEdit(guest);
      setUpdatedName(guest.name || '');
    } else if (action === 'delete') {
      handleDeleteGuest(guest.guestToken);
    }
  };

  const handleDeleteGuest = async (guestToken) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/guests/${guestToken}`
      );
      fetchGuests();
    } catch {
      setError('Failed to delete guest');
    }
  };

  const handleUpdateGuestName = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/guests/${selectedGuestForEdit.guestToken}`,
        {
          name: updatedName.trim(),
          menu: selectedGuestForEdit.menu || '',
          appetiser: selectedGuestForEdit.appetiser || '',
          allergies: selectedGuestForEdit.allergies || [],
          steakCook: selectedGuestForEdit.steakCook || null,
          wineSelection: selectedGuestForEdit.wineSelection || 'None',
        }
      );
      setSelectedGuestForEdit(null);
      setUpdatedName('');
      fetchGuests();
    } catch (err) {
      setError('Failed to update guest name');
    }
  };

  const getStatus = (guest) => {
    const issues = [];

    if (!guest.menu || guest.menu === 'Not selected') {
      issues.push('Menu');
    }

    if (!guest.appetiser || guest.appetiser === 'N/A') {
      issues.push('Appetiser');
    }

    const seatName = getSeatNameForGuest(guest.name);
    if (!seatName || seatName === 'N/A') {
      issues.push('Seat Name');
    }

    if (issues.length === 0) return { text: 'All good', color: 'green' };

    return {
      text: `${issues.join(' and ')} not selected`,
      color: 'orange',
    };
  };

  // Sorting guests by name depending on sortOrder
  const sortedGuests = [...guests].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();

    if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
    if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
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
            <th
              style={{ cursor: 'pointer' }}
              onClick={toggleSortOrder}
              title="Sort by Name"
            >
              Name {sortOrder === 'asc' ? '▲' : '▼'}
            </th>
            <th>Token</th>
            <th>Appetiser</th>
            <th>Menu</th>
            <th>Steak Cook</th>
            <th>Wine Selection</th>
            <th>Allergies</th>
            <th>Seat Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedGuests.length === 0 ? (
            <tr>
              <td colSpan={10}>No guests found.</td>
            </tr>
          ) : (
            sortedGuests.map((g) => {
              const status = getStatus(g);
              return (
                <tr key={g.guestToken || g.id}>
                  <td>{g.name || 'N/A'}</td>
                  <td>
                    {g.guestToken ? (
                      <Link to={`/guest/menu-selection/${g.guestToken}`}>
                        {g.guestToken.slice(0, 8)}...
                      </Link>
                    ) : (
                      'No token'
                    )}
                  </td>
                  <td>{g.appetiser || 'N/A'}</td>
                  <td>{g.menu || 'Not selected'}</td>
                  <td>{g.steakCook || 'N/A'}</td>
                  <td
                    style={{
                      backgroundColor:
                        g.wineSelection === 'Red Wine' ||
                        g.wineSelection === 'White Wine'
                          ? '#f8d7da'
                          : 'transparent',
                    }}
                  >
                    {g.wineSelection || 'None'}
                  </td>{' '}
                  <td>
                    {Array.isArray(g.allergies) ? g.allergies.join(', ') : ''}
                  </td>
                  <td>{getSeatNameForGuest(g.name)}</td>
                  <td
                    style={{
                      backgroundColor: status.color,
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    {status.text}
                  </td>
                  <td>
                    <select
                      onChange={(e) => handleGuestAction(e.target.value, g)}
                      defaultValue=""
                    >
                      <option value="">-- Select --</option>
                      <option value="update">Update Name</option>
                      <option value="delete">Delete</option>
                    </select>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Modal for updating name */}
      {selectedGuestForEdit && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: '#fefae0',
              padding: 20,
              borderRadius: 10,
              color: 'black',
            }}
          >
            <h3>Update Guest Name</h3>
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              placeholder="New name"
              style={{ color: 'black' }}
            />
            <div style={{ marginTop: 10 }}>
              <button onClick={handleUpdateGuestName}>Update</button>
              <button
                onClick={() => setSelectedGuestForEdit(null)}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;
