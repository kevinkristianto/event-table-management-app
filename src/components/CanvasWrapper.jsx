import React, { useState, useRef, useEffect } from 'react';
import './CanvasWrapper.css';

const CanvasWrapper = ({ children, onTransformChange }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [contentPosition, setContentPosition] = useState({ x: 0, y: 0 });
  const zoomLevelRef = useRef(zoomLevel);
  const contentPositionRef = useRef(contentPosition);

  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);
  const [lastTouch, setLastTouch] = useState(null);
  const [lastPinchDistance, setLastPinchDistance] = useState(null);

  const contentRef = useRef(null);
  const lastTouchMoveUpdate = useRef(Date.now());

  useEffect(() => {
    contentPositionRef.current = contentPosition;
    zoomLevelRef.current = zoomLevel;
    if (onTransformChange) {
      onTransformChange({ zoomLevel, contentPosition });
    }
  }, [zoomLevel, contentPosition, onTransformChange]);

  const applyTransformDirectly = (pos, zoom) => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`;
    }
  };

  const handleMouseDown = (e) => {
    setIsPanning(true);
    setStartPan({
      x: e.clientX - contentPositionRef.current.x,
      y: e.clientY - contentPositionRef.current.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const newPos = {
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    };
    contentPositionRef.current = newPos;
    setContentPosition(newPos);
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const ZOOM_SENSITIVITY = 0.0015;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const prevZoom = zoomLevelRef.current;
    const zoomFactor = 1 - e.deltaY * ZOOM_SENSITIVITY;
    const newZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.5), 2);
    const scale = newZoom / prevZoom;

    const prevPos = contentPositionRef.current;
    const newPos = {
      x: mouseX - (mouseX - prevPos.x) * scale,
      y: mouseY - (mouseY - prevPos.y) * scale,
    };

    contentPositionRef.current = newPos;
    zoomLevelRef.current = newZoom;

    applyTransformDirectly(newPos, newZoom);
    setContentPosition(newPos);
    setZoomLevel(newZoom);
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchMidpoint = (touches) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsTouching(true);
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLastPinchDistance(null);
    } else if (e.touches.length === 2) {
      setIsTouching(false);
      setLastTouch(null);
      setLastPinchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastPinchDistance !== null) {
      const newDistance = getTouchDistance(e.touches);
      const midpoint = getTouchMidpoint(e.touches);
      const rect = contentRef.current.parentElement.getBoundingClientRect();

      const centerX = midpoint.x - rect.left;
      const centerY = midpoint.y - rect.top;

      const prevZoom = zoomLevelRef.current;
      const scale = newDistance / lastPinchDistance;
      const newZoom = Math.min(Math.max(prevZoom * scale, 0.5), 2);
      const scaleChange = newZoom / prevZoom;

      const prevPos = contentPositionRef.current;
      const newPos = {
        x: centerX - (centerX - prevPos.x) * scaleChange,
        y: centerY - (centerY - prevPos.y) * scaleChange,
      };

      contentPositionRef.current = newPos;
      zoomLevelRef.current = newZoom;

      applyTransformDirectly(newPos, newZoom);

      if (Date.now() - lastTouchMoveUpdate.current > 50) {
        setContentPosition(newPos);
        setZoomLevel(newZoom);
        lastTouchMoveUpdate.current = Date.now();
      }

      setLastPinchDistance(newDistance);
      e.preventDefault();
    } else if (isTouching && e.touches.length === 1 && lastTouch) {
      const deltaX = e.touches[0].clientX - lastTouch.x;
      const deltaY = e.touches[0].clientY - lastTouch.y;

      const prevPos = contentPositionRef.current;
      const newPos = {
        x: prevPos.x + deltaX,
        y: prevPos.y + deltaY,
      };

      contentPositionRef.current = newPos;
      applyTransformDirectly(newPos, zoomLevelRef.current);

      if (Date.now() - lastTouchMoveUpdate.current > 50) {
        setContentPosition(newPos);
        lastTouchMoveUpdate.current = Date.now();
      }

      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsTouching(false);
      setLastTouch(null);
      setLastPinchDistance(null);
    } else if (e.touches.length === 1) {
      setIsTouching(true);
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLastPinchDistance(null);
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
          transformOrigin: 'top left',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default CanvasWrapper;
