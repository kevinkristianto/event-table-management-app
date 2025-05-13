import React, { useState, useEffect, useRef } from 'react';
import './BuildMode.css';

const TABLE_SIZE = 60;
const CHAIR_SIZE = 30;

const BuildMode = () => {
  const [elements, setElements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('table');
  const [selectedTables, setSelectedTables] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('layout');
    if (saved) {
      setElements(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('layout', JSON.stringify(elements));
  }, [elements]);

  const addElement = () => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newElement = {
      id: Date.now(),
      type: selectedType,
      name: '',
      x: canvasRect.width / 2 - 20,
      y: canvasRect.height / 2 - 20,
      width: selectedType === 'table' ? TABLE_SIZE : CHAIR_SIZE,
      height: selectedType === 'table' ? TABLE_SIZE : CHAIR_SIZE,
    };
    setElements([...elements, newElement]);
    setShowModal(false);
  };

  const handleDrag = (id, e) => {
    const canvas = canvasRef.current.getBoundingClientRect();
    const updated = elements.map((el) =>
      el.id === id
        ? {
            ...el,
            x: e.clientX - canvas.left - el.width / 2,
            y: e.clientY - canvas.top - el.height / 2,
          }
        : el
    );
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
    if (el.type !== 'table') return;
    setSelectedTables((prev) =>
      prev.find((t) => t.id === el.id)
        ? prev.filter((t) => t.id !== el.id)
        : [...prev, el]
    );
  };

  const joinTables = () => {
    if (selectedTables.length < 2) return;

    const totalWidth = TABLE_SIZE * selectedTables.length;
    const midY = selectedTables.reduce((sum, t) => sum + t.y, 0) / selectedTables.length;
    const midX = selectedTables.reduce((sum, t) => sum + t.x, 0) / selectedTables.length;

    const newTable = {
      id: Date.now(),
      type: 'table',
      name: '',
      x: midX,
      y: midY,
      width: totalWidth,
      height: TABLE_SIZE,
      joinedFrom: selectedTables.map((t) => t.id),
    };

    setElements((prev) =>
      [...prev.filter((el) => !selectedTables.find((t) => t.id === el.id)), newTable]
    );
    setSelectedTables([]);
  };

  const handleDoubleClick = (el) => {
    setEditingId(el.id);
    setEditingName(el.name);
  };

  const applyEdit = () => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === editingId ? { ...el, name: editingName } : el
      )
    );
    setEditingId(null);
    setEditingName('');
  };

  const deleteElement = (id) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  return (
    <div className="build-mode">
      <h2>Build Mode</h2>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setShowModal(true)}>Add Properties</button>
        {selectedTables.length >= 2 && (
          <button onClick={joinTables}>Join Tables</button>
        )}
      </div>

      <div className="canvas" ref={canvasRef}>
        {elements.map((el) => (
          <div
            key={el.id}
            className={`element ${el.type} ${selectedTables.find((t) => t.id === el.id) ? 'selected' : ''}`}
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
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
            <button onClick={() => setShowModal(false)} style={{ marginTop: '10px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildMode;
