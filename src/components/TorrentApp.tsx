import { useReducer, useCallback } from 'react';
import { api, type TorrentInfo } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { TorrentUploader } from './TorrentUploader';
import { MagnetInput } from './MagnetInput';
import { FilmBiraPizzaNavbar } from '@/components/layout/FilmBiraPizzaNavbar';
import { FilmPageStage } from '@/components/layout/FilmPageStage';

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
    <FilmPageStage>
      {/* Error toast */}
      {'error' in state && state.error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-black/85 text-white px-4 py-3 text-sm rounded max-w-sm w-full shadow-lg">
          <span className="flex-1">{state.error}</span>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
      )}

      <FilmBiraPizzaNavbar />

      <div className="absolute left-[38px] top-[171px] flex w-[313px] flex-col items-center gap-[33px]">
        <TorrentUploader onTorrent={handleUpload} loading={isLoading} />
        <p className="w-full text-center font-['Bahianita',sans-serif] text-[32px] leading-none text-white">
          veya Magnet Linki Yapıştırın:
        </p>
        <MagnetInput onMagnet={handleMagnet} loading={isLoading} />
      </div>

      <p className="absolute right-[55px] top-[141px] w-[192px] text-center font-['Bahianita',sans-serif] text-[48px] leading-none text-white">
        Upload A Torrent
      </p>

      <div className="absolute left-[418px] top-[190.5px] h-[486px] w-[810px]">
        <img
          src="/frames/stream-video-frame.svg"
          alt=""
          className="block h-full w-full"
          draggable={false}
        />
      </div>
    </FilmPageStage>
  );
}
