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
      <div
        className={cn(
          'group relative w-full cursor-pointer select-none rounded-[20px] transform-gpu transition-[transform,filter,opacity] duration-300 ease-in-out hover:brightness-105 hover:drop-shadow-[0_12px_0_rgba(0,0,0,1)] active:translate-y-px',
          loading && 'pointer-events-none opacity-60',
          isDragOver && 'brightness-105 drop-shadow-[0_12px_0_rgba(0,0,0,1)]',
        )}
        style={{ aspectRatio: '313 / 204' }}
        data-node-id="72:52"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
      >
        <img
          src="/frames/upload-box-frame.svg"
          alt=""
          className="absolute inset-0 h-full w-full transition-[filter] duration-300 ease-in-out"
          draggable={false}
        />

        <div className="absolute left-[100px] top-[53px] z-10 flex w-[130px] flex-col items-center gap-[6px] text-center transition-transform duration-300 ease-in-out group-hover:scale-[1.03] group-active:translate-y-px">
          {loading ? (
            <svg
              className="mx-auto mt-8 size-12 animate-spin text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <>
              <p className="w-full font-['Bahianita',sans-serif] text-[96px] leading-[0.7] text-black transition-[text-shadow] duration-300 ease-in-out">
                YÜKLE
              </p>
              <p className="w-full font-['Bahianita',sans-serif] text-[24px] leading-none text-[#505050] transition-[text-shadow] duration-300 ease-in-out">
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
