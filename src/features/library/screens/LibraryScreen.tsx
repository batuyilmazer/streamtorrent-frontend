import { useAuth } from '@/components/auth/AuthProvider';
import { buttonVariants, Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TorrentCard } from '@/features/torrents/components/TorrentCard';
import { useLibraryScreen } from '@/features/library/hooks/useLibraryScreen';

export default function LibraryScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { items, loading, error, removeItem } = useLibraryScreen(user, authLoading);

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
                onClick={() => removeItem(item.torrent.id)}
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
