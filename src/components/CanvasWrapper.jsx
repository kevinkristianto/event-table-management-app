import React, { useState, useRef, useEffect } from 'react';
import './CanvasWrapper.css';

const CanvasWrapper = ({ children, onTransformChange }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [contentPosition, setContentPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);
  const [lastTouch, setLastTouch] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (onTransformChange) {
      onTransformChange({ zoomLevel, contentPosition });
    }
  }, [zoomLevel, contentPosition, onTransformChange]);

  // Allow panning to start anywhere, but only trigger click if no movement
  const [mouseMoved, setMouseMoved] = useState(false);
  const handleMouseDown = (e) => {
    setIsPanning(true);
    setStartPan({
      x: e.clientX - contentPosition.x,
      y: e.clientY - contentPosition.y,
    });
    setMouseMoved(false);
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setMouseMoved(true);
    const newX = e.clientX - startPan.x;
    const newY = e.clientY - startPan.y;
    setContentPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setMouseMoved(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomChange = e.deltaY > 0 ? -0.01 : 0.01;
    setZoomLevel((prev) => Math.min(Math.max(prev + zoomChange, 0.5), 2));
  };

  // For pinch zoom
  const [lastPinchDistance, setLastPinchDistance] = useState(null);

  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch: allow panning/zooming anywhere, but only trigger click if no movement
  const [touchMoved, setTouchMoved] = useState(false);
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsTouching(true);
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLastPinchDistance(null);
      setTouchMoved(false);
    } else if (e.touches.length === 2) {
      setIsTouching(false);
      setLastTouch(null);
      setLastPinchDistance(getTouchDistance(e.touches));
      setTouchMoved(false);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastPinchDistance !== null) {
      // Pinch zoom
      const newDistance = getTouchDistance(e.touches);
      const delta = newDistance - lastPinchDistance;
      if (Math.abs(delta) > 2) {
        // threshold to avoid jitter
        setZoomLevel((prev) => {
          let next = prev + delta * 0.003; // adjust sensitivity as needed
          next = Math.min(Math.max(next, 0.5), 2);
          return next;
        });
        setLastPinchDistance(newDistance);
      }
      setTouchMoved(true);
      e.preventDefault();
    } else if (isTouching && e.touches.length === 1 && lastTouch) {
      // Panning
      const deltaX = e.touches[0].clientX - lastTouch.x;
      const deltaY = e.touches[0].clientY - lastTouch.y;
      setContentPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setTouchMoved(true);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsTouching(false);
      setLastTouch(null);
      setLastPinchDistance(null);
      setTouchMoved(false);
    } else if (e.touches.length === 1) {
      setIsTouching(true);
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLastPinchDistance(null);
      setTouchMoved(false);
    }
  };

  return (
    <div
      className="canvas-wrapper"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
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
