import { Badge } from '@/components/ui/badge';
import { formatBytes } from '@/lib/utils';
import type { FileEntry } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Props {
  files: FileEntry[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '?';
}

const VIDEO_EXTS = new Set(['mp4', 'webm', 'mkv', 'avi', 'mov', 'ts', 'm4v']);

export function FileTree({ files, selectedIndex, onSelect }: Props) {
  return (
    <ul className="space-y-0.5">
      {files.map((file) => {
        const ext = getExtension(file.name);
        const isVideo = VIDEO_EXTS.has(ext);
        const isSelected = file.index === selectedIndex;

        return (
          <li key={file.index}>
            <button
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm',
                isSelected
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted text-foreground',
                !isVideo && 'opacity-50 cursor-not-allowed',
              )}
              title={file.path || file.name}
              onClick={() => isVideo && onSelect(file.index)}
              disabled={!isVideo}
            >
              <span className="truncate flex-1 font-medium">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
              <Badge
                variant={isSelected ? 'default' : 'secondary'}
                className="shrink-0 text-xs uppercase"
              >
                {ext}
              </Badge>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
