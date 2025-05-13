import React from 'react';

const TableCanvas = ({ tables }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
      {tables.map((table) => (
        <div key={table.id} style={{ border: '1px solid #000', padding: '10px' }}>
          <h4>Table {table.id}</h4>
          <div style={{ display: 'flex', gap: '5px' }}>
            {table.seats.map((seat) => (
              <div
                key={seat.id}
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: seat.guestId ? 'green' : 'lightgray',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                }}
              >
                {seat.id}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableCanvas;
