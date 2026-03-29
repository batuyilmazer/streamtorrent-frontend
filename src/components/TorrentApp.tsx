import { useReducer, useCallback } from 'react';
import { api, buildStreamUrl, type TorrentInfo, type StreamSession } from '@/lib/api';
import { TorrentUploader } from './TorrentUploader';
import { MagnetInput } from './MagnetInput';
import { FileTree } from './FileTree';
import { VideoPlayer } from './VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';

// --- State machine ---

type State =
  | { phase: 'upload'; error?: string }
  | { phase: 'loading'; error?: string }
  | { phase: 'info'; torrent: TorrentInfo; session: StreamSession | null; error?: string }
  | { phase: 'watch'; torrent: TorrentInfo; session: StreamSession; selectedFileIndex: number; error?: string };

type Action =
  | { type: 'LOADING' }
  | { type: 'TORRENT_LOADED'; torrent: TorrentInfo }
  | { type: 'STREAM_READY'; session: StreamSession }
  | { type: 'SELECT_FILE'; index: number }
  | { type: 'ERROR'; message: string }
  | { type: 'DISMISS_ERROR' }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { phase: 'loading' };
    case 'TORRENT_LOADED':
      return { phase: 'info', torrent: action.torrent, session: null };
    case 'STREAM_READY': {
      if (state.phase !== 'info') return state;
      const firstVideoIndex = action.session.files.findIndex(f =>
        /\.(mp4|webm|mkv|avi|mov|ts|m4v)$/i.test(f.name)
      );
      return {
        phase: 'watch',
        torrent: state.torrent,
        session: action.session,
        selectedFileIndex: firstVideoIndex >= 0 ? firstVideoIndex : 0,
      };
    }
    case 'SELECT_FILE':
      if (state.phase !== 'watch') return state;
      return { ...state, selectedFileIndex: action.index };
    case 'ERROR':
      return { ...state, error: action.message } as State;
    case 'DISMISS_ERROR':
      return { ...state, error: undefined } as State;
    case 'RESET':
      return { phase: 'upload' };
    default:
      return state;
  }
}

// --- Error banner ---

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Kapat"
      >
        ✕
      </button>
    </div>
  );
}

// --- Main app ---

export default function TorrentApp() {
  const [state, dispatch] = useReducer(reducer, { phase: 'upload' });

  const handleTorrent = useCallback(async (torrent: TorrentInfo) => {
    dispatch({ type: 'TORRENT_LOADED', torrent });
    try {
      const session = await api.torrents.stream(torrent.id);
      dispatch({ type: 'STREAM_READY', session });
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Stream başlatılamadı.' });
    }
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    dispatch({ type: 'LOADING' });
    try {
      const { torrent } = await api.torrents.upload(file);
      await handleTorrent(torrent);
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Yükleme başarısız.' });
      dispatch({ type: 'RESET' });
    }
  }, [handleTorrent]);

  const handleMagnet = useCallback(async (uri: string) => {
    dispatch({ type: 'LOADING' });
    try {
      const { torrent } = await api.torrents.magnet(uri);
      await handleTorrent(torrent);
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Magnet eklenemedi.' });
      dispatch({ type: 'RESET' });
    }
  }, [handleTorrent]);

  const isLoading = state.phase === 'loading';

  return (
    <div className="space-y-4">
      {state.error && (
        <ErrorBanner
          message={state.error}
          onDismiss={() => dispatch({ type: 'DISMISS_ERROR' })}
        />
      )}

      {/* UPLOAD PHASE */}
      {(state.phase === 'upload' || state.phase === 'loading') && (
        <div className="mx-auto max-w-lg space-y-4 pt-8">
          <div className="text-center space-y-1 mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Torrent Yükle</h1>
            <p className="text-sm text-muted-foreground">
              .torrent dosyası yükleyin veya magnet linki yapıştırın
            </p>
          </div>

          <TorrentUploader onTorrent={handleUpload} loading={isLoading} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">veya</span>
            </div>
          </div>

          <MagnetInput onMagnet={handleMagnet} loading={isLoading} />
        </div>
      )}

      {/* INFO PHASE (stream token loading) */}
      {state.phase === 'info' && (
        <div className="mx-auto max-w-xl space-y-4 pt-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base leading-snug">{state.torrent.name}</CardTitle>
                <Badge variant="secondary" className="shrink-0">
                  {state.torrent.fileList.length} dosya
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{formatBytes(state.torrent.size)}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Stream hazırlanıyor...
              </div>
              <FileTree
                files={state.torrent.fileList}
                selectedIndex={null}
                onSelect={() => {}}
              />
            </CardContent>
          </Card>
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'RESET' })}>
            ← Geri dön
          </Button>
        </div>
      )}

      {/* WATCH PHASE */}
      {state.phase === 'watch' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="font-medium truncate">{state.torrent.name}</h2>
              <p className="text-xs text-muted-foreground">{formatBytes(state.torrent.size)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'RESET' })}>
              ← Yeni torrent
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
            <VideoPlayer
              src={buildStreamUrl(
                state.session.streamToken,
                state.selectedFileIndex,
              )}
              title={
                state.session.files.find(f => f.index === state.selectedFileIndex)?.name ?? ''
              }
            />

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
      )}
    </div>
  );
}
