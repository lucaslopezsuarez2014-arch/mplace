import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CooldownTimer({ cooldownEnd, onCooldownComplete }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!cooldownEnd) { setTimeLeft(0); return; }
    const updateTimer = () => {
      const remaining = Math.max(0, cooldownEnd - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0) onCooldownComplete?.();
    };
    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [cooldownEnd, onCooldownComplete]);

  if (timeLeft === 0) return null;
  const seconds = Math.ceil(timeLeft / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="flex items-center gap-2 bg-[#272729] rounded-full px-4 py-2 text-white">
      <Clock className="w-4 h-4 text-orange-500" />
      <span className="font-mono text-sm">{minutes > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${seconds}s`}</span>
    </div>
  );
}