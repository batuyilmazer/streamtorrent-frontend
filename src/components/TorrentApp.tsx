import { useReducer, useCallback } from 'react';
import { api, type TorrentInfo } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { TorrentUploader } from './TorrentUploader';
import { MagnetInput } from './MagnetInput';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

// --- State machine ---

type State =
  | { phase: 'upload'; error?: string }
  | { phase: 'loading' };

type Action =
  | { type: 'LOADING' }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { phase: 'loading' };
    case 'ERROR':
      return { phase: 'upload', error: action.message };
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

  const handleTorrent = useCallback((torrent: TorrentInfo) => {
    window.location.href = `/watch/${torrent.id}`;
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    dispatch({ type: 'LOADING' });
    try {
      const { torrent } = await api.torrents.upload(file);
      handleTorrent(torrent);
    } catch (err) {
      dispatch({ type: 'ERROR', message: getErrorMessage(err, 'Yükleme başarısız.') });
    }
  }, [handleTorrent]);

  const handleMagnet = useCallback(async (uri: string) => {
    dispatch({ type: 'LOADING' });
    try {
      const { torrent } = await api.torrents.magnet(uri);
      handleTorrent(torrent);
    } catch (err) {
      dispatch({ type: 'ERROR', message: getErrorMessage(err, 'Magnet eklenemedi.') });
    }
  }, [handleTorrent]);

  const isLoading = state.phase === 'loading';

  return (
    <div className="space-y-4">
      {'error' in state && state.error && (
        <ErrorBanner
          message={state.error}
          onDismiss={() => dispatch({ type: 'RESET' })}
        />
      )}

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
    </div>
  );
}
