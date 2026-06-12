import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import * as authApi from '../api/auth';

interface AuthContextType {
  user:        User | null;
  token:       string | null;
  isLoading:   boolean;
  login:       (email: string, password: string) => Promise<void>;
  logout:      () => Promise<void>;
  isAdmin:     () => boolean;
  isShopOwner: () => boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load — restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('medifind_token');
    const savedUser  = localStorage.getItem('medifind_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });

    localStorage.setItem('medifind_token', data.token);
    localStorage.setItem('medifind_user',  JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (_) {}
    localStorage.removeItem('medifind_token');
    localStorage.removeItem('medifind_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin     = () => user?.role === 'admin';
  const isShopOwner = () => user?.role === 'shop_owner';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin, isShopOwner }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this anywhere: const { user, login } = useAuth()
export const useAuth = () => useContext(AuthContext);