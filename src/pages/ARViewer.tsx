import React, { useState } from 'react';
import { ARCanvas } from '../components/ARCanvas';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function ARViewer() {
  const navigate = useNavigate();
  const [sessionActive, setSessionActive] = useState(false);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <ARCanvas 
        isAdmin={false} 
        onSessionStart={() => setSessionActive(true)}
        onSessionEnd={() => setSessionActive(false)}
      />
      
      {!sessionActive && (
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-1 bg-[#1C1F26]/90 border border-[#2D3139] backdrop-blur-md text-[#00F0FF] text-[10px] uppercase font-mono tracking-widest rounded-sm hover:bg-[#00F0FF]/10 transition"
          >
            <ChevronLeft className="w-3 h-3" />
            Home
          </button>
        </div>
      )}
      
      {!sessionActive && (
        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none p-4 z-0">
            <h1 className="text-4xl font-bold text-[#E0E2E5] mb-2 text-center uppercase tracking-widest drop-shadow-lg">AR Viewer</h1>
            <p className="text-[#8E9299] text-[10px] font-mono tracking-widest uppercase max-w-sm text-center drop-shadow mt-4">
               FIND A FLAT SURFACE AND CLICK THE BUTTON BELOW TO SEE SHARED OBJECTS IN THE REAL WORLD.
            </p>
        </div>
      )}
      
      {sessionActive && (
        <div className="absolute inset-0 z-[9999] pointer-events-none flex flex-col justify-between p-4">
          <div className="flex justify-between items-start pointer-events-auto w-full">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-3 bg-[#1C1F26]/90 border border-[#2D3139] backdrop-blur-md text-[#00F0FF] text-[10px] uppercase font-mono tracking-widest rounded-sm hover:bg-[#00F0FF]/10 transition"
            >
              Exit AR
            </button>
            <div className="bg-[#1C1F26]/90 border border-[#2D3139] backdrop-blur-md px-4 py-2 rounded-sm text-[#00F0FF] text-[10px] uppercase font-mono tracking-widest">
              Exploring World
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
