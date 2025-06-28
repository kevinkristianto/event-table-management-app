import React, { useEffect, useState } from 'react';
import './EditMode.css';
import axios from 'axios';
import CanvasWrapper from './CanvasWrapper';
import {
  fetchLayoutNames,
  fetchLayoutByName,
  assignSeatToGuest,
  removeGuestFromSeat,
} from '../services/layoutService';

const EditMode = () => {
  const [layout, setLayout] = useState([]);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestSuggestions, setGuestSuggestions] = useState([]);
  const [allGuests, setAllGuests] = useState([]);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [availableLayouts, setAvailableLayouts] = useState([]);
  const [selectedLayoutName, setSelectedLayoutName] = useState('');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [contentPosition, setContentPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/guests');
      const guestNames = res.data.map((g) => g.name);
      setAllGuests(guestNames);
    } catch (err) {
      console.error('Failed to fetch guests', err);
    }
  };

  const handleGuestInput = (e) => {
    const value = e.target.value;
    setGuestName(value);

    if (value.trim().length < 3) {
      setGuestSuggestions([]);
      return;
    }

    const assignedGuests = layout
      .filter((el) => el.guest)
      .map((el) => el.guest.toLowerCase());

    const suggestions = allGuests
      .filter((g) => !assignedGuests.includes(g.toLowerCase()))
      .filter((g) => g.toLowerCase().includes(value.toLowerCase()));

    setGuestSuggestions(suggestions);
  };

  const handleAssignGuest = async () => {
    if (!guestName.trim()) return;

    try {
      setLayout((prevLayout) =>
        prevLayout.map((el) =>
          el.id === selectedSeatId ? { ...el, guest: guestName.trim() } : el
        )
      );

      await assignSeatToGuest(
        selectedLayoutName,
        String(selectedSeatId),
        guestName.trim()
      );

      console.log('Guest assigned and saved successfully.');
    } catch (err) {
      console.error('Failed to assign guest', err);
    } finally {
      setGuestName('');
      setGuestSuggestions([]);
      setSelectedSeatId(null);
      setShowGuestModal(false);
    }
  };

  const handleRemoveGuest = async () => {
    try {
      const updatedLayout = layout.map((el) =>
        el.id === selectedSeatId ? { ...el, guest: '' } : el
      );
      setLayout(updatedLayout);

      await removeGuestFromSeat(selectedLayoutName, String(selectedSeatId));

      console.log('Guest removed and saved successfully.');
      alert('Guest removed successfully.');
    } catch (err) {
      console.error('Failed to remove guest:', err);
      alert('Failed to remove guest. Please try again.');
    } finally {
      setGuestName('');
      setGuestSuggestions([]);
      setSelectedSeatId(null);
      setShowGuestModal(false);
    }
  };

  const handleChairClick = (id) => {
    setSelectedSeatId(id);
    setShowGuestModal(true);
    setGuestName('');
    setGuestSuggestions([]);
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
      if (Array.isArray(loadedLayout)) {
        setLayout(loadedLayout);
      } else {
        console.warn('Loaded layout is not an array:', loadedLayout);
        setLayout([]);
      }

      setShowLayoutModal(false);
    } catch (err) {
      console.error('Failed to load layout', err);
    }
  };

  const handleTransformChange = ({ zoomLevel, contentPosition }) => {
    setZoomLevel(zoomLevel);
    setContentPosition(contentPosition);
  };

  return (
    <div className="edit-mode">
      <h2>Edit Mode</h2>
      <button className="load-layout-button" onClick={handleLoadLayoutClick}>
        Load Layout
      </button>

      <CanvasWrapper
        className="canvas-wrapper"
        onTransformChange={handleTransformChange}
      >
        {Array.isArray(layout) &&
          layout.map((el) => (
            <div
              key={el.id}
              className={`element ${el.type} ${el.guest ? 'assigned' : ''}`}
              style={{
                left: `${el.x * zoomLevel + contentPosition.x}px`,
                top: `${el.y * zoomLevel + contentPosition.y}px`,
                width: `${el.width * zoomLevel}px`,
                height: `${el.height * zoomLevel}px`,
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                overflow: 'hidden',
                padding: '5px',
                boxSizing: 'border-box',
                transform: `rotate(${el.rotation || 0}deg)`,
                transformOrigin: 'center center',
              }}
              onClick={() => el.type === 'chair' && handleChairClick(el.id)}
            >
              {/* Seat Label */}
              <span className="seat-label">{el.name}</span>

              {/* Guest Name */}
              {el.guest && (
                <div
                  className="guest-name"
                  style={{
                    fontSize: `${4 * zoomLevel}px`,
                  }}
                >
                  {el.guest.split(' ').map((part, index) => (
                    <span key={index} className="guest-name-part">
                      {part}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
      </CanvasWrapper>

      {/* Guest Modal */}
      {showGuestModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              {layout.find((el) => el.id === selectedSeatId)?.guest
                ? 'Edit Guest Assignment'
                : 'Assign Guest to Seat'}
            </h3>
            <input
              type="text"
              value={guestName}
              onChange={handleGuestInput}
              placeholder="Type guest name"
            />
            {guestSuggestions.length > 0 && (
              <ul className="suggestions">
                {guestSuggestions.map((name, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setGuestName(name);
                      setGuestSuggestions([]);
                    }}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: '10px' }}>
              <button onClick={handleAssignGuest} disabled={!guestName.trim()}>
                Save
              </button>
              {layout.find((el) => el.id === selectedSeatId)?.guest && (
                <button
                  onClick={handleRemoveGuest}
                  style={{
                    marginLeft: '10px',
                    backgroundColor: 'red',
                    color: 'white',
                  }}
                >
                  Remove Guest
                </button>
              )}
              <button
                onClick={() => {
                  setShowGuestModal(false);
                  setSelectedSeatId(null);
                  setGuestName('');
                  setGuestSuggestions([]);
                  console.log('Modal closed by cancel.');
                }}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Modal */}
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
                <option key={idx} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div style={{ marginTop: '10px' }}>
              <button onClick={handleLoadLayout} disabled={!selectedLayoutName}>
                Load
              </button>
              <button
                onClick={() => setShowLayoutModal(false)}
                style={{ marginLeft: '10px' }}
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

export default EditMode;
