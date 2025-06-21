import React, { useState, useEffect, useRef } from 'react';
import './BuildMode.css';
import CanvasWrapper from './CanvasWrapper';
import {
  fetchLayoutNames,
  fetchLayoutByName,
  saveLayout,
  deleteLayout,
} from '../services/layoutService';
import {
  createNewElement,
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [contentPosition, setContentPosition] = useState({ x: 0, y: 0 });
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [showLayoutDialog, setShowLayoutDialog] = useState(false);
  const [selectedLayoutForAction, setSelectedLayoutForAction] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadLayoutNames = async () => {
      try {
        const names = await fetchLayoutNames();
        setSavedLayouts(names);
      } catch (err) {
        console.error('Error fetching layouts:', err);
      }
    };

    loadLayoutNames();
  }, []);

  const handleTransformChange = ({ zoomLevel, contentPosition }) => {
    setZoomLevel(zoomLevel);
    setContentPosition(contentPosition);
  };

  const addElement = () => {
    try {
      const canvasRect = document
        .querySelector('.canvas-wrapper')
        .getBoundingClientRect();
      const newElement = createNewElement(
        selectedType,
        canvasRect,
        zoomLevel,
        contentPosition
      );
      if (!newElement || !newElement.id) {
        throw new Error('Invalid element created. Please check the service.');
      }
      setElements([...elements, newElement]);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding element:', error);
      alert('Failed to add element. Please try again.');
    }
  };

  const handleDrag = (id, e, offsetX, offsetY) => {
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const newX =
      (e.clientX - canvasRect.left - offsetX) / zoomLevel - contentPosition.x;
    const newY =
      (e.clientY - canvasRect.top - offsetY) / zoomLevel - contentPosition.y;

    const updated = elements.map((el) =>
      el.id === id ? { ...el, x: newX, y: newY } : el
    );
    setElements(updated);
  };

  const handleMouseDown = (id, e) => {
    e.stopPropagation(); // Prevent canvas panning
    setIsDraggingObject(true);

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const element = elements.find((el) => el.id === id);

    const offsetX =
      e.clientX -
      canvasRect.left -
      element.x * zoomLevel -
      contentPosition.x * zoomLevel;
    const offsetY =
      e.clientY -
      canvasRect.top -
      element.y * zoomLevel -
      contentPosition.y * zoomLevel;

    const onMouseMove = (e) => handleDrag(id, e, offsetX, offsetY);
    const onMouseUp = () => {
      setIsDraggingObject(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleCanvasMouseDown = (e) => {
    if (isDraggingObject) return;

    const startX = e.clientX;
    const startY = e.clientY;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      setContentPosition((prev) => ({
        x: prev.x + deltaX / zoomLevel,
        y: prev.y + deltaY / zoomLevel,
      }));
    };

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
    const { updatedElements, newSelectedTables } = joinTablesService(
      elements,
      selectedTables
    );
    setElements(updatedElements);
    setSelectedTables(newSelectedTables);
  };

  const rotateElement = (id) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id || (el.joinedFrom && el.joinedFrom.includes(id))
          ? { ...el, rotation: ((el.rotation || 0) + 45) % 360 }
          : el
      )
    );
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
      console.error('Error saving layout:', err);
      alert('Failed to save layout');
    }
  };

  const handleLoadLayout = async (name) => {
    try {
      const loadedElements = await fetchLayoutByName(name);
      setElements(loadedElements);
    } catch (err) {
      console.error('Failed to load layout:', err);
    }
  };

  const handleDeleteLayout = async () => {
    try {
      await deleteLayout(selectedLayoutForAction);
      alert(`Layout '${selectedLayoutForAction}' deleted successfully.`);
      setSavedLayouts(
        savedLayouts.filter((name) => name !== selectedLayoutForAction)
      );
      setShowLayoutDialog(false);
    } catch (err) {
      console.error('Failed to delete layout:', err);
      alert('Failed to delete layout. Please try again.');
    }
  };

  return (
    <div
      className="build-mode"
      onWheel={(e) => e.preventDefault()}
      onMouseDown={handleCanvasMouseDown}
      ref={canvasRef}
    >
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

        <select
          onChange={(e) => {
            setSelectedLayoutForAction(e.target.value);
            setShowLayoutDialog(true);
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Select Layout
          </option>
          {savedLayouts.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <CanvasWrapper onTransformChange={handleTransformChange}>
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
              transform: `rotate(${el.rotation || 0}deg)`,
              transformOrigin: 'center center',
            }}
            onMouseDown={(e) => handleMouseDown(el.id, e)}
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

            {selectedTables.find((t) => t.id === el.id) && (
              <button
                className="rotate-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  rotateElement(el.id);
                }}
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '0',
                  background: '#ddd',
                  border: '1px solid #aaa',
                  borderRadius: '4px',
                  fontSize: '12px',
                  padding: '2px 5px',
                  cursor: 'pointer',
                }}
              >
                🔄
              </button>
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
      </CanvasWrapper>

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

      {showLayoutDialog && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              What would you like to do with the layout '
              {selectedLayoutForAction}'?
            </h3>
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleLoadLayout(selectedLayoutForAction)}>
                Load
              </button>
              <button
                onClick={handleDeleteLayout}
                style={{
                  marginLeft: '10px',
                  backgroundColor: 'red',
                  color: 'white',
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowLayoutDialog(false)}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildMode;
