import './GuestStyles.css';
import { useNavigate, useLocation } from 'react-router-dom';

const GuestMenuConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selection, guestToken } = location.state || {};

  return (
    <div>
      <h2 className="guest-title">Your Menu Selection</h2>
      <div className="guest-menu-confirmation">
        <div className="selection-details">
          {selection ? (
            <ul>
              {Object.entries(selection).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          ) : (
            <p>No selection made yet.</p>
          )}
        </div>
        <button
          className="edit-button"
          onClick={() => navigate(`/guest/menu-selection/${guestToken}`)} // Navigate back to GuestForm
        >
          Edit
        </button>
        <h5>
          <i>Please note that menu can only be editted until 15/09/2025</i>
        </h5>
      </div>
    </div>
  );
};

export default GuestMenuConfirmation;
