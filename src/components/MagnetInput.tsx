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
      {/* SVG img drives the container height; input sits absolute inset-0 on top */}
      <div className="relative w-full max-w-[302px] mx-auto">
        <img
          src="/frames/magnet-url-frame.svg"
          alt=""
          className="block w-full h-auto"
          draggable={false}
        />
        {/* Input covers the entire frame bounding box.
            Padding keeps the text inside the visible cream area.
            Cream: left ~6%, right edge at ~82% (button starts at ~84%) */}
        <input
          type="text"
          placeholder="magnet:?xt=urn..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          className="absolute inset-0 ml-4 w-[78%] h-[90%] bg-transparent border-none outline-none font-['Bahianita',sans-serif] text-lg text-black placeholder:text-[#b8b8b8] disabled:opacity-50"
          style={{ paddingLeft: '6%', paddingRight: '20%' }}
        />
        {/* Transparent click target over the yellow button area (x 253–293 / 302) */}
        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          className="absolute inset-y-0 right-0 w-[18%] disabled:opacity-40 hover:brightness-90 transition-[filter] cursor-pointer"
          aria-label="Ekle"
        />
      </div>

      {error && (
        <p className="text-xs text-white/90 bg-black/25 px-2 py-1 rounded">{error}</p>
      )}
    </div>
  );
}
