import React, { useEffect, useRef } from 'react';
import './ResizableText.css';

export const ResizableText = ({ text, className, isAssigned, zoomLevel }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isAssigned) return;

    const resizeText = () => {
      const container = containerRef.current;
      if (!container) return;

      const parent = container.parentElement;
      if (!parent) return;

      // Calculate the base font size based on the zoom level
      const baseFontSize = 20; // Default font size
      let scaledFontSize = baseFontSize * zoomLevel; // Scale font size by zoom level
      container.style.fontSize = `${scaledFontSize}px`;

      // Ensure the text fits within the parent container
      while (
        (container.scrollWidth > parent.clientWidth ||
          container.scrollHeight > parent.clientHeight) &&
        scaledFontSize > 1
      ) {
        container.style.fontSize = `${--scaledFontSize}px`;
      }

      // Center the text vertically and horizontally
      container.style.lineHeight = '1.2';
      container.style.textAlign = 'center';
    };

    resizeText();
    window.addEventListener('resize', resizeText);
    return () => window.removeEventListener('resize', resizeText);
  }, [isAssigned, text, zoomLevel]);

  return (
    <div ref={containerRef} className={`resizable-text ${className}`}>
      {text}
    </div>
  );
};
