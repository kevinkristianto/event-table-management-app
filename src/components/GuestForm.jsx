import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [guest, setGuest] = useState(null);
  const [menuType, setMenuType] = useState('');
  const [appetiser, setAppetiser] = useState('Beef Carpaccio');
  const [menuSelection, setMenuSelection] = useState('');
  const [steakCook, setSteakCook] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!guestToken) return;

    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/guests/token/${guestToken}`
      )
      .then((res) => {
        setGuest(res.data);

        const savedMenu = res.data.menu || '';
        if (savedMenu === 'Standard' || savedMenu === 'Vegan') {
          setMenuType(savedMenu);
          setMenuSelection('');
          setSteakCook('');
          if (savedMenu === 'Standard') {
            setAppetiser('Beef Carpaccio');
          } else {
            setAppetiser('');
          }
        } else if (
          [
            'Salmon al Forno',
            'Grilled Ribeye',
            'Aubergine Schnitzels',
            'Roasted Cauliflower',
          ].includes(savedMenu)
        ) {
          const inferredType = [
            'Aubergine Schnitzels',
            'Roasted Cauliflower',
          ].includes(savedMenu)
            ? 'Vegan'
            : 'Standard';
          setMenuType(inferredType);
          setMenuSelection(savedMenu);
          setSteakCook(res.data.steakCook || '');
          if (inferredType === 'Standard') {
            setAppetiser('Beef Carpaccio');
          } else {
            setAppetiser('');
          }
        } else {
          setMenuType('');
          setMenuSelection('');
          setSteakCook('');
          setAppetiser('');
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
    if (type === 'Standard') {
      setAppetiser('Beef Carpaccio');
    } else {
      setAppetiser('');
    }
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

    if (menuType === 'Standard' && !appetiser) {
      setMessage('Please select an appetiser.');
      return;
    }

    if (!menuSelection) {
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
        appetiser: menuType === 'Standard' ? appetiser : null,
        allergies,
        steakCook: menuSelection === 'Grilled Ribeye' ? steakCook : null,
      };

      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/guests/${guestToken}`,
        updateData
      );

      navigate(`/guest/menu-confirmation/${guestToken}`, {
        state: {
          selection: {
            Appetiser: menuType === 'Standard' ? appetiser : 'N/A',
            'Menu Selected': menuSelection || menuType,
            ...(menuSelection === 'Grilled Ribeye' && {
              'Steak Cooking Level': steakCook,
            }),
            Allergies: allergies.length > 0 ? allergies.join(', ') : 'None',
          },
          guestToken,
        },
      });
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
        {guest?.name && (
        <h3 className="guest-subtitle">
          You are selecting menu for: <span>{guest.name}</span>
        </h3>
      )}
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
          <>
            <div style={{ marginTop: 20 }}>
              <label className="guest-select-label">
                Please select an appetiser:
              </label>
              <br />
              <select
                value={appetiser}
                onChange={(e) => setAppetiser(e.target.value)}
                required
                className="guest-select"
              >
                <option value="Beef Carpaccio">Beef Carpaccio</option>
                <option value="Chicken Roulade">Chicken Roulade</option>
              </select>
            </div>

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
          </>
        )}

        {menuType === 'Vegan' && (
          <div style={{ marginTop: 20 }}>
            <label className="guest-select-label">
              Please select your vegan main course:
            </label>
            <br />
            <select
              value={menuSelection}
              onChange={(e) => handleMenuSelectionChange(e.target.value)}
              required
              className="guest-select"
            >
              <option value="">-- Select --</option>
              <option value="Aubergine Schnitzels">Aubergine Schnitzels</option>
              <option value="Roasted Cauliflower">Roasted Cauliflower</option>
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

        {menuType && menuSelection && (
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
