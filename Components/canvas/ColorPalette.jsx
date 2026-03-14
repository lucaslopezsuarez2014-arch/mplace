import React from 'react';
import { X, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

const COLORS = [
  '#000000', '#1D1D1D', '#4A4A4A', '#787878', '#A5A5A5', '#D4D4D4', '#FFFFFF',
  '#FF4500', '#FFA800', '#FFD635', '#00A368', '#7EED56', '#2450A4', '#3690EA',
  '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', '#6D482F',
  '#BE0039', '#FF3881', '#6A5CFF', '#493AC1', '#009EAA', '#00756F',
  '#00CC78', '#94B3FF', '#E4ABFF', '#DE107F', '#FF6D00', '#FFB470'
];

export default function ColorPalette({ selectedColor, onColorSelect, onCancel, onConfirm, showActions }) {
  return (
    <div className="bg-[#1a1a1b] border-t border-[#343536] p-4">
      <div className="flex flex-wrap justify-center gap-1 max-w-2xl mx-auto">
        {COLORS.map((color) => (
          <button key={color} onClick={() => onColorSelect(color)} className={`w-8 h-8 rounded-sm transition-all duration-150 hover:scale-110 ${selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1b] scale-110' : 'hover:ring-1 hover:ring-white/50'}`} style={{ backgroundColor: color }} title={color} />
        ))}
      </div>
      {showActions && (
        <div className="flex justify-center gap-3 mt-4">
          <Button variant="outline" size="lg" onClick={onCancel} className="bg-transparent border-[#343536] text-white hover:bg-[#272729] px-8"><X className="w-5 h-5" /></Button>
          <Button size="lg" onClick={onConfirm} disabled={!selectedColor} className="bg-white text-black hover:bg-gray-200 px-8"><Check className="w-5 h-5" /></Button>
        </div>
      )}
    </div>
  );
}