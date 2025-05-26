import React, { useRef, useEffect } from 'react';

const ResizableText = ({ text, className }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const resizeText = () => {
      const container = containerRef.current;
      if (!container) return;

      const parent = container.parentElement;
      let fontSize = 20; // Start with a reasonable font size
      container.style.fontSize = `${fontSize}px`;

      // Gradually reduce font size until it fits within the parent
      while (
        (container.scrollWidth > parent.clientWidth ||
          container.scrollHeight > parent.clientHeight) &&
        fontSize > 1
      ) {
        fontSize -= 1;
        container.style.fontSize = `${fontSize}px`;
      }
    };

    resizeText();
    window.addEventListener('resize', resizeText); // Recalculate on window resize
    return () => window.removeEventListener('resize', resizeText);
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {text}
    </div>
  );
};

export default ResizableText;
