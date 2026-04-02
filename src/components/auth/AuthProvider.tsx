import { useSyncExternalStore, type ReactNode } from 'react';
import { authStore } from '@/lib/authStore';
import type { MeUser, LoginRequest, RegisterRequest } from '@/lib/api';

export interface AuthContextValue {
  user: MeUser | null;
  accessToken: string | null;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
}

/** @deprecated No longer needed — useAuth() works without a provider. Kept for compat. */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth(): AuthContextValue {
  const snapshot = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot,
  );

  return {
    user: snapshot.user,
    accessToken: snapshot.accessToken,
    isLoading: snapshot.isLoading,
    sessionExpired: snapshot.sessionExpired,
    login: authStore.login,
    logout: authStore.logout,
    register: authStore.register,
  };
}
