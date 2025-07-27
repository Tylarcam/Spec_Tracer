import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

type Selection = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  active: boolean;
};

const RectScreenshotOverlay: React.FC<{ 
  onComplete?: (dataUrl: string) => void;
  onCancel?: () => void;
}> = ({ onComplete, onCancel }) => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to cancel screenshot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (onCancel) {
          onCancel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setSelection({
      startX: e.clientX,
      startY: e.clientY,
      endX: e.clientX,
      endY: e.clientY,
      active: true,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selection?.active) return;
    setSelection({
      ...selection,
      endX: e.clientX,
      endY: e.clientY,
      active: true,
    });
  };

  const handleMouseUp = async () => {
    if (!selection) return;
    setSelection({ ...selection, active: false });
    const x = Math.min(selection.startX, selection.endX);
    const y = Math.min(selection.startY, selection.endY);
    const width = Math.abs(selection.endX - selection.startX);
    const height = Math.abs(selection.endY - selection.startY);
    if (overlayRef.current) overlayRef.current.style.display = 'none';
    const canvas = await html2canvas(document.body, { x, y, width, height });
    const dataUrl = canvas.toDataURL('image/png');
    if (overlayRef.current) overlayRef.current.style.display = '';
    if (onComplete) onComplete(dataUrl);
    setSelection(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelection(null);
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.2)',
    cursor: 'crosshair',
    zIndex: 9999,
    userSelect: 'none',
  };

  let rectStyle: React.CSSProperties = {};
  if (selection) {
    const x = Math.min(selection.startX, selection.endX);
    const y = Math.min(selection.startY, selection.endY);
    const width = Math.abs(selection.endX - selection.startX);
    const height = Math.abs(selection.endY - selection.startY);
    rectStyle = {
      position: 'fixed',
      left: x,
      top: y,
      width,
      height,
      border: '2px dashed #00eaff',
      background: 'rgba(0, 234, 255, 0.15)',
      pointerEvents: 'none',
      zIndex: 10000,
    };
  }

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
      {selection && selection.active && <div style={rectStyle} />}
    </div>
  );
};

export default RectScreenshotOverlay; 