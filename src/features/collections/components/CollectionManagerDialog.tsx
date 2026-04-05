import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CollectionInfo } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { createCollection, updateCollection } from '@/features/collections/services/collections';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  collection?: CollectionInfo;
  onSuccess: (collection: CollectionInfo) => void;
}

export function CollectionManagerDialog({ open, onOpenChange, mode, collection, onSuccess }: Props) {
  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [isPublic, setIsPublic] = useState(collection?.isPublic ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(collection?.name ?? '');
    setDescription(collection?.description ?? '');
    setIsPublic(collection?.isPublic ?? false);
    setError('');
  }, [collection, open]);

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setLoading(true);
    setError('');

    try {
      const nextCollection =
        mode === 'create'
          ? await createCollection({
              name: trimmedName,
              description: description.trim() || undefined,
              isPublic,
            })
          : collection
            ? await updateCollection(collection.id, {
                name: trimmedName,
                description: description.trim() || null,
                isPublic,
              })
            : null;

      if (nextCollection) {
        onSuccess(nextCollection);
        onOpenChange(false);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Bir hata oluştu.'));
    } finally {
      setLoading(false);
    }
  }, [collection, description, isPublic, mode, name, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Yeni Koleksiyon' : 'Koleksiyonu Düzenle'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="col-name">Ad</Label>
            <Input
              id="col-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Koleksiyon adı"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-desc">Açıklama</Label>
            <Textarea
              id="col-desc"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="İsteğe bağlı açıklama"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="col-public">Herkese açık</Label>
            <Switch
              id="col-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
            {loading ? '...' : mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
