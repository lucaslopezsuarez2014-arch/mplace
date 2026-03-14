import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function WelcomeModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black max-w-md">
        <DialogHeader><DialogTitle className="text-2xl font-bold">Place</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-gray-700">Hay un lienzo vacío.</p>
          <p className="text-orange-600 font-medium">Puedes colocar un píxel sobre él, pero debes esperar para colocar otro.</p>
          <p className="text-blue-600 font-medium">Individualmente puedes crear algo.</p>
          <p className="text-gray-800 font-semibold">Juntos pueden crear algo más.</p>
        </div>
        <Button onClick={onClose} className="w-full bg-black text-white hover:bg-gray-800">Comenzar</Button>
      </DialogContent>
    </Dialog>
  );
}