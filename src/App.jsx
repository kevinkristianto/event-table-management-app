import React, { useState } from 'react';
import BuildMode from './components/BuildMode';
import EditMode from './components/EditMode';
import ViewMode from './components/ViewMode';
import GuestForm from './components/GuestForm';

const App = () => {
  const [mode, setMode] = useState('build');
  const layout = JSON.parse(localStorage.getItem("layout") || "[]");

  return (
    <div style={{ padding: 20 }}>
      <h1>Table Manager</h1>
      <div>
        <button onClick={() => setMode('build')}>Build</button>
        <button onClick={() => setMode('edit')}>Edit</button>
        <button onClick={() => setMode('view')}>View</button>
      </div>

      <GuestForm />

      {mode === 'build' && <BuildMode />}
      {mode === 'edit' && <EditMode elements={layout} />}
      {mode === 'view' && <ViewMode />}
    </div>
  );
};

export default App;
