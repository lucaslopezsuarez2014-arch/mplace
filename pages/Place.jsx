import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { HelpCircle, MoreHorizontal, Download } from 'lucide-react';
import { toast } from 'sonner';

import PixelCanvas from '@/components/canvas/PixelCanvas';
import ColorPalette from '@/components/canvas/ColorPalette';
import CooldownTimer from '@/components/canvas/CooldownTimer';
import PixelTooltip from '@/components/canvas/PixelTooltip';
import ZoomControls from '@/components/canvas/ZoomControls';
import CoordinatesDisplay from '@/components/canvas/CoordinatesDisplay';
import WelcomeModal from '@/components/canvas/WelcomeModal';
import UsernameModal from '@/components/canvas/UsernameModal';
import AdminPanel from '@/components/admin/AdminPanel';
import ExportButton from '@/components/canvas/ExportButton';

const COOLDOWN_MS = 30000;
const PIXEL_SIZE = 10;

export default function Place() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem('place_username'));
  const [showUsernameModal, setShowUsernameModal] = useState(!localStorage.getItem('place_username'));
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [canvasSize, setCanvasSize] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoveredCoords, setHoveredCoords] = useState(null);
  const [hoveredPixel, setHoveredPixel] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cooldownEnd, setCooldownEnd] = useState(null);
  const containerRef = useRef(null);
  const isAdmin = username === 'lucasls63';

  const { data: pixels = [] } = useQuery({
    queryKey: ['pixels'],
    queryFn: () => base44.entities.Pixel.list('-updated_date', 10000),
  });

  const { data: bannedUsers = [] } = useQuery({
    queryKey: ['bannedUsers'],
    queryFn: () => base44.entities.BannedUser.list(),
  });

  const { data: canvasSettings = [] } = useQuery({
    queryKey: ['canvasSettings'],
    queryFn: () => base44.entities.CanvasSettings.list(),
  });

  const CANVAS_SIZE = canvasSize;

  useEffect(() => {
    if (canvasSettings.length > 0) setCanvasSize(canvasSettings[0].canvas_size);
  }, [canvasSettings]);

  const handleUsernameSubmit = (newUsername) => {
    setUsername(newUsername);
    localStorage.setItem('place_username', newUsername);
    setShowUsernameModal(false);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        if (username) {
          const hasVisited = localStorage.getItem('place_visited');
          if (!hasVisited) {
            setShowWelcome(true);
            localStorage.setItem('place_visited', 'true');
          }
        }
        if (!isAdmin && username) {
          const cooldowns = await base44.entities.UserCooldown.filter({ user_email: userData?.email || username });
          if (cooldowns.length > 0) {
            const lastTime = new Date(cooldowns[0].last_pixel_time).getTime();
            const endTime = lastTime + COOLDOWN_MS;
            if (endTime > Date.now()) setCooldownEnd(endTime);
          }
        }
      } catch (e) {}
    };
    loadUser();
  }, [username, isAdmin]);

  useEffect(() => {
    const unsubscribe = base44.entities.Pixel.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['pixels'] });
    });
    return unsubscribe;
  }, [queryClient]);

  const placePixelMutation = useMutation({
    mutationFn: async ({ x, y, color }) => {
      const existing = await base44.entities.Pixel.filter({ x, y });
      const pixelData = { x, y, color, placed_by: username || user?.email || 'anónimo', placed_at: new Date().toISOString() };
      if (existing.length > 0) return base44.entities.Pixel.update(existing[0].id, pixelData);
      else return base44.entities.Pixel.create(pixelData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['pixels'] });
      if (!isAdmin) {
        const endTime = Date.now() + COOLDOWN_MS;
        setCooldownEnd(endTime);
        if (username) {
          const cooldowns = await base44.entities.UserCooldown.filter({ user_email: user?.email || username });
          const cooldownData = { user_email: user?.email || username, last_pixel_time: new Date().toISOString() };
          if (cooldowns.length > 0) await base44.entities.UserCooldown.update(cooldowns[0].id, cooldownData);
          else await base44.entities.UserCooldown.create(cooldownData);
        }
      }
      setShowPalette(false);
      setSelectedColor(null);
      toast.success('¡Píxel colocado!');
    },
    onError: () => toast.error('Error al colocar el píxel'),
  });

  const handlePixelClick = (x, y) => {
    if (!username) { toast.error('Debes tener un nombre de usuario'); return; }
    const isBanned = bannedUsers.some(ban => ban.user_email === (user?.email || username));
    if (isBanned && !isAdmin) { toast.error('Has sido baneado de Place'); return; }
    if (!selectedColor) return;
    if (cooldownEnd && cooldownEnd > Date.now() && !isAdmin) { toast.error('Debes esperar antes de colocar otro píxel'); return; }
    placePixelMutation.mutate({ x, y, color: selectedColor });
  };

  const handleHoverPixel = useCallback((coords, pixel) => {
    setHoveredCoords(coords);
    setHoveredPixel(pixel);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const canvasWidth = CANVAS_SIZE * PIXEL_SIZE * zoom;
      const canvasHeight = CANVAS_SIZE * PIXEL_SIZE * zoom;
      setOffset({ x: (width - canvasWidth) / 2, y: (height - canvasHeight) / 2 });
    }
  }, []);

  const handleResetView = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setZoom(1);
      setOffset({ x: (width - CANVAS_SIZE * PIXEL_SIZE) / 2, y: (height - CANVAS_SIZE * PIXEL_SIZE) / 2 });
    }
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(z => Math.max(0.5, Math.min(10, z * delta)));
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const isCoolingDown = cooldownEnd && cooldownEnd > Date.now() && !isAdmin;

  return (
    <div className="h-screen w-screen bg-[#1a1a1b] flex flex-col overflow-hidden">
      <UsernameModal open={showUsernameModal} onSubmit={handleUsernameSubmit} />
      <div className="absolute top-4 left-4 z-10 flex gap-2 items-center">
        <Button variant="ghost" size="icon" className="rounded-full bg-[#272729] text-white hover:bg-[#343536]">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
        {username && (
          <div className="bg-[#272729] rounded-full px-4 py-2 text-white text-sm">
            @{username}
            {isAdmin && <span className="ml-2 text-red-500 font-bold">ADMIN</span>}
          </div>
        )}
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <CoordinatesDisplay coords={hoveredCoords} zoom={zoom} />
      </div>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <ExportButton pixels={pixels} canvasSize={canvasSize} />
        <Button variant="ghost" size="icon" onClick={() => setShowWelcome(true)} className="rounded-full bg-[#272729] text-white hover:bg-[#343536]">
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
      <div ref={containerRef} className="flex-1 relative">
        <PixelCanvas pixels={pixels} selectedColor={selectedColor} onPixelClick={handlePixelClick} zoom={zoom} offset={offset} onOffsetChange={setOffset} onHoverPixel={handleHoverPixel} disabled={isCoolingDown || !showPalette} canvasSize={canvasSize} />
        <div className="absolute right-4 bottom-32 z-10">
          <ZoomControls zoom={zoom} onZoomChange={setZoom} onReset={handleResetView} />
        </div>
        {isCoolingDown && (
          <div className="absolute left-4 bottom-32 z-10">
            <CooldownTimer cooldownEnd={cooldownEnd} onCooldownComplete={() => setCooldownEnd(null)} />
          </div>
        )}
      </div>
      {showPalette ? (
        <ColorPalette selectedColor={selectedColor} onColorSelect={setSelectedColor} onCancel={() => { setShowPalette(false); setSelectedColor(null); }} onConfirm={() => { if (selectedColor && hoveredCoords) handlePixelClick(hoveredCoords.x, hoveredCoords.y); }} showActions={true} />
      ) : (
        <div className="flex justify-center p-4">
          <Button onClick={() => setShowPalette(true)} disabled={isCoolingDown} className="bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2 font-medium">
            Coloca un píxel
          </Button>
        </div>
      )}
      <PixelTooltip pixel={hoveredPixel} coords={hoveredCoords} position={mousePosition} />
      <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />
      {isAdmin && (
        <AdminPanel canvasSize={canvasSize} onCanvasSizeChange={(newSize) => { setCanvasSize(newSize); queryClient.invalidateQueries(['canvasSettings']); }} />
      )}
    </div>
  );
}