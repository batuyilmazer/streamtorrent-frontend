import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  onMagnet: (uri: string) => void;
  loading: boolean;
}

const MAGNET_PREFIX = 'magnet:?xt=urn:btih:';

export function MagnetInput({ onMagnet, loading }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Magnet URI girin.');
      return;
    }
    if (!trimmed.startsWith(MAGNET_PREFIX)) {
      setError('Geçerli bir magnet URI değil (magnet:?xt=urn:btih: ile başlamalı).');
      return;
    }
    setError(null);
    onMagnet(trimmed);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="magnet:?xt=urn:btih:..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          className="font-mono text-sm"
        />
        <Button onClick={submit} disabled={loading || !value.trim()}>
          Ekle
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive px-1">{error}</p>
      )}
    </div>
  );
}
