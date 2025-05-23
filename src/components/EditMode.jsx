import React, { useEffect, useState } from 'react';
import './EditMode.css';
import axios from 'axios';
import { fetchLayoutNames, fetchLayoutByName } from '../services/layoutService';


const EditMode = () => {
  const [layout, setLayout] = useState([]);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestSuggestions, setGuestSuggestions] = useState([]);
  const [allGuests, setAllGuests] = useState([]);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [availableLayouts, setAvailableLayouts] = useState([]);
  const [selectedLayoutName, setSelectedLayoutName] = useState('');

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/guests');
      const guestNames = res.data.map(g => g.name);
      setAllGuests(guestNames);
    } catch (err) {
      console.error('Failed to fetch guests', err);
    }
  };

  const handleGuestInput = (e) => {
    const value = e.target.value;
    setGuestName(value);
    if (value.trim() === '') {
      setGuestSuggestions([]);
      return;
    }
    const suggestions = allGuests.filter(g =>
      g.toLowerCase().includes(value.toLowerCase())
    );
    setGuestSuggestions(suggestions);
  };

  const handleAssignGuest = async (name) => {
    try {
      // Update local layout state
      setLayout(prevLayout =>
        prevLayout.map(el =>
          el.id === selectedSeatId ? { ...el, guest: name } : el
        )
      );

      // Save guest to backend (expand payload as needed)
      await axios.post('http://localhost:3001/api/guests', {
        name,
        menu: '',
        allergies: []
      });

      setGuestName('');
      setGuestSuggestions([]);
      setSelectedSeatId(null);
    } catch (err) {
      console.error('Failed to save guest', err);
    }
  };

  const handleLoadLayoutClick = async () => {
    try {
      const names = await fetchLayoutNames();
      setAvailableLayouts(names);
      setShowLayoutModal(true);
    } catch (err) {
      console.error('Failed to fetch layout names', err);
    }
  };
  

  const handleLoadLayout = async () => {
    if (!selectedLayoutName) return;
    try {
      const loadedLayout = await fetchLayoutByName(selectedLayoutName);
      setLayout(loadedLayout);
      setShowLayoutModal(false);
    } catch (err) {
      console.error('Failed to load layout', err);
    }
  };
  

  return (
    <div className="edit-mode">
      <h2>Edit Mode</h2>
      <button onClick={handleLoadLayoutClick}>Load Layout</button>

      <div className="canvas">
        {layout.map(el => (
          <div
            key={el.id}
            className={`element ${el.type}`}
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height
            }}
            onClick={() => el.type === 'chair' && setSelectedSeatId(el.id)}
          >
            <span className="label">
              {el.name}
              {el.guest && <div className="guest-label">{el.guest}</div>}
            </span>

            {selectedSeatId === el.id && (
              <div className="guest-input">
                <input
                  type="text"
                  value={guestName}
                  onChange={handleGuestInput}
                  placeholder="Assign guest"
                />
                {guestSuggestions.length > 0 && (
                  <ul className="suggestions">
                    {guestSuggestions.map((g, idx) => (
                      <li key={idx} onClick={() => handleAssignGuest(g)}>
                        {g}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showLayoutModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Select Layout to Load</h3>
            <select
              value={selectedLayoutName}
              onChange={(e) => setSelectedLayoutName(e.target.value)}
            >
              <option value="">-- Select Layout --</option>
              {availableLayouts.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
            <div style={{ marginTop: '10px' }}>
              <button onClick={handleLoadLayout} disabled={!selectedLayoutName}>
                Load
              </button>
              <button onClick={() => setShowLayoutModal(false)} style={{ marginLeft: '10px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditMode;
