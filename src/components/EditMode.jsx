import React, { useState } from 'react';
import { getGuests, getLayout, saveLayout } from '../utils/storage';

const EditMode = () => {
  const [layout, setLayout] = useState(getLayout());
  const [search, setSearch] = useState('');
  const guests = getGuests();

  const assignGuest = (tableId, seatId, guestId) => {
    const updatedLayout = layout.map((table) => {
      if (table.id !== tableId) return table;
      return {
        ...table,
        seats: table.seats.map((seat) =>
          seat.id === seatId ? { ...seat, guestId } : seat
        ),
      };
    });
    setLayout(updatedLayout);
    saveLayout(updatedLayout);
  };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Edit Mode</h2>
      <input
        placeholder="Search guest..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {layout.map((table) => (
        <div key={table.id} style={{ border: '1px solid gray', margin: 10, padding: 10 }}>
          <h3>Table {table.id}</h3>
          {table.seats.map((seat) => (
            <div key={seat.id}>
              Seat {seat.id}: 
              <select
                value={seat.guestId || ''}
                onChange={(e) => assignGuest(table.id, seat.id, e.target.value)}
              >
                <option value="">Unassigned</option>
                {filteredGuests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default EditMode;
