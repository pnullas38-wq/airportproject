import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane } from 'lucide-react';

const FlightSplash = ({ onComplete }) => {
  const [startFlying, setStartFlying] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // 1. First trigger the title text animation
    const textTimer = setTimeout(() => setShowText(true), 300);
    
    // 2. Trigger the flight takeoff animation shortly after
    const flightTimer = setTimeout(() => setStartFlying(true), 1200);

    // 3. Complete the splash screen after animations are done
    const endTimer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(flightTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      
      {/* 1. Neon Grid Runway Lines background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.8),rgba(2,6,23,1))]" />
      
      {/* Runway center lighting */}
      <div className="absolute bottom-0 w-1.5 h-1/2 bg-gradient-to-t from-blue-500/0 via-blue-500/25 to-blue-500/80 left-1/2 transform -translate-x-1/2 overflow-hidden blur-[1px]">
        <div className="w-full h-full bg-[linear-gradient(to_bottom,transparent_50%,#3b82f6_50%)] bg-[length:10px_20px] animate-pulse" />
      </div>

      {/* Runway side lights */}
      <div className="absolute bottom-0 w-[300px] h-1/2 left-1/2 transform -translate-x-1/2 flex justify-between opacity-30">
        <div className="w-1 h-full bg-gradient-to-t from-emerald-500/0 to-emerald-500 blur-[2px]" />
        <div className="w-1 h-full bg-gradient-to-t from-emerald-500/0 to-emerald-500 blur-[2px]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full bg-blue-400"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `pulse-slow ${Math.random() * 3 + 2}s infinite`
            }}
          />
        ))}
      </div>

      {/* 2. Brand Identity - Fade & Scaling Text */}
      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center relative z-10 space-y-3"
          >
            <motion.div
              initial={{ letterSpacing: '0.1em' }}
              animate={{ letterSpacing: '0.3em' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="text-4xl sm:text-5xl font-black text-white leading-none uppercase"
            >
              AEROSPHERE
            </motion.div>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-[0.5em] font-semibold">
              Airport Management Sync Gateway
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Flight Takeoff & Flight path Animation */}
      <AnimatePresence>
        {startFlying && (
          <motion.div
            // Starts off-screen at the bottom center (aligned with runway)
            // Accelerates forward, scales up as it lifts off, rotates upward, and flies off screen
            initial={{ 
              x: '-50%',
              y: '100%', 
              scale: 0.1, 
              rotate: 0, 
              opacity: 0 
            }}
            animate={{ 
              x: [ '0%', '0%', '150vw' ],
              y: [ '10vh', '-20vh', '-120vh' ], 
              scale: [ 0.15, 0.4, 3 ],
              rotate: [ 0, -25, -35 ],
              opacity: [ 0, 1, 1 ]
            }}
            transition={{ 
              duration: 2.8, 
              times: [0, 0.35, 1],
              ease: [0.25, 0.1, 0.25, 1] 
            }}
            className="absolute left-1/2 bottom-1/4 pointer-events-none z-20 flex items-center justify-center"
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <div className="relative">
              {/* Airplane Icon */}
              <Plane className="w-20 h-20 text-white fill-white shadow-2xl drop-shadow-[0_20px_50px_rgba(59,130,246,0.5)] rotate-45" />
              
              {/* Jet Thruster Flame Glow effect */}
              <motion.div 
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 0.15 }}
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-4 h-12 bg-gradient-to-t from-amber-500 via-orange-500 to-blue-500 blur-[2px] rounded-full rotate-45 origin-top"
              />

              {/* Jet trails */}
              <div className="absolute -bottom-16 left-0 right-0 flex justify-between px-2 opacity-50">
                <div className="w-1.5 h-32 bg-gradient-to-t from-transparent to-blue-400/30 blur-[1px] rounded-full origin-top transform rotate-45" />
                <div className="w-1.5 h-32 bg-gradient-to-t from-transparent to-blue-400/30 blur-[1px] rounded-full origin-top transform rotate-45" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern thin loading line at the bottom */}
      <div className="absolute bottom-12 left-10 right-10 h-0.5 bg-slate-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4.2, ease: 'easeInOut' }}
          className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
        />
      </div>

    </div>
  );
};

export default FlightSplash;
