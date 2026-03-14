import React from 'react';

export default function CoordinatesDisplay({ coords, zoom }) {
  return (
    <div className="bg-[#1a1a1b] border border-[#343536] rounded-full px-4 py-2 text-white font-mono text-sm">
      {coords ? <span>({coords.x}, {coords.y})</span> : <span>---</span>}
      <span className="text-gray-500 ml-2">{zoom.toFixed(2)}x</span>
    </div>
  );
}