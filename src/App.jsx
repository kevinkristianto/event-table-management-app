import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import BuildMode from './components/BuildMode';
import EditMode from './components/EditMode';
import ViewMode from './components/ViewMode';
import GuestForm from './components/GuestForm';
import GuestList from './components/GuestList';
import GuestLanding from './components/GuestLanding';
import GuestMenuConfirmation from './components/GuestMenuConfirmation'; // Import the new component

const AppWrapper = () => {
  const location = useLocation();
  const isGuestRoute = location.pathname.startsWith('/guest');

  return (
    <div style={{ padding: 20 }}>
      {!isGuestRoute && <h1>Table Manager</h1>}

      {!isGuestRoute && (
        <nav style={{ marginBottom: 20 }}>
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
        </nav>
      )}

      <Routes>
        <Route path="/admin/build" element={<BuildMode />} />
        <Route path="/admin/edit" element={<EditMode />} />
        <Route path="/admin/guests" element={<GuestList />} />
        <Route path="/view" element={<ViewMode />} />
        <Route
          path="/guest/menu-selection/:guestToken"
          element={<GuestForm />}
        />
        <Route path="/guest" element={<GuestLanding />} />
        <Route
          path="/guest/menu-confirmation/:guestToken"
          element={<GuestMenuConfirmation />}
        />{' '}
        {/* Add route for GuestMenuConfirmation */}
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
