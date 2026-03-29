const API_BASE = import.meta.env.PUBLIC_API_URL ?? '';

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.code ?? 'UNKNOWN',
      body.message ?? res.statusText,
    );
  }
  return res.json() as Promise<T>;
}

export interface FileEntry {
  index: number;
  name: string;
  size: number;
  path: string;
}

export interface TorrentInfo {
  id: string;
  name: string;
  size: number;
  fileList: FileEntry[];
}

export interface TorrentResponse {
  torrent: TorrentInfo;
}

export interface StreamSession {
  streamToken: string;
  files: FileEntry[];
}

export const api = {
  torrents: {
    upload(file: File): Promise<TorrentResponse> {
      const body = new FormData();
      body.append('torrentFile', file);
      return request<TorrentResponse>('/api/torrents/upload', {
        method: 'POST',
        body,
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
};

export function buildStreamUrl(streamToken: string, fileIndex: number): string {
  return `${API_BASE}/api/stream/${streamToken}/${fileIndex}`;
}
