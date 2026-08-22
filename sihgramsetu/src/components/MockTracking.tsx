import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Tractor, CheckCircle, Loader2, Phone } from 'lucide-react';
import type { Booking } from '../store/useStore';

interface MockTrackingProps {
  booking: Booking;
  onClose: () => void;
}

type TrackingStage = 0 | 1 | 2 | 3;

const STAGES = [
  { icon: '🏠', label: 'निकल चुके हैं', sublabel: 'Provider has left their location', done: true },
  { icon: '🛣️', label: 'रास्ते में हैं', sublabel: 'On the way to your field', done: false },
  { icon: '📍', label: 'पहुँच गए', sublabel: 'Arrived at your location', done: false },
  { icon: '⚙️', label: 'काम चल रहा है', sublabel: 'Working on your field', done: false },
];

export const MockTracking: React.FC<MockTrackingProps> = ({ booking, onClose }) => {
  // Simulate progress: start at stage 1, auto-advance to stage 2 after 4s
  const [stage, setStage] = useState<TrackingStage>(1);
  const [eta, setEta] = useState(12); // minutes

  useEffect(() => {
    const etaTimer = setInterval(() => {
      setEta((prev) => Math.max(0, prev - 1));
    }, 3000); // countdown 1 minute every 3 seconds for demo
    return () => clearInterval(etaTimer);
  }, []);

  useEffect(() => {
    const stageTimer = setTimeout(() => {
      if (stage < 3) setStage((prev) => (prev + 1) as TrackingStage);
    }, 5000); // advance stage every 5s
    return () => clearTimeout(stageTimer);
  }, [stage]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-cream-800 shadow-xs">
        <button
          onClick={onClose}
          type="button"
          className="p-1.5 rounded-full hover:bg-cream-100 text-earth-700 active:scale-90 outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-base text-earth-900">🔍 लाइव ट्रैकिंग (Live Tracking)</h1>
          <p className="text-[10px] text-earth-500 font-semibold truncate max-w-[240px]">{booking.listingTitle}</p>
        </div>
      </div>

      {/* Mock Map Area */}
      <div className="relative mx-4 mt-4 h-52 rounded-3xl overflow-hidden bg-gradient-to-br from-rural-green-100 via-rural-green-50 to-cream-200 border border-rural-green-200 shadow-inner flex items-center justify-center">
        {/* Grid lines (mock map texture) */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#6b8f5e 1px, transparent 1px), linear-gradient(90deg, #6b8f5e 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Destination pin */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-rural-green-700 border-2 border-cream-50 shadow-md" />
          <div className="w-0.5 h-4 bg-rural-green-700 mt-0.5" />
          <p className="text-[9px] font-bold text-rural-green-900 bg-cream-50/80 px-1.5 py-0.5 rounded-full mt-0.5">
            आपका खेत
          </p>
        </div>

        {/* Tractor moving dot */}
        <div
          className="absolute flex flex-col items-center transition-all duration-1000"
          style={{
            bottom: stage >= 2 ? '52px' : stage === 1 ? '80px' : '110px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="relative">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full bg-harvest-gold/30 animate-ping scale-150" />
            <div className="w-10 h-10 bg-harvest-gold-dark rounded-full flex items-center justify-center shadow-lg border-2 border-cream-50 relative z-10">
              <Tractor className="w-5 h-5 text-cream-50" />
            </div>
          </div>
        </div>

        {/* ETA badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-1.5 shadow-md border border-cream-800">
          <p className="text-[10px] font-extrabold text-earth-500 uppercase">ETA</p>
          <p className="text-base font-extrabold text-earth-900">{eta} min</p>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="mx-4 mt-4 bg-white border border-cream-800 rounded-3xl p-5 shadow-xs">
        <p className="text-[11px] font-extrabold text-earth-500 uppercase tracking-widest mb-4">स्थिति (Status)</p>
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-cream-300" />

          <div className="space-y-4">
            {STAGES.map((s, i) => {
              const isCompleted = i < stage;
              const isActive = i === stage;
              return (
                <div key={i} className="flex items-start gap-3 relative">
                  {/* Stage indicator */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 border-2 z-10 transition-all ${
                    isCompleted
                      ? 'bg-rural-green-700 border-rural-green-700 text-cream-50'
                      : isActive
                        ? 'bg-harvest-gold-dark border-harvest-gold-dark text-cream-50 shadow-md'
                        : 'bg-cream-100 border-cream-300 text-earth-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{s.icon}</span>}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-bold ${isActive ? 'text-earth-900' : isCompleted ? 'text-rural-green-800' : 'text-earth-400'}`}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-earth-500 font-medium">{s.sublabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking info strip */}
      <div className="mx-4 mt-3 p-3.5 bg-rural-green-50 border border-rural-green-200 rounded-2xl flex items-center gap-3">
        <MapPin className="w-4 h-4 text-rural-green-700 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-earth-900 truncate">{booking.listingTitle}</p>
          <p className="text-[10px] text-earth-500">{booking.date} · {booking.quantity} {booking.unit === 'per hour' ? 'Hr' : 'Day'}</p>
        </div>
        <div className="flex items-center gap-1 bg-rural-green-700 text-cream-50 px-2.5 py-1.5 rounded-xl">
          <Phone className="w-3 h-3" />
          <span className="text-[10px] font-bold">Call</span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="p-4">
        <button
          onClick={onClose}
          type="button"
          className="w-full py-3.5 bg-cream-100 text-earth-700 border border-cream-800 font-bold rounded-2xl text-sm active:scale-[0.98] outline-none"
        >
          वापस जाएं (Close)
        </button>
      </div>
    </div>
  );
};
