import { useCallback, useEffect, useState } from 'react';
import type { CollectionInfo, MeUser } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { listCollections } from '@/features/collections/services/collections';

export function useCollectionListScreen(user: MeUser | null, authLoading: boolean) {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    let cancelled = false;
    listCollections()
      .then((items) => {
        if (!cancelled) setCollections(items);
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

  const prependCollection = useCallback((collection: CollectionInfo) => {
    setCollections((prev) => [collection, ...prev]);
  }, []);

  return {
    collections,
    loading,
    error,
    prependCollection,
  };
}
