import React, { useState } from 'react';
import { saveGuest } from '../utils/storage';

const GuestForm = () => {
  const [name, setName] = useState('');
  const [menu, setMenu] = useState('A');
  const [allergy, setAllergy] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const guest = {
      id: Date.now().toString(),
      name,
      menu,
      allergy,
    };
    saveGuest(guest);
    setName('');
    setMenu('A');
    setAllergy('');
    alert('Guest saved!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Guest</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <select value={menu} onChange={(e) => setMenu(e.target.value)}>
        <option value="A">Menu A</option>
        <option value="B">Menu B</option>
      </select>
      <input value={allergy} onChange={(e) => setAllergy(e.target.value)} placeholder="Allergy" />
      <button type="submit">Save Guest</button>
    </form>
  );
};

export default GuestForm;
