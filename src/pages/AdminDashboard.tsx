import React, { useState, useRef } from 'react';
import { ARCanvas, ARCanvasRef } from '../components/ARCanvas';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2, Home } from 'lucide-react';
import { logout } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, loading, logoutCustom } = useAuth();
  const navigate = useNavigate();
  const arRef = useRef<ARCanvasRef>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [selectedType, setSelectedType] = useState<'cube' | 'sphere' | 'cylinder'>('cube');
  const [selectedColor, setSelectedColor] = useState<string>('#ff3366');

  // Protect route
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <ARCanvas 
        ref={arRef} 
        isAdmin={true} 
        onSessionStart={() => setSessionActive(true)}
        onSessionEnd={() => setSessionActive(false)}
      />
      
      {!sessionActive && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-4 pb-32">
          <h1 className="text-4xl font-bold text-[#E0E2E5] mb-2 uppercase tracking-widest drop-shadow-md">Admin Dashboard</h1>
          <p className="text-[10px] text-[#8E9299] font-mono tracking-widest uppercase mb-8 text-center max-w-md drop-shadow mt-4">
            ENTER AR MODE USING THE BUTTON BELOW TO PLACE, MODIFY, AND DELETE WORLD ANCHORS THAT ALL USERS WILL SEE.
          </p>
          
          <div className="flex gap-4 pointer-events-auto">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-[#525866] hover:text-[#00F0FF] bg-[#14161B]/80 border border-[#2D3139] px-4 py-2 rounded-sm text-[10px] font-mono tracking-widest uppercase transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button 
                onClick={async () => { 
                  if (logoutCustom) logoutCustom(); 
                  else await logout(); 
                  navigate('/'); 
                }}
                className="flex items-center gap-2 text-[#525866] hover:text-[#FF0055] bg-[#14161B]/80 border border-[#2D3139] px-4 py-2 rounded-sm text-[10px] font-mono tracking-widest uppercase transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
          </div>
        </div>
      )}

      {sessionActive && (
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col gap-4 pointer-events-none">
          {/* Controls overlay */}
          <div className="mx-auto bg-[#14161B]/90 backdrop-blur-md rounded-sm p-4 flex gap-4 pointer-events-auto border border-[#2D3139] shadow-2xl">
            <div className="flex flex-col gap-2 border-r border-[#2D3139] pr-4">
              <label className="text-[9px] font-bold text-[#8E9299] uppercase tracking-[0.2em]">Shape</label>
              <div className="flex gap-2">
                {['cube', 'sphere', 'cylinder'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t as any)}
                    className={`px-3 py-2 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-colors border ${selectedType === t ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]' : 'bg-[#1C1F26] text-[#525866] border-[#2D3139] hover:bg-[#1C1F26]/80 hover:text-[#8E9299]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold text-[#8E9299] uppercase tracking-[0.2em]">Color</label>
              <input 
                type="color" 
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-10 h-10 rounded-sm cursor-pointer bg-[#1C1F26] border border-[#2D3139] p-0"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 pointer-events-auto">
            <button 
              onClick={() => arRef.current?.placeObject(selectedType, selectedColor)}
              className="flex items-center gap-2 px-8 py-4 bg-[#00F0FF] text-[#0A0B0E] rounded-sm font-bold shadow-[0_0_20px_rgba(0,240,255,0.2)] text-[10px] uppercase tracking-widest hover:bg-[#00F0FF]/90 transition"
            >
              <Plus className="w-4 h-4" />
              Place Anchor
            </button>
            <button 
              onClick={() => arRef.current?.deleteLookedAtObject()}
              className="flex items-center justify-center w-12 h-12 bg-[#FF0055] text-white rounded-sm shadow-[0_0_20px_rgba(255,0,85,0.2)] hover:bg-[#FF0055]/90 transition border border-[#FF0055]"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
