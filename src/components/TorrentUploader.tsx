import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  onTorrent: (file: File) => void;
  loading: boolean;
}

export function TorrentUploader({ onTorrent, loading }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.name.endsWith('.torrent')) {
      setError('Sadece .torrent dosyaları desteklenir.');
      return;
    }
    setError(null);
    onTorrent(file);
  }, [onTorrent]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  return (
    <div className="space-y-2 w-full max-w-[313px] mx-auto">
      {/* aspect ratio matches SVG viewBox 313:204 */}
      <div
        className={cn(
          'relative w-full cursor-pointer select-none transition-opacity duration-150',
          loading && 'pointer-events-none opacity-60',
          isDragOver && 'opacity-80',
        )}
        style={{ aspectRatio: '313 / 204' }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
      >
        {/* Figma SVG frame as background */}
        <img
          src="/frames/upload-box-frame.svg"
          alt=""
          className="absolute inset-0 w-full h-full"
          draggable={false}
        />

        {/* Content centred over the cream area */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full pb-4">
          {loading ? (
            <svg
              className="size-12 animate-spin text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <>
              <p className="font-['Bahianita',sans-serif] text-[80px] text-black leading-none">
                YÜKLE
              </p>
              <p className="font-['Bahianita',sans-serif] text-2xl text-[#505050]">
                .torrent
              </p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".torrent"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {error && (
        <p className="text-xs text-white/90 bg-black/25 px-2 py-1 rounded">{error}</p>
      )}
    </div>
  );
}
