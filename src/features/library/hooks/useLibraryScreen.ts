import { useCallback, useEffect, useState } from 'react';
import type { MeUser, UserTorrentEntry } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { showErrorToast } from '@/lib/toast';
import { listLibraryItems, removeLibraryItem } from '@/features/library/services/library';

export function useLibraryScreen(user: MeUser | null, authLoading: boolean) {
  const [items, setItems] = useState<UserTorrentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    let cancelled = false;
    listLibraryItems()
      .then((entries) => {
        if (!cancelled) setItems(entries);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Yüklenemedi.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const removeItem = useCallback(async (torrentId: string) => {
    try {
      await removeLibraryItem(torrentId);
      setItems((prev) => prev.filter((item) => item.torrent.id !== torrentId));
    } catch (err) {
      showErrorToast(err, 'Torrent kütüphaneden kaldırılamadı.');
    }
  }, []);

  return {
    items,
    loading,
    error,
    removeItem,
  };
}
