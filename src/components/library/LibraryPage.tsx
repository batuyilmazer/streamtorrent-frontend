import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { api, type UserTorrentEntry } from '@/lib/api';
import { TorrentCard } from '@/components/TorrentCard';
import { Button, buttonVariants } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/lib/utils';

export default function LibraryPage() {
  const { user, isLoading: authLoading } = useAuth();
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
    api.userTorrents.list().then(({ userTorrents }) => {
      if (!cancelled) setItems(userTorrents);
    }).catch((err) => {
      if (!cancelled) setError(getErrorMessage(err, 'Yüklenemedi.'));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [user, authLoading]);

  const handleRemove = useCallback(async (torrentId: string) => {
    try {
      await api.userTorrents.remove(torrentId);
      setItems((prev) => prev.filter((i) => i.torrent.id !== torrentId));
    } catch {
      // silent
    }
  }, []);

  if (authLoading || (!user && !error)) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-8">
        <LoadingSpinner className="size-4" />
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Kütüphanem</h1>
        <a href="/collections" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Koleksiyonlarım
        </a>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="text-sm text-muted-foreground">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">Henüz kaydettiğiniz torrent yok.</p>
          <a href="/" className={buttonVariants({ variant: 'default' })}>
            Torrent Yükle
          </a>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <TorrentCard
                  torrent={item.torrent}
                  onClick={() => (window.location.href = `/watch/${item.torrent.id}`)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleRemove(item.torrent.id)}
              >
                Kaldır
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
