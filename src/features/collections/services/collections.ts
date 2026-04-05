import { api, type CollectionInfo, type CollectionWithItems } from '@/lib/api';

export type CollectionDetailRecord = CollectionWithItems & { userId?: string };

export interface CollectionUpsertInput {
  name: string;
  description?: string | null;
  isPublic: boolean;
}

export async function listCollections(): Promise<CollectionInfo[]> {
  const { collections } = await api.collections.list();
  return collections;
}

export async function getCollection(collectionId: string): Promise<CollectionDetailRecord> {
  const { collection } = await api.collections.get(collectionId);
  return collection as CollectionDetailRecord;
}

export async function createCollection(input: CollectionUpsertInput): Promise<CollectionInfo> {
  const { collection } = await api.collections.create({
    name: input.name,
    description: input.description ?? undefined,
    isPublic: input.isPublic,
  });
  return collection;
}

export async function updateCollection(
  collectionId: string,
  input: CollectionUpsertInput,
): Promise<CollectionInfo> {
  const { collection } = await api.collections.update(collectionId, {
    name: input.name,
    description: input.description ?? null,
    isPublic: input.isPublic,
  });
  return collection;
}

export async function deleteCollection(collectionId: string): Promise<void> {
  await api.collections.delete(collectionId);
}

export async function removeCollectionItem(collectionId: string, torrentId: string): Promise<void> {
  await api.collections.removeItem(collectionId, torrentId);
}
