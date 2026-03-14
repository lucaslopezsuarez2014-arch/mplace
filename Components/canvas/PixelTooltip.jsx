import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PixelTooltip({ pixel, coords, position }) {
  if (!coords) return null;
  return (
    <div className="fixed z-50 bg-[#1a1a1b] border border-[#343536] rounded-lg shadow-xl p-3 pointer-events-none" style={{ left: position.x + 15, top: position.y + 15, transform: position.x > window.innerWidth - 200 ? 'translateX(-100%)' : 'none' }}>
      <div className="text-white text-sm space-y-1">
        <div className="flex items-center gap-2"><span className="text-gray-400">Posición:</span><span className="font-mono">({coords.x}, {coords.y})</span></div>
        {pixel ? (
          <>
            <div className="flex items-center gap-2"><span className="text-gray-400">Color:</span><div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: pixel.color }} /><span className="font-mono text-xs">{pixel.color}</span></div>
            <div className="flex items-center gap-2"><span className="text-gray-400">Por:</span><span className="truncate max-w-[150px]">{pixel.placed_by || 'Anónimo'}</span></div>
            {pixel.placed_at && <div className="flex items-center gap-2"><span className="text-gray-400">Fecha:</span><span className="text-xs">{format(new Date(pixel.placed_at), "d MMM yyyy, HH:mm", { locale: es })}</span></div>}
          </>
        ) : <div className="text-gray-500 italic">Píxel vacío</div>}
      </div>
    </div>
  );
}