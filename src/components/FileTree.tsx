import { formatBytes, isVideoFile, cn } from '@/lib/utils';
import type { FileEntry } from '@/lib/api';

interface Props {
  files: FileEntry[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  className?: string;
}

function getExtension(filename: string): string {
  if (!filename) return '?';
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '?';
}

export function FileTree({ files, selectedIndex, onSelect, className }: Props) {
  return (
    <ul className={cn('space-y-1.5', className)}>
      {files.map((file) => {
        const displayName = file.name || file.path?.split('/').pop() || 'unknown';
        const ext = getExtension(displayName);
        const isVideo = isVideoFile(displayName);
        const isSelected = file.index === selectedIndex;

        return (
          <li key={file.index}>
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left font-['Bahianita',sans-serif] text-[20px] leading-none transition-colors",
                isSelected
                  ? 'bg-black text-[#f7f2e5]'
                  : 'text-black hover:bg-black/10',
                !isVideo && 'cursor-not-allowed opacity-45',
              )}
              title={file.path || file.name}
              onClick={() => isVideo && onSelect(file.index)}
              disabled={!isVideo}
            >
              <span className="truncate flex-1">{displayName}</span>
              <span className={cn('shrink-0 text-[13px] text-[#505050]', isSelected && 'text-[#f7f2e5]/70')}>
                {formatBytes(file.size, 0)}
              </span>
              <span
                className={cn(
                  'shrink-0 border border-black px-1 py-0 text-[10px] uppercase leading-none text-black',
                  isSelected && 'border-[#f7f2e5] text-[#f7f2e5]',
                )}
              >
                {ext}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
