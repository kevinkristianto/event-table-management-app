import React, { useEffect, useState } from 'react';
import './ViewMode.css';
import CanvasWrapper from './CanvasWrapper';
import axios from 'axios';
import { fetchLayoutByName } from '../services/layoutService';

const ViewMode = ({ onLoadComplete }) => {
  const [layout, setLayout] = useState([]);
  const [guests, setGuests] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [contentPosition, setContentPosition] = useState({ x: 0, y: 0 });
  const [bubbleInfo, setBubbleInfo] = useState({
    visible: false,
    x: 0,
    y: 0,
    guest: '',
    appetiser: '',
    menu: '',
    wineSelection: '',
    allergies: [],
  });

  const layoutName = 'kevin-cia-lobo';

  // Track if onLoadComplete was already called to avoid multiple calls
  const [hasCalledOnLoadComplete, setHasCalledOnLoadComplete] = useState(false);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const elements = await fetchLayoutByName(layoutName);
        setLayout(elements);
      } catch (err) {
        console.error('Failed to fetch layout:', err);
      }
    };

    const fetchGuests = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/guests`
        );
        setGuests(res.data);
      } catch (err) {
        console.error('Failed to fetch guests:', err);
      }
    };

    fetchLayout();
    fetchGuests();
  }, [layoutName]);

  // When both layout and guests are loaded, notify parent (only once)
  useEffect(() => {
    if (
      !hasCalledOnLoadComplete &&
      layout.length > 0 &&
      guests.length > 0 &&
      typeof onLoadComplete === 'function'
    ) {
      onLoadComplete();
      setHasCalledOnLoadComplete(true);
    }
  }, [layout, guests, hasCalledOnLoadComplete, onLoadComplete]);

  const handleTransformChange = ({ zoomLevel, contentPosition }) => {
    setZoomLevel(zoomLevel);
    setContentPosition(contentPosition);
  };

  const handleChairClick = (el) => {
    if (!el.guest) {
      alert('No guest assigned to this seat.');
      return;
    }

    const guestDetails = guests.find((guest) => guest.name === el.guest);

    let formattedMenu = guestDetails?.menu || 'No menu selected';
    if (formattedMenu === 'Grilled Ribeye' && guestDetails?.steakCook) {
      formattedMenu = `${formattedMenu} - ${guestDetails.steakCook}`;
    }

    setBubbleInfo({
      visible: true,
      x: el.x * zoomLevel + contentPosition.x,
      y: el.y * zoomLevel + contentPosition.y,
      guest: el.guest,
      appetiser: guestDetails?.appetiser || 'N/A',
      menu: formattedMenu,
      wineSelection: guestDetails?.wineSelection || 'N/A',
      allergies: guestDetails?.allergies || [],
    });
  };

  const closeBubble = () => {
    setBubbleInfo({
      visible: false,
      x: 0,
      y: 0,
      guest: '',
      appetiser: '',
      menu: '',
      wineSelection: '',
      allergies: [],
    });
  };

  return (
    <div className="view-mode">
      <h2>View Mode</h2>

      <CanvasWrapper
        className="canvas-wrapper"
        onTransformChange={handleTransformChange}
      >
        {Array.isArray(layout) &&
          layout.map((el) => {
            // Find guest details for this element’s guest
            const guestDetails = guests.find(
              (guest) => guest.name === el.guest
            );

            // Check if wineSelection is red or white wine
            const isRedOrWhiteWine =
              guestDetails &&
              guestDetails.wineSelection &&
              ['red wine', 'white wine'].includes(
                guestDetails.wineSelection.toLowerCase()
              );

            return (
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
                  backgroundColor: isRedOrWhiteWine ? '#f8d7da' : 'transparent',
                }}
                onClick={() => el.type === 'chair' && handleChairClick(el)}
              >
                {el.type === 'others' ? (
                  <span className="others-label">{el.name}</span>
                ) : (
                  <span className="seat-label">{el.name}</span>
                )}

                {el.guest && (
                  <div
                    className="guest-name"
                    style={{ fontSize: `${4 * zoomLevel}px` }}
                  >
                    {el.guest.split(' ').map((part, i) => (
                      <span key={i} className="guest-name-part">
                        {part}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {/* Bubble Info */}
        {bubbleInfo.visible && (
          <div
            className="info-bubble"
            style={{
              position: 'absolute',
              left: bubbleInfo.x + 20,
              top: bubbleInfo.y - 20,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              width: '220px',
            }}
          >
            <p>
              <strong>Name:</strong> {bubbleInfo.guest}
            </p>
            <p>
              <strong>Appetiser:</strong> {bubbleInfo.appetiser}
            </p>
            <p>
              <strong>Main Course:</strong> {bubbleInfo.menu}
            </p>
            <p>
              <strong>Wine Selection:</strong> {bubbleInfo.wineSelection}
            </p>
            <p>
              <strong>Allergies:</strong>{' '}
              {bubbleInfo.allergies.length > 0
                ? bubbleInfo.allergies.join(', ')
                : 'None'}
            </p>
            <button
              onClick={closeBubble}
              style={{ marginTop: '10px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        )}
      </CanvasWrapper>
    </div>
  );
};

export default ViewMode;
