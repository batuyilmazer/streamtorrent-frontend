import { api, type UserTorrentEntry } from '@/lib/api';

export async function listLibraryItems(): Promise<UserTorrentEntry[]> {
  const { userTorrents } = await api.userTorrents.list();
  return userTorrents;
}

export async function removeLibraryItem(torrentId: string): Promise<void> {
  await api.userTorrents.remove(torrentId);
}
