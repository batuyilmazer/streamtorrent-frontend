import type { MeUser, LoginRequest, RegisterRequest } from './api';
import { getErrorMessage } from './errors';
import {
  requestCurrentUser,
  requestLogin,
  requestLogout,
  requestRefresh,
  requestRegister,
} from './auth/transport';

interface AuthState {
  accessToken: string | null;
  user: MeUser | null;
  isLoading: boolean;
  sessionExpired: boolean;
}

type Listener = () => void;

let state: AuthState = { accessToken: null, user: null, isLoading: true, sessionExpired: false };
const SERVER_SNAPSHOT: AuthState = { accessToken: null, user: null, isLoading: true, sessionExpired: false };
const listeners = new Set<Listener>();
let refreshPromise: Promise<string | null> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let bootstrapped = false;
let channel: BroadcastChannel | null = null;

function notify() {
  for (const fn of listeners) fn();
}

function update(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  notify();
}

function parseJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function clearRefreshTimer() {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function scheduleRefresh(accessToken: string) {
  clearRefreshTimer();
  const expiresAt = parseJwtExp(accessToken);
  if (!expiresAt) return;
  const delay = Math.max(expiresAt - Date.now() - 60_000, 0);
  refreshTimer = setTimeout(() => void silentRefresh(), delay);
}

async function rawRefresh(): Promise<string | null> {
  return requestRefresh();
}

async function rawMe(accessToken: string): Promise<MeUser | null> {
  return requestCurrentUser(accessToken);
}

async function silentRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const hadUser = state.user !== null;
      const access = await rawRefresh();
      if (!access) {
        update({
          accessToken: null,
          user: null,
          isLoading: false,
          sessionExpired: hadUser,
        });
        return null;
      }
      const user = (await rawMe(access)) ?? state.user;
      update({ accessToken: access, user, isLoading: false, sessionExpired: false });
      scheduleRefresh(access);
      return access;
    } catch {
      const hadUser = state.user !== null;
      update({ accessToken: null, user: null, isLoading: false, sessionExpired: hadUser });
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function initChannel() {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    channel = new BroadcastChannel('st-auth');
    channel.onmessage = (event) => {
      const { type } = event.data ?? {};
      if (type === 'LOGOUT') {
        clearRefreshTimer();
        update({ accessToken: null, user: null, isLoading: false, sessionExpired: false });
      } else if (type === 'LOGIN') {
        void silentRefresh();
      }
    };
  } catch {
    /* unsupported */
  }
}

function broadcast(type: 'LOGIN' | 'LOGOUT') {
  try {
    channel?.postMessage({ type });
  } catch {
    /* ignore */
  }
}

function initVisibility() {
  if (typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (!state.accessToken) return;
    const exp = parseJwtExp(state.accessToken);
    if (!exp) return;
    if (exp - Date.now() < 2 * 60_000) {
      void silentRefresh();
    }
  });
}

function makeFallbackUser(id: string, email: string): MeUser {
  return {
    id,
    email,
    emailVerified: false,
    isSuspended: false,
    failedLoginCount: 0,
    lockUntil: null,
    lastLoginAt: null,
    passwordChangedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const authStore = {
  getSnapshot(): AuthState {
    return state;
  },

  getServerSnapshot(): AuthState {
    return SERVER_SNAPSHOT;
  },

  getAccessToken(): string | null {
    return state.accessToken;
  },

  getUser(): MeUser | null {
    return state.user;
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  async bootstrap(): Promise<void> {
    if (bootstrapped) return;
    bootstrapped = true;
    await silentRefresh();
  },

  async forceRefresh(): Promise<string | null> {
    return silentRefresh();
  },

  async login(payload: LoginRequest): Promise<void> {
    const data = await requestLogin(payload);
    const user = await rawMe(data.access);
    update({
      accessToken: data.access,
      user: user ?? makeFallbackUser(data.user.userId ?? data.user.id ?? '', data.user.email),
      isLoading: false,
      sessionExpired: false,
    });
    scheduleRefresh(data.access);
    broadcast('LOGIN');
  },

  async register(payload: RegisterRequest): Promise<void> {
    const data = await requestRegister(payload);
    const user = await rawMe(data.access);
    update({
      accessToken: data.access,
      user: user ?? makeFallbackUser(data.user.id ?? data.user.userId ?? '', data.user.email),
      isLoading: false,
      sessionExpired: false,
    });
    scheduleRefresh(data.access);
    broadcast('LOGIN');
  },

  async logout(): Promise<void> {
    let logoutError: Error | null = null;
    try {
      await requestLogout();
    } catch (err) {
      logoutError = err instanceof Error ? err : new Error(getErrorMessage(err, 'Çıkış yapılamadı.'));
    } finally {
      clearRefreshTimer();
      update({ accessToken: null, user: null, isLoading: false, sessionExpired: false });
      broadcast('LOGOUT');
    }
    if (logoutError) throw logoutError;
  },

  handleAuthFailure(): void {
    const hadUser = state.user !== null;
    clearRefreshTimer();
    update({ accessToken: null, user: null, isLoading: false, sessionExpired: hadUser });
  },

  clearSessionExpired(): void {
    if (state.sessionExpired) {
      update({ sessionExpired: false });
    }
  },
};

if (typeof window !== 'undefined') {
  initChannel();
  initVisibility();
  void authStore.bootstrap();
}
