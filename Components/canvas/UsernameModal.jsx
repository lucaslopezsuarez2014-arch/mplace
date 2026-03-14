import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function UsernameModal({ open, onSubmit }) {
  const [username, setUsername] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); if (username.trim()) onSubmit(username.trim()); };
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-white text-black max-w-md" hideClose>
        <DialogHeader><DialogTitle className="text-2xl font-bold">Bienvenido a Place</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <p className="text-gray-700">Ingresa tu nombre de usuario para comenzar:</p>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tu nombre de usuario" className="text-lg" autoFocus maxLength={20} />
          <Button type="submit" disabled={!username.trim()} className="w-full bg-black text-white hover:bg-gray-800">Continuar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}