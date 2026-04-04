import { useState } from 'react';

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
    <div className="space-y-2 w-full">
      <div className="relative w-full max-w-[302px] mx-auto">
        <img
          src="/frames/magnet-url-frame.svg"
          alt=""
          className="block w-full h-auto"
          draggable={false}
        />
        <input
          type="text"
          placeholder="magnet:?xt=urn..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          className="absolute left-[12px] top-[6px] h-[41px] w-[237px] bg-transparent border-none p-0 outline-none font-['Bahianita',sans-serif] text-[26px] leading-none text-black placeholder:text-[#b8b8b8] disabled:opacity-50"
          style={{
            paddingLeft: 17,
            paddingRight: 20,
            paddingTop: 8,
          }}
        />
        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          className="absolute left-[253px] top-[7px] h-[44px] w-[40px] cursor-pointer transition-[filter] hover:brightness-90 disabled:opacity-40"
          aria-label="Ekle"
        />
      </div>

      {error && (
        <p className="text-xs text-white/90 bg-black/25 px-2 py-1 rounded">{error}</p>
      )}
    </div>
  );
}
