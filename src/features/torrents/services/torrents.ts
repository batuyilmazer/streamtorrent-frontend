import { api, buildStreamUrl, type StreamSession, type TorrentInfo, type UserTorrentEntry } from '@/lib/api';

export interface TorrentWatchData {
  torrent: TorrentInfo;
  session: StreamSession;
}

export async function uploadTorrentFile(file: File): Promise<TorrentInfo> {
  const { torrent } = await api.torrents.upload(file);
  return torrent;
}

export async function submitMagnetUri(uri: string): Promise<TorrentInfo> {
  const { torrent } = await api.torrents.magnet(uri);
  return torrent;
}

export async function loadTorrentWatchData(torrentId: string): Promise<TorrentWatchData> {
  const [{ torrent }, session] = await Promise.all([
    api.torrents.get(torrentId),
    api.torrents.stream(torrentId),
  ]);

  return { torrent, session };
}

export async function listSavedTorrents(): Promise<UserTorrentEntry[]> {
  const { userTorrents } = await api.userTorrents.list();
  return userTorrents;
}

export function isTorrentSaved(items: UserTorrentEntry[], torrentId: string): boolean {
  return items.some((entry) => entry.torrent.id === torrentId);
}

export async function saveTorrent(torrentId: string): Promise<void> {
  await api.userTorrents.save(torrentId);
}

export async function removeTorrent(torrentId: string): Promise<void> {
  await api.userTorrents.remove(torrentId);
}

export function createStreamUrl(streamToken: string, fileIndex: number): string {
  return buildStreamUrl(streamToken, fileIndex);
}
