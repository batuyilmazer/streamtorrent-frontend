import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { TorrentInfo } from '@/lib/api';
import { formatBytes } from '@/lib/utils';

interface Props {
  torrent: TorrentInfo;
  onClick?: () => void;
}

export function TorrentCard({ torrent, onClick }: Props) {
  return (
    <Card
      className={onClick ? 'cursor-pointer hover:border-muted-foreground/50 transition-colors' : ''}
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="min-w-0 space-y-0.5">
          <p className="font-medium truncate text-sm">{torrent.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(Number(torrent.size))}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {torrent.fileList.length} dosya
        </Badge>
      </CardContent>
    </Card>
  );
}
