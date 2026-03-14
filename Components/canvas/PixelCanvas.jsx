import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

const PIXEL_SIZE = 10;

export default function PixelCanvas({ pixels, selectedColor, onPixelClick, zoom, offset, onOffsetChange, onHoverPixel, disabled, canvasSize = 100 }) {
  const CANVAS_SIZE = canvasSize;
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState(null);

  const pixelMap = useMemo(() => {
    const map = new Map();
    pixels.forEach(pixel => map.set(`${pixel.x},${pixel.y}`, pixel));
    return map;
  }, [pixels]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scaledPixelSize = PIXEL_SIZE * zoom;
    ctx.fillStyle = '#1a1a1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const startX = Math.max(0, Math.floor(-offset.x / scaledPixelSize));
    const startY = Math.max(0, Math.floor(-offset.y / scaledPixelSize));
    const endX = Math.min(CANVAS_SIZE, Math.ceil((canvas.width - offset.x) / scaledPixelSize));
    const endY = Math.min(CANVAS_SIZE, Math.ceil((canvas.height - offset.y) / scaledPixelSize));
    ctx.fillStyle = '#2d2d2f';
    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        const drawX = x * scaledPixelSize + offset.x;
        const drawY = y * scaledPixelSize + offset.y;
        ctx.fillRect(drawX + 0.5, drawY + 0.5, scaledPixelSize - 1, scaledPixelSize - 1);
      }
    }
    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        const pixel = pixelMap.get(`${x},${y}`);
        if (pixel) {
          const drawX = x * scaledPixelSize + offset.x;
          const drawY = y * scaledPixelSize + offset.y;
          ctx.fillStyle = pixel.color;
          ctx.fillRect(drawX + 0.5, drawY + 0.5, scaledPixelSize - 1, scaledPixelSize - 1);
        }
      }
    }
    if (hoveredPixel && !isDragging) {
      const drawX = hoveredPixel.x * scaledPixelSize + offset.x;
      const drawY = hoveredPixel.y * scaledPixelSize + offset.y;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY, scaledPixelSize, scaledPixelSize);
      if (selectedColor && !disabled) {
        ctx.fillStyle = selectedColor + '80';
        ctx.fillRect(drawX + 0.5, drawY + 0.5, scaledPixelSize - 1, scaledPixelSize - 1);
      }
    }
  }, [pixels, pixelMap, zoom, offset, hoveredPixel, selectedColor, isDragging, disabled]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawCanvas();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  const getPixelCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaledPixelSize = PIXEL_SIZE * zoom;
    const x = Math.floor((e.clientX - rect.left - offset.x) / scaledPixelSize);
    const y = Math.floor((e.clientY - rect.top - offset.y) / scaledPixelSize);
    if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) return { x, y };
    return null;
  };

  const handleMouseDown = (e) => { setIsDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const handleMouseMove = (e) => {
    if (isDragging) {
      onOffsetChange({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else {
      const coords = getPixelCoords(e);
      setHoveredPixel(coords);
      if (coords) { const pixel = pixelMap.get(`${coords.x},${coords.y}`); onHoverPixel(coords, pixel); }
      else onHoverPixel(null, null);
    }
  };
  const handleMouseUp = (e) => {
    if (!isDragging || (Math.abs(e.clientX - dragStart.x - offset.x) < 5 && Math.abs(e.clientY - dragStart.y - offset.y) < 5)) {
      const coords = getPixelCoords(e);
      if (coords && selectedColor && !disabled) onPixelClick(coords.x, coords.y);
    }
    setIsDragging(false);
  };
  const handleMouseLeave = () => { setIsDragging(false); setHoveredPixel(null); onHoverPixel(null, null); };

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden cursor-crosshair" style={{ touchAction: 'none' }}>
      <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} className="block" />
    </div>
  );
}