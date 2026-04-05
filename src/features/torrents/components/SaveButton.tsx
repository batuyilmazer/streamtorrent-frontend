import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { showErrorToast } from '@/lib/toast';
import { isTorrentSaved, listSavedTorrents, removeTorrent, saveTorrent } from '@/features/torrents/services/torrents';

interface Props {
  torrentId: string;
}

export function SaveButton({ torrentId }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    listSavedTorrents()
      .then((items) => {
        if (cancelled) return;
        setSaved(isTorrentSaved(items, torrentId));
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [torrentId, user]);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      if (saved) {
        await removeTorrent(torrentId);
        setSaved(false);
      } else {
        await saveTorrent(torrentId);
        setSaved(true);
      }
    } catch (err) {
      showErrorToast(err, saved ? 'Torrent kaydı kaldırılamadı.' : 'Torrent kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  }, [saved, torrentId]);

  if (!user) {
    return (
      <a href="/login">
        <Button variant="outline" size="sm">Kaydet</Button>
      </a>
    );
  }

  if (!checked) return null;

  return (
    <Button
      variant={saved ? 'default' : 'outline'}
      size="sm"
      disabled={loading}
      onClick={toggle}
    >
      {loading ? '...' : saved ? 'Kaydedildi' : 'Kaydet'}
    </Button>
  );
}
