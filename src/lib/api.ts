import { authStore } from './authStore';

const fallbackApiBase = import.meta.env.PROD
  ? 'https://api.film.bira.pizza'
  : 'http://localhost:8080';

const API_BASE = (import.meta.env.PUBLIC_API_URL ?? fallbackApiBase)
  .split(',')
  .map((value) => value.trim())
  .find(Boolean) ?? fallbackApiBase;

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export { API_BASE };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  const token = authStore.getAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;
  let res = await fetch(url, { ...init, credentials: 'include', headers });

  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    if (body.error === 'TOKEN_EXPIRED') {
      const newToken = await authStore.forceRefresh();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(url, { ...init, credentials: 'include', headers });
        if (res.ok) return res.json() as Promise<T>;
        const retryBody = await res.json().catch(() => ({}));
        throw new ApiError(
          res.status,
          retryBody.error ?? 'UNKNOWN',
          retryBody.message ?? res.statusText,
        );
      }
    }
    throw new ApiError(401, body.error ?? 'UNKNOWN', body.message ?? res.statusText);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error ?? 'UNKNOWN',
      body.message ?? res.statusText,
    );
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileEntry {
  index: number;
  name: string;
  size: number;
  path: string;
}

export interface TorrentInfo {
  id: string;
  name: string;
  size: string;
  fileList: FileEntry[];
}

export interface TorrentResponse {
  torrent: TorrentInfo;
}

export interface StreamSession {
  streamToken: string;
  files: FileEntry[];
}

export interface UserTorrentEntry {
  id: string;
  torrentId: string;
  savedAt: string;
  torrent: TorrentInfo;
}

export interface CollectionInfo {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
}

export interface CollectionWithItems extends CollectionInfo {
  items: { id: string; torrentId: string; addedAt: string; torrent: TorrentInfo }[];
}

export interface CollectionItem {
  id: string;
  torrentId: string;
  addedAt: string;
  torrent: TorrentInfo;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface ApiMessageResponse {
  msg: string;
}

export interface MeUser {
  id: string;
  email: string;
  emailVerified: boolean;
  isSuspended: boolean;
  failedLoginCount: number;
  lockUntil: string | null;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeSession {
  id: string;
  userId: string;
  jti: string;
  userAgent: string | null;
  ip: string | null;
  deviceId: string;
  revoked: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface MeResponse {
  user: MeUser;
  sessions: MeSession[];
}

export type TwoFactorScope = 'verify-email' | 'reset-password';

export interface SendTwoFactorRequest {
  scope: TwoFactorScope;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ---------------------------------------------------------------------------
// API methods — Bearer is auto-attached by the interceptor above.
// Login / register / logout / refresh are handled by authStore.
// ---------------------------------------------------------------------------

export const api = {
  auth: {
    me(): Promise<MeResponse> {
      return request<MeResponse>('/me');
    },

    sendTwoFactor(payload: SendTwoFactorRequest): Promise<ApiMessageResponse> {
      return request<ApiMessageResponse>('/auth/2fa', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
    },

    verifyEmail(payload: VerifyEmailRequest): Promise<ApiMessageResponse> {
      return request<ApiMessageResponse>('/auth/verify-email', {
        method: 'POST',
        headers: { 'x-2fa-token': payload.token },
      });
    },

    resetPassword(payload: ResetPasswordRequest): Promise<ApiMessageResponse> {
      return request<ApiMessageResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword: payload.newPassword }),
        headers: {
          'x-2fa-token': payload.token,
          'Content-Type': 'application/json',
        },
      });
    },
  },

  torrents: {
    upload(file: File): Promise<TorrentResponse> {
      return request<TorrentResponse>('/api/torrents/upload', {
        method: 'POST',
        body: file,
        headers: { 'Content-Type': 'application/octet-stream' },
      });
    },

    magnet(uri: string): Promise<TorrentResponse> {
      return request<TorrentResponse>('/api/torrents/magnet', {
        method: 'POST',
        body: JSON.stringify({ magnetUri: uri }),
        headers: { 'Content-Type': 'application/json' },
      });
    },

    get(id: string): Promise<TorrentResponse> {
      return request<TorrentResponse>(`/api/torrents/${id}`);
    },

    stream(id: string): Promise<StreamSession> {
      return request<StreamSession>(`/api/torrents/${id}/stream`);
    },
  },

  userTorrents: {
    save(torrentId: string): Promise<{ userTorrent: UserTorrentEntry }> {
      return request(`/api/user-torrents/${torrentId}`, { method: 'POST' });
    },

    remove(torrentId: string): Promise<ApiMessageResponse> {
      return request(`/api/user-torrents/${torrentId}`, { method: 'DELETE' });
    },

    list(): Promise<{ userTorrents: UserTorrentEntry[] }> {
      return request(`/api/user-torrents`);
    },
  },

  collections: {
    create(
      data: { name: string; description?: string; isPublic?: boolean },
    ): Promise<{ collection: CollectionInfo }> {
      return request(`/api/collections`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },

    list(): Promise<{ collections: CollectionInfo[] }> {
      return request(`/api/collections`);
    },

    get(id: string): Promise<{ collection: CollectionWithItems }> {
      return request(`/api/collections/${id}`);
    },

    update(
      id: string,
      data: { name?: string; description?: string | null; isPublic?: boolean },
    ): Promise<{ collection: CollectionInfo }> {
      return request(`/api/collections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },

    delete(id: string): Promise<ApiMessageResponse> {
      return request(`/api/collections/${id}`, { method: 'DELETE' });
    },

    addItem(
      collectionId: string,
      torrentId: string,
    ): Promise<{ item: CollectionItem }> {
      return request(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        body: JSON.stringify({ torrentId }),
        headers: { 'Content-Type': 'application/json' },
      });
    },

    removeItem(
      collectionId: string,
      torrentId: string,
    ): Promise<ApiMessageResponse> {
      return request(`/api/collections/${collectionId}/items/${torrentId}`, {
        method: 'DELETE',
      });
    },
  },
};

export function buildStreamUrl(streamToken: string, fileIndex: number): string {
  return `${API_BASE}/api/stream/${streamToken}/${fileIndex}`;
}
