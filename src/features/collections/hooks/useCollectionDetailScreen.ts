import { useCallback, useEffect, useState } from 'react';
import type { CollectionInfo, MeUser } from '@/lib/api';
import { showErrorToast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/utils';
import {
  deleteCollection,
  getCollection,
  removeCollectionItem,
  type CollectionDetailRecord,
} from '@/features/collections/services/collections';

export function useCollectionDetailScreen(collectionId: string, user: MeUser | null, authLoading: boolean) {
  const [collection, setCollection] = useState<CollectionDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getCollection(collectionId);
      setCollection(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Koleksiyon bulunamadı.'));
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const isOwner = Boolean(user && collection && user.id === collection.userId);

  const removeItem = useCallback(async (torrentId: string) => {
    if (!collection) return;
    try {
      await removeCollectionItem(collection.id, torrentId);
      setCollection((prev) =>
        prev ? { ...prev, items: prev.items.filter((item) => item.torrentId !== torrentId) } : prev,
      );
    } catch (err) {
      showErrorToast(err, 'Torrent koleksiyondan kaldırılamadı.');
    }
  }, [collection]);

  const removeCurrentCollection = useCallback(async () => {
    if (!collection) return;
    if (!confirm('Bu koleksiyonu silmek istediğinize emin misiniz?')) return;

    try {
      await deleteCollection(collection.id);
      window.location.href = '/collections';
    } catch (err) {
      showErrorToast(err, 'Koleksiyon silinemedi.');
    }
  }, [collection]);

  const mergeCollection = useCallback((updated: CollectionInfo) => {
    setCollection((prev) => (prev ? { ...prev, ...updated } : prev));
  }, []);

  return {
    collection,
    loading,
    error,
    isOwner,
    removeItem,
    removeCurrentCollection,
    mergeCollection,
  };
}
