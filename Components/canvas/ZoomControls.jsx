import React from 'react';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ZoomControls({ zoom, onZoomChange, onReset }) {
  return (
    <div className="flex flex-col gap-1 bg-[#1a1a1b] border border-[#343536] rounded-lg p-1">
      <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.min(zoom * 1.5, 10))} className="h-8 w-8 text-white hover:bg-[#272729]"><Plus className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.max(zoom / 1.5, 0.5))} className="h-8 w-8 text-white hover:bg-[#272729]"><Minus className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8 text-white hover:bg-[#272729]"><Maximize2 className="w-4 h-4" /></Button>
    </div>
  );
}