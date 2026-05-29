import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../firebase/firebase';
import { Shield } from 'lucide-react';

export default function Login() {
  const { user, loginCustom } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCustom && await loginCustom(username, password)) {
      navigate('/admin');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center p-4">
      <div className="bg-[#14161B] p-8 rounded-sm border border-[#2D3139] w-full max-w-md flex flex-col items-center">
        <Shield className="w-12 h-12 text-[#00F0FF] mb-6" />
        <h1 className="text-xl font-bold text-[#E0E2E5] mb-2 text-center uppercase tracking-widest">Admin Login</h1>
        <p className="text-[10px] text-[#8E9299] mb-8 text-center font-mono uppercase">AUTHENTICATE TO MANAGE AR OBJECTS IN THE SHARED WORLD.</p>
        
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="USERNAME" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#0A0B0E] border border-[#2D3139] text-[#E0E2E5] p-3 rounded-sm text-xs font-mono uppercase focus:border-[#00F0FF] outline-none"
            required
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0A0B0E] border border-[#2D3139] text-[#E0E2E5] p-3 rounded-sm text-xs font-mono focus:border-[#00F0FF] outline-none"
            required
          />
          <button 
            type="submit"
            className="w-full mt-2 py-4 px-4 bg-[#0A0B0E] border border-[#2D3139] hover:border-[#00F0FF] text-[#00F0FF] text-xs font-bold tracking-widest uppercase rounded-sm transition-colors flex items-center justify-center gap-2"
          >
            Sign in
          </button>
        </form>
        
        <button 
          onClick={() => navigate('/')}
          className="mt-6 text-[10px] font-mono tracking-widest uppercase text-[#525866] hover:text-[#00F0FF] transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
