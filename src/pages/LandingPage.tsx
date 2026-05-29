import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ARSessionManager } from '../ar/ARSessionManager';
import { Cuboid, Map, Shield } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [arSupported, setArSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    ARSessionManager.isARSupported().then(setArSupported);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#E0E2E5] font-sans flex flex-col overflow-hidden">
      <header className="h-14 border-b border-[#2D3139] bg-[#14161B] px-6 flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#00F0FF] rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#0A0B0E]"></div>
          </div>
          <span className="font-bold tracking-tighter text-lg uppercase text-[#E0E2E5]">
            Knight Quest <span className="text-[#00F0FF]">AR</span>
          </span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-3 py-1 rounded bg-[#1C1F26] border border-[#2D3139] text-[#00F0FF] text-[10px] font-mono tracking-widest uppercase hover:bg-[#00F0FF]/10 transition-colors"
        >
          <Shield className="w-3 h-3" />
          Admin Login
        </button>
      </header>
      
      <main className="flex-1 flex flex-col justify-center items-center p-6 text-center max-w-4xl mx-auto w-full relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-full h-full border border-[#00F0FF]/10" style={{ backgroundImage: 'radial-gradient(#00F0FF 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 uppercase text-[#E0E2E5] z-10">
          Shared World <br/><span className="text-[#00F0FF]">Augmented Reality</span>
        </h1>
        <p className="text-sm font-mono text-[#8E9299] mb-12 max-w-2xl z-10">
          EXPERIENCE PERSISTENT DIGITAL OBJECTS ANCHORED IN THE REAL WORLD. VIEW MODELS PLACED BY ADMINS IN REAL-TIME STRAIGHT FROM YOUR BROWSER.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-10">
          <button 
            onClick={() => navigate('/ar')}
            disabled={arSupported === false}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-[#00F0FF] hover:bg-[#00F0FF]/80 disabled:bg-[#1C1F26] disabled:text-[#525866] disabled:border-[#2D3139] disabled:border disabled:cursor-not-allowed text-[#0A0B0E] px-8 py-4 rounded-sm font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] disabled:shadow-none"
          >
            <Map className="w-4 h-4" />
            {arSupported === false ? 'AR NOT SUPPORTED' : 'ENTER AR WORLD'}
          </button>
        </div>

        {arSupported === false && (
          <div className="mt-8 flex flex-col items-center gap-4 z-10 max-w-md">
            <p className="text-[10px] sm:text-xs font-mono tracking-widest uppercase text-[#FF0055] bg-[#FF0055]/10 py-3 px-4 rounded border border-[#FF0055]/30 text-center">
              WARNING: YOUR BROWSER DOES NOT SUPPORT WEBXR AR.<br /><br />
              <span className="text-[#E0E2E5]">IPHONE/IOS USERS: Apple Safari does not support WebXR yet. Please download the "WebXR Viewer" app by Mozilla from the App Store and open this link inside it.</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
