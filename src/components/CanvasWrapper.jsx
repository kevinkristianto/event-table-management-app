import React, { useState, useRef, useEffect } from 'react';
import './CanvasWrapper.css';

const CanvasWrapper = ({ children, onTransformChange }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [contentPosition, setContentPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const contentRef = useRef(null);

  useEffect(() => {
    if (onTransformChange) {
      onTransformChange({ zoomLevel, contentPosition });
    }
  }, [zoomLevel, contentPosition, onTransformChange]);

  const handleMouseDown = (e) => {
    setIsPanning(true);
    setStartPan({
      x: e.clientX - contentPosition.x,
      y: e.clientY - contentPosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;

    const newX = e.clientX - startPan.x;
    const newY = e.clientY - startPan.y;

    setContentPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const zoomChange = e.deltaY > 0 ? -0.01 : 0.01;
    setZoomLevel((prev) => Math.min(Math.max(prev + zoomChange, 0.5), 2));
  };

  return (
    <div
      className="canvas-wrapper"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        className="canvas-content"
        ref={contentRef}
        style={{
          transform: `translate(${contentPosition.x}px, ${contentPosition.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default CanvasWrapper;
