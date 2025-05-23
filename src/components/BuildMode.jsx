import React, { useState, useEffect, useRef } from 'react';
import './BuildMode.css';
import { fetchLayoutNames, fetchLayoutByName, saveLayout } from '../services/layoutService';
import {
  createNewElement,
  updateElementPosition,
  toggleTableSelection,
  joinTables as joinTablesService,
  applyNameEdit,
  deleteElementById,
} from '../services/propertiesBuildService';

const BuildMode = () => {
  const [elements, setElements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('table');
  const [selectedTables, setSelectedTables] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [layoutName, setLayoutName] = useState('');
  const [savedLayouts, setSavedLayouts] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadLayoutNames = async () => {
      try {
        const names = await fetchLayoutNames();
        setSavedLayouts(names);
      } catch (err) {
        console.error('Error fetching layouts', err);
      }
    };

    loadLayoutNames();
  }, []);

  const addElement = () => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newElement = createNewElement(selectedType, canvasRect);
    setElements([...elements, newElement]);
    setShowModal(false);
  };

  const handleDrag = (id, e) => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const updated = updateElementPosition(elements, id, e.clientX, e.clientY, canvasRect);
    setElements(updated);
  };

  const handleMouseDown = (id) => {
    const onMouseMove = (e) => handleDrag(id, e);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const toggleSelect = (el) => {
    const updatedSelection = toggleTableSelection(selectedTables, el);
    setSelectedTables(updatedSelection);
  };

  const joinTables = () => {
    const { updatedElements, newSelectedTables } = joinTablesService(elements, selectedTables);
    setElements(updatedElements);
    setSelectedTables(newSelectedTables);
  };

  const handleDoubleClick = (el) => {
    setEditingId(el.id);
    setEditingName(el.name);
  };

  const applyEdit = () => {
    setElements(applyNameEdit(elements, editingId, editingName));
    setEditingId(null);
    setEditingName('');
  };

  const deleteElement = (id) => {
    setElements(deleteElementById(elements, id));
  };

  const handleSaveLayout = async () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    try {
      await saveLayout(layoutName.trim(), elements);
      alert('Layout saved!');
      const names = await fetchLayoutNames();
      setSavedLayouts(names);
    } catch (err) {
      console.error('Error saving layout', err);
      alert('Failed to save layout');
    }
  };

  const handleLoadLayout = async (name) => {
    try {
      const loadedElements = await fetchLayoutByName(name);
      setElements(loadedElements);
    } catch (err) {
      console.error('Failed to load layout', err);
    }
  };

  return (
    <div className="build-mode">
      <h2>Build Mode</h2>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => setShowModal(true)}>Add Properties</button>
        {selectedTables.length >= 2 && (
          <button onClick={joinTables}>Join Tables</button>
        )}

        <input
          type="text"
          placeholder="Enter layout name"
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
        />
        <button onClick={handleSaveLayout} disabled={!layoutName.trim()}>
          Save Layout
        </button>

        <select onChange={(e) => handleLoadLayout(e.target.value)} defaultValue="">
          <option value="" disabled>
            Load Layout
          </option>
          {savedLayouts.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="canvas" ref={canvasRef}>
        {elements.map((el) => (
          <div
            key={el.id}
            className={`element ${el.type} ${
              selectedTables.find((t) => t.id === el.id) ? 'selected' : ''
            }`}
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              position: 'absolute',
              cursor: 'pointer',
            }}
            onMouseDown={() => handleMouseDown(el.id)}
            onClick={() => toggleSelect(el)}
            onDoubleClick={() => handleDoubleClick(el)}
          >
            {editingId === el.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={applyEdit}
                onKeyDown={(e) => e.key === 'Enter' && applyEdit()}
                autoFocus
              />
            ) : (
              <span className="label">{el.name}</span>
            )}
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(el.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Element</h3>
            <div className="tabs">
              <button
                className={selectedType === 'table' ? 'active' : ''}
                onClick={() => setSelectedType('table')}
              >
                Table
              </button>
              <button
                className={selectedType === 'chair' ? 'active' : ''}
                onClick={() => setSelectedType('chair')}
              >
                Chair
              </button>
            </div>
            <button onClick={addElement}>Add {selectedType}</button>
            <button
              onClick={() => setShowModal(false)}
              style={{ marginTop: '10px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildMode;
