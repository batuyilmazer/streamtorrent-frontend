import { useEffect, useReducer } from 'react';
import { api, buildStreamUrl, type TorrentInfo, type StreamSession } from '@/lib/api';
import { VideoPlayer } from './VideoPlayer';
import { FileTree } from './FileTree';
import { SaveButton } from './torrents/SaveButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatBytes, isVideoFile, getErrorMessage } from '@/lib/utils';

type State =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'watch'; torrent: TorrentInfo; session: StreamSession; selectedFileIndex: number };

type Action =
  | { type: 'READY'; torrent: TorrentInfo; session: StreamSession }
  | { type: 'ERROR'; message: string }
  | { type: 'SELECT_FILE'; index: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'READY': {
      const firstVideoIndex = action.session.files.findIndex(f => isVideoFile(f.name));
      return {
        phase: 'watch',
        torrent: action.torrent,
        session: action.session,
        selectedFileIndex: firstVideoIndex >= 0 ? firstVideoIndex : 0,
      };
    }
    case 'ERROR':
      return { phase: 'error', message: action.message };
    case 'SELECT_FILE':
      if (state.phase !== 'watch') return state;
      return { ...state, selectedFileIndex: action.index };
    default:
      return state;
  }
}

interface Props {
  torrentId: string;
}

export default function WatchPage({ torrentId }: Props) {
  const [state, dispatch] = useReducer(reducer, { phase: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [{ torrent }, session] = await Promise.all([
          api.torrents.get(torrentId),
          api.torrents.stream(torrentId),
        ]);
        if (!cancelled) dispatch({ type: 'READY', torrent, session });
      } catch (err) {
        if (!cancelled)
          dispatch({ type: 'ERROR', message: getErrorMessage(err, 'Yüklenemedi.') });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [torrentId]);

  if (state.phase === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-8">
        <LoadingSpinner className="size-4" />
        Yükleniyor...
      </div>
    );
  }

  if (state.phase === 'error') {
    return (
      <div className="space-y-4 pt-8">
        <p className="text-sm text-destructive">{state.message}</p>
        <Button variant="outline" size="sm" onClick={() => history.back()}>
          ← Geri dön
        </Button>
      </div>
    );
  }

  const selectedFile = state.session.files.find(f => f.index === state.selectedFileIndex);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="font-medium truncate">{state.torrent.name}</h1>
          <p className="text-xs text-muted-foreground">{formatBytes(Number(state.torrent.size) || 0)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SaveButton torrentId={torrentId} />
          <Button variant="ghost" size="sm" onClick={() => (window.location.href = '/')}>
            ← Ana sayfa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
        {selectedFile ? (
          <VideoPlayer
            src={buildStreamUrl(state.session.streamToken, state.selectedFileIndex)}
            title={selectedFile.name}
          />
        ) : (
          <div className="aspect-video bg-black flex items-center justify-center text-sm text-muted-foreground rounded-md">
            Oynatılabilir dosya bulunamadı.
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
              Dosyalar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <FileTree
              files={state.session.files}
              selectedIndex={state.selectedFileIndex}
              onSelect={(index) => dispatch({ type: 'SELECT_FILE', index })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
