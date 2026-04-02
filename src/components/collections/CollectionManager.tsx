import { useState, useCallback } from 'react';
import { api, type CollectionInfo } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  collection?: CollectionInfo;
  onSuccess: (collection: CollectionInfo) => void;
}

export function CollectionManager({ open, onOpenChange, mode, collection, onSuccess }: Props) {
  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [isPublic, setIsPublic] = useState(collection?.isPublic ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      if (mode === 'create') {
        const { collection: created } = await api.collections.create({
          name: name.trim(),
          description: description.trim() || undefined,
          isPublic,
        });
        onSuccess(created);
      } else if (collection) {
        const { collection: updated } = await api.collections.update(collection.id, {
          name: name.trim(),
          description: description.trim() || null,
          isPublic,
        });
        onSuccess(updated);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [name, description, isPublic, mode, collection, onSuccess, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Yeni Koleksiyon' : 'Koleksiyonu Düzenle'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="col-name">Ad</Label>
            <Input
              id="col-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Koleksiyon adı"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-desc">Açıklama</Label>
            <Textarea
              id="col-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
