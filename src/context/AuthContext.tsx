import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { User } from '../types';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  loginCustom?: (username: string, pass: string) => boolean;
  logoutCustom?: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockUser = localStorage.getItem('mockAdmin');
    if (mockUser === 'shehan') {
      setUser({ uid: 'shehan', role: 'admin' });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const role = 'admin';
        setUser({ ...firebaseUser, role });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginCustom = async (username: string, pass: string) => {
    if (username === 'shehan' && pass === '0000') {
      localStorage.setItem('mockAdmin', 'shehan');
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.warn("Failed anonymous sign-in, proceeding with mock auth only:", e);
      }
      setUser({ uid: 'shehan', role: 'admin' });
      return true;
    }
    return false;
  };

  const logoutCustom = () => {
    localStorage.removeItem('mockAdmin');
    setUser(null);
    auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginCustom, logoutCustom }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
