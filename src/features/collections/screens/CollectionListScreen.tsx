import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CollectionManagerDialog } from '@/features/collections/components/CollectionManagerDialog';
import { useCollectionListScreen } from '@/features/collections/hooks/useCollectionListScreen';

export default function CollectionListScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { collections, loading, error, prependCollection } = useCollectionListScreen(user, authLoading);
  const [showCreate, setShowCreate] = useState(false);

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
          {collections.map((collection) => (
            <a key={collection.id} href={`/collections/${collection.id}`} className="block">
              <Card className="hover:border-muted-foreground/50 transition-colors cursor-pointer h-full">
                <CardContent className="py-4 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{collection.name}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {collection.isPublic && (
                        <Badge variant="secondary" className="text-xs">Herkese açık</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {collection._count?.items ?? 0} torrent
                      </Badge>
                    </div>
                  </div>
                  {collection.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{collection.description}</p>
                  )}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}

      <CollectionManagerDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        mode="create"
        onSuccess={prependCollection}
      />
    </div>
  );
}
