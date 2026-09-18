import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  userId: string;
  email: string;
  fullName: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: String) => Promise<void>;
  signup: (email: string, password: String, fullName: string) => Promise<{ requiresVerification: boolean }>;
  verifyCode: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: String) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token, refreshToken, userId, fullName, onboardingCompleted, avatarUrl, careerGoal } = response.data;
    if (avatarUrl) localStorage.setItem('userAvatar', avatarUrl);
    if (careerGoal) localStorage.setItem('careerGoal', careerGoal);
    
    const userData = { userId, email, fullName, onboardingCompleted };
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async (email: string, password: String, fullName: string) => {
    const response = await api.post('/api/auth/signup', { email, password, fullName });
    const { token, refreshToken, userId, message, onboardingCompleted } = response.data;
    
    if (message === 'verification_required') {
      return { requiresVerification: true };
    }
    
    const userData = { userId, email, fullName, onboardingCompleted };
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return { requiresVerification: false };
  };

  const verifyCode = async (email: string, code: string) => {
    const response = await api.post('/api/auth/verify', { email, code });
    const { token, refreshToken, userId, fullName, onboardingCompleted, avatarUrl, careerGoal } = response.data;
    if (avatarUrl) localStorage.setItem('userAvatar', avatarUrl);
    if (careerGoal) localStorage.setItem('careerGoal', careerGoal);
    
    const userData = { userId, email, fullName, onboardingCompleted };
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const resendCode = async (email: string) => {
    await api.post('/api/auth/resend-code', { email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyCode, resendCode, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
