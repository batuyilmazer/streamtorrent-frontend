import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { api, type CollectionInfo } from '@/lib/api';
import { CollectionManager } from './CollectionManager';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/lib/utils';

export default function CollectionList() {
  const { user, isLoading: authLoading } = useAuth();
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    let cancelled = false;
    api.collections.list().then(({ collections: data }) => {
      if (!cancelled) setCollections(data);
    }).catch((err) => {
      if (!cancelled) setError(getErrorMessage(err, 'Yüklenemedi.'));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [user, authLoading]);

  const handleCreated = useCallback((collection: CollectionInfo) => {
    setCollections((prev) => [collection, ...prev]);
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
        <h1 className="text-2xl font-semibold tracking-tight">Koleksiyonlarım</h1>
        <div className="flex items-center gap-2">
          <a href="/library" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            ← Kütüphane
          </a>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            Yeni Koleksiyon
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="text-sm text-muted-foreground">Yükleniyor...</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">Henüz koleksiyonunuz yok.</p>
          <Button onClick={() => setShowCreate(true)}>
            İlk Koleksiyonunuzu Oluşturun
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {collections.map((col) => (
            <a key={col.id} href={`/collections/${col.id}`} className="block">
              <Card className="hover:border-muted-foreground/50 transition-colors cursor-pointer h-full">
                <CardContent className="py-4 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{col.name}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {col.isPublic && (
                        <Badge variant="secondary" className="text-xs">Herkese açık</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {col._count?.items ?? 0} torrent
                      </Badge>
                    </div>
                  </div>
                  {col.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{col.description}</p>
                  )}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}

      <CollectionManager
        open={showCreate}
        onOpenChange={setShowCreate}
        mode="create"
        onSuccess={handleCreated}
      />
    </div>
  );
}
