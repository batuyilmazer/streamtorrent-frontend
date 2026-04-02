import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Props {
  torrentId: string;
}

export function SaveButton({ torrentId }: Props) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    api.userTorrents.list().then(({ userTorrents }) => {
      if (cancelled) return;
      setIsSaved(userTorrents.some((ut) => ut.torrent.id === torrentId));
      setChecked(true);
    }).catch(() => {
      if (!cancelled) setChecked(true);
    });

    return () => { cancelled = true; };
  }, [user, torrentId]);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      if (isSaved) {
        await api.userTorrents.remove(torrentId);
        setIsSaved(false);
      } else {
        await api.userTorrents.save(torrentId);
        setIsSaved(true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [torrentId, isSaved]);

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
      variant={isSaved ? 'default' : 'outline'}
      size="sm"
      disabled={loading}
      onClick={toggle}
    >
      {loading ? '...' : isSaved ? 'Kaydedildi' : 'Kaydet'}
    </Button>
  );
}
