import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

type Point = { x: number; y: number };

const FreeformScreenshotOverlay: React.FC<{ onComplete?: (dataUrl: string) => void }> = ({ onComplete }) => {
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDrawing(true);
    setPoints([{ x: e.clientX, y: e.clientY }]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    setPoints((pts) => [...pts, { x: e.clientX, y: e.clientY }]);
  };

  const handleMouseUp = async () => {
    setDrawing(false);
    if (points.length < 2) {
      setPoints([]);
      return;
    }
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const width = Math.max(...xs) - x;
    const height = Math.max(...ys) - y;
    if (overlayRef.current) overlayRef.current.style.display = 'none';
    const canvas = await html2canvas(document.body, { x, y, width, height });
    let dataUrl = canvas.toDataURL('image/png');
    if (overlayRef.current) overlayRef.current.style.display = '';
    if (onComplete) onComplete(dataUrl);
    else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'freeform-screenshot.png';
      link.click();
    }
    setPoints([]);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setDrawing(false);
    setPoints([]);
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.2)',
    cursor: 'crosshair',
    zIndex: 9999,
    userSelect: 'none',
  };

  const pathData =
    points.length > 1
      ? 'M ' + points.map((p) => `${p.x},${p.y}`).join(' L ') + ' Z'
      : '';

  return (
    <div
      ref={overlayRef}
      style={overlayStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      tabIndex={-1}
    >
      <svg
        style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 10000 }}
      >
        {pathData && (
          <path
            d={pathData}
            fill="rgba(0,234,255,0.15)"
            stroke="#00eaff"
            strokeWidth={2}
          />
        )}
      </svg>
    </div>
  );
};

export default FreeformScreenshotOverlay; 