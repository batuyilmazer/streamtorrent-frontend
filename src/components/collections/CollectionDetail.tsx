import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { api, type CollectionWithItems, type CollectionInfo } from '@/lib/api';
import { CollectionManager } from './CollectionManager';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatBytes, getErrorMessage } from '@/lib/utils';
import { showErrorToast } from '@/lib/toast';

interface Props {
  collectionId: string;
}

export default function CollectionDetail({ collectionId }: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const [collection, setCollection] = useState<CollectionWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const load = useCallback(async () => {
    try {
      const { collection: data } = await api.collections.get(collectionId);
      setCollection(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Koleksiyon bulunamadı.'));
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  const isOwner = !!(user && collection && user.id === (collection as any).userId);

  const handleRemoveItem = useCallback(async (torrentId: string) => {
    if (!collection) return;
    try {
      await api.collections.removeItem(collection.id, torrentId);
      setCollection((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.torrentId !== torrentId) } : prev,
      );
    } catch (err) {
      showErrorToast(err, 'Torrent koleksiyondan kaldırılamadı.');
    }
  }, [collection]);

  const handleDelete = useCallback(async () => {
    if (!collection) return;
    if (!confirm('Bu koleksiyonu silmek istediğinize emin misiniz?')) return;
    try {
      await api.collections.delete(collection.id);
      window.location.href = '/collections';
    } catch (err) {
      showErrorToast(err, 'Koleksiyon silinemedi.');
    }
  }, [collection]);

  const handleEdited = useCallback((updated: CollectionInfo) => {
    setCollection((prev) => prev ? { ...prev, ...updated } : prev);
  }, []);

  if (loading || authLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-8">
        <LoadingSpinner className="size-4" />
        Yükleniyor...
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="space-y-4 pt-8">
        <p className="text-sm text-destructive">{error || 'Koleksiyon bulunamadı.'}</p>
        <Button variant="outline" size="sm" onClick={() => history.back()}>
          ← Geri dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight truncate">{collection.name}</h1>
            {collection.isPublic && (
              <Badge variant="secondary">Herkese açık</Badge>
            )}
          </div>
          {collection.description && (
            <p className="text-sm text-muted-foreground">{collection.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {collection.items.length} torrent
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOwner && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
                Düzenle
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                Sil
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => history.back()}>
            ← Geri
          </Button>
        </div>
      </div>

      {collection.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bu koleksiyonda henüz torrent yok.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {collection.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <a href={`/watch/${item.torrent.id}`} className="flex-1 min-w-0 block">
                <Card className="hover:border-muted-foreground/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-medium truncate text-sm">{item.torrent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(Number(item.torrent.size) || 0)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {item.torrent.fileList.length} dosya
                    </Badge>
                  </CardContent>
                </Card>
              </a>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveItem(item.torrentId)}
                >
                  Kaldır
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {isOwner && collection && (
        <CollectionManager
          open={showEdit}
          onOpenChange={setShowEdit}
          mode="edit"
          collection={collection}
          onSuccess={handleEdited}
        />
      )}
    </div>
  );
}
