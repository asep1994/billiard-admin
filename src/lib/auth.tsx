'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, clearToken, getToken, setToken } from './api';
import type { AuthUser } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no token to verify, nothing to await
      setIsLoading(false);
      return;
    }

    apiFetch<{ data: AuthUser }>('/me')
      .then((response) => setUser(response.data))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiFetch<{ user: AuthUser; token: string }>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(response.token);
      setUser(response.user);
      router.push('/dashboard');
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch {
      // token may already be invalid server-side; clear local state regardless
    }

    clearToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
