import React, { useState } from 'react';
import { getGuests, getLayouts } from '../utils/storage';

const ViewMode = () => {
  const layout = getLayouts();
  const guests = getGuests();
  const [selectedGuest, setSelectedGuest] = useState(null);

  const findGuest = (id) => guests.find((g) => g.id === id);

  return (
    <div>
      <h2>View Mode</h2>
      {layout.map((table) => (
        <div key={table.id} style={{ border: '1px solid gray', margin: 10, padding: 10 }}>
          <h3>Table {table.id}</h3>
          {table.seats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => setSelectedGuest(findGuest(seat.guestId))}
              style={{ margin: 5 }}
            >
              Seat {seat.id}
            </button>
          ))}
        </div>
      ))}

      {selectedGuest && (
        <div style={{ marginTop: 20 }}>
          <h3>Guest Details</h3>
          <p><strong>Name:</strong> {selectedGuest.name}</p>
          <p><strong>Menu:</strong> {selectedGuest.menu}</p>
          <p><strong>Allergy:</strong> {selectedGuest.allergy}</p>
        </div>
      )}
    </div>
  );
};

export default ViewMode;
