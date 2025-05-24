import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './GuestStyles.css';

const allergiesList = [
  'Gluten',
  'Peanuts',
  'Dairy',
  'Shellfish',
  'Vegetarian',
  'Vegan',
];

const GuestForm = () => {
  const { guestToken } = useParams();
  const [guest, setGuest] = useState(null);
  const [menuType, setMenuType] = useState('');
  const [menuSelection, setMenuSelection] = useState('');
  const [steakCook, setSteakCook] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!guestToken) return;

    axios
      .get(`http://localhost:5000/api/guests/token/${guestToken}`)
      .then((res) => {
        setGuest(res.data);

        const savedMenu = res.data.menu || '';
        if (savedMenu === 'Standard' || savedMenu === 'Vegan') {
          setMenuType(savedMenu);
          setMenuSelection('');
          setSteakCook('');
        } else if (['Salmon al Forno', 'Grilled Ribeye'].includes(savedMenu)) {
          setMenuType('Standard');
          setMenuSelection(savedMenu);
          setSteakCook(res.data.steakCook || '');
        } else {
          setMenuType('');
          setMenuSelection('');
          setSteakCook('');
        }

        setAllergies(res.data.allergies || []);
      })
      .catch(() => {
        setMessage('Guest not found or invalid link.');
      });
  }, [guestToken]);

  const handleAllergyChange = (allergy) => {
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleMenuTypeChange = (type) => {
    setMenuType(type);
    setMenuSelection('');
    setSteakCook('');
  };

  const handleMenuSelectionChange = (value) => {
    setMenuSelection(value);
    setSteakCook('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!menuType) {
      setMessage('Please select a menu type.');
      return;
    }

    if (menuType === 'Standard' && !menuSelection) {
      setMessage('Please select a main course.');
      return;
    }

    if (menuSelection === 'Grilled Ribeye' && !steakCook) {
      setMessage('Please select how you want your steak cooked.');
      return;
    }

    try {
      const updateData = {
        menu: menuSelection || menuType,
        allergies,
        steakCook: menuSelection === 'Grilled Ribeye' ? steakCook : null,
      };

      await axios.put(
        `http://localhost:5000/api/guests/${guestToken}`,
        updateData
      );

      setMessage('Your selections have been saved. Thank you!');
    } catch {
      setMessage('Failed to save your selections, please try again.');
    }
  };

  if (!guest) {
    return (
      <div className="guest-loading-container">
        <h2 style={{ color: '#606C38' }}>Loading guest info...</h2>
        {message && <p className="guest-error">{message}</p>}
      </div>
    );
  }

  return (
    <div className="guest-container">
      <h2 className="guest-title">Guest Menu Form</h2>

      <form onSubmit={handleSubmit} className="guest-form">
        <p className="guest-paragraph">
          Welcome to the wedding of Kevin and Leticia reception. We will have a
          4 course menu, would you like to have the standard menu or vegan menu?
        </p>

        <label className="guest-radio-label">
          <input
            type="radio"
            name="menuType"
            value="Standard"
            checked={menuType === 'Standard'}
            onChange={() => handleMenuTypeChange('Standard')}
            required
          />{' '}
          Standard Menu
        </label>

        <label className="guest-radio-label">
          <input
            type="radio"
            name="menuType"
            value="Vegan"
            checked={menuType === 'Vegan'}
            onChange={() => handleMenuTypeChange('Vegan')}
          />{' '}
          Vegan Menu
        </label>

        {menuType === 'Standard' && (
          <div style={{ marginTop: 20 }}>
            <label className="guest-select-label">
              Please select your main course:
            </label>
            <br />
            <select
              value={menuSelection}
              onChange={(e) => handleMenuSelectionChange(e.target.value)}
              required
              className="guest-select"
            >
              <option value="">-- Select --</option>
              <option value="Salmon al Forno">Salmon al Forno</option>
              <option value="Grilled Ribeye">Grilled Ribeye</option>
            </select>
          </div>
        )}

        {menuSelection === 'Grilled Ribeye' && (
          <div style={{ marginTop: 20 }}>
            <label className="guest-select-label">
              How do you want your steak cooked? Please note we only have medium
              or medium-well as a selection.
            </label>
            <br />
            <label className="guest-radio-label">
              <input
                type="radio"
                name="steakCook"
                value="Medium"
                checked={steakCook === 'Medium'}
                onChange={() => setSteakCook('Medium')}
                required
              />{' '}
              Medium
            </label>
            <label className="guest-radio-label">
              <input
                type="radio"
                name="steakCook"
                value="Medium-Well"
                checked={steakCook === 'Medium-Well'}
                onChange={() => setSteakCook('Medium-Well')}
              />{' '}
              Medium-well
            </label>
          </div>
        )}

        {(menuType === 'Vegan' || menuSelection) && (
          <div style={{ marginTop: 20 }}>
            <label className="guest-select-label">
              Please select any food allergies or dietary requirements:
            </label>
            <br />
            {allergiesList.map((allergy) => (
              <label key={allergy} className="guest-checkbox-label">
                <input
                  type="checkbox"
                  checked={allergies.includes(allergy)}
                  onChange={() => handleAllergyChange(allergy)}
                />{' '}
                {allergy}
              </label>
            ))}
          </div>
        )}

        <button type="submit" className="guest-submit-button">
          Submit
        </button>

        {message && (
          <p
            className={
              message.toLowerCase().includes('fail')
                ? 'guest-error'
                : 'guest-success'
            }
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default GuestForm;
