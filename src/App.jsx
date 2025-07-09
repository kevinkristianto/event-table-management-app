import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';

import BuildMode from './components/BuildMode';
import EditMode from './components/EditMode';
import ViewMode from './components/ViewMode';
import GuestForm from './components/GuestForm';
import GuestList from './components/GuestList';
import GuestLanding from './components/GuestLanding';
import GuestMenuConfirmation from './components/GuestMenuConfirmation';

const AppWrapper = () => {
  const location = useLocation();
  const isGuestRoute = location.pathname.startsWith('/guest');
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        }
      );

      if (res.ok) {
        sessionStorage.setItem('isAdmin', 'true');
        setShowLoginModal(false);
        setPassword('');
        setLoginError('');
        navigate('/admin/build');
      } else {
        const data = await res.json();
        setLoginError(data.message || 'Invalid password');
      }
    } catch (err) {
      setLoginError('Could not connect to server');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    navigate('/view');
  };

  return (
    <div style={{ padding: 20 }}>
      {!isGuestRoute && <h1>Table Manager</h1>}

      {!isGuestRoute && (
        <nav style={{ marginBottom: 20 }}>
          {isAdmin && (
            <>
              <Link to="/admin/build">
                <button>Build</button>
              </Link>
              <Link to="/admin/edit">
                <button>Edit</button>
              </Link>
              <Link to="/admin/guests">
                <button>Guest List</button>
              </Link>
              <Link to="/view">
                <button>View</button>
              </Link>
              <button onClick={handleLogout} style={{ marginLeft: 10 }}>
                Logout of Admin
              </button>
            </>
          )}
          {!isAdmin && (
            <button onClick={() => setShowLoginModal(true)}>
              Login to Admin
            </button>
          )}
        </nav>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 8,
              minWidth: 300,
            }}
          >
            <h3>You are logging in as admin</h3>
            <p>Please enter the admin password:</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', marginBottom: 10 }}
                autoFocus
              />
              {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit">Submit</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setPassword('');
                    setLoginError('');
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Routes>
        {isAdmin && (
          <>
            <Route path="/admin/build" element={<BuildMode />} />
            <Route path="/admin/edit" element={<EditMode />} />
            <Route path="/admin/guests" element={<GuestList />} />
          </>
        )}
        <Route path="/view" element={<ViewMode />} />
        <Route
          path="/guest/menu-selection/:guestToken"
          element={<GuestForm />}
        />
        <Route path="/guest" element={<GuestLanding />} />
        <Route
          path="/guest/menu-confirmation/:guestToken"
          element={<GuestMenuConfirmation />}
        />
        {/* Catch unauthorized admin route access */}
        <Route
          path="/admin/*"
          element={!isAdmin ? <Navigate to="/view" /> : <></>}
        />
      </Routes>
    </div>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;
