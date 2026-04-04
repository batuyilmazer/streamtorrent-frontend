import { useReducer, useCallback } from 'react';
import { api, type TorrentInfo } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { TorrentUploader } from './TorrentUploader';
import { MagnetInput } from './MagnetInput';

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
    <div className="relative min-h-screen bg-[#eb3321] overflow-hidden">
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

      {/* Navbar */}
      <nav className="relative flex items-center px-12 h-[78px]">
        <button className="flex flex-col gap-[7px] shrink-0" aria-label="Menü">
          <span className="block w-7 h-[3px] bg-white" />
          <span className="block w-7 h-[3px] bg-white" />
          <span className="block w-7 h-[3px] bg-white" />
        </button>
        <h1
          className="absolute left-1/2 -translate-x-1/2 font-['Bahianita',sans-serif] text-5xl text-[#f7f2e5] whitespace-nowrap pointer-events-none select-none tracking-[-0.02em]"
          style={{
            textShadow: [
              '2px 8px 0 #000', '-2px 8px 0 #000',
              '0 10px 0 #000',  '0 6px 0 #000',
              '2px 10px 0 #000', '-2px 10px 0 #000',
              '2px 6px 0 #000',  '-2px 6px 0 #000',
              '2px 0 0 #000',   '-2px 0 0 #000',
              '0 2px 0 #000',   '0 -2px 0 #000',
              '2px 2px 0 #000',  '-2px 2px 0 #000',
              '2px -2px 0 #000', '-2px -2px 0 #000',
              '0px 8px 0 #000',
            ].join(', '),
          }}
        >
          film.bira.pizza
        </h1>
      </nav>

      {/* Main layout — 30 / 70 columns (fr splits space after gap); upload block toward center, video toward center */}
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-start gap-10 px-10 pt-16 pb-10 lg:grid-cols-[3fr_7fr]">
        {/* Left: upload controls (~30%) */}
        <div className="flex w-full min-w-0 justify-center lg:justify-end">
          <div className="flex w-full max-w-[313px] shrink-0 flex-col items-center gap-8">
            <TorrentUploader onTorrent={handleUpload} loading={isLoading} />
            <p className="w-full text-center font-['Bahianita',sans-serif] text-[28px] leading-tight text-white">
              veya Magnet Linki Yapıştırın:
            </p>
            <MagnetInput onMagnet={handleMagnet} loading={isLoading} />
          </div>
        </div>

        <div className="hidden min-w-0 flex-col items-start pt-0 -mt-10 lg:flex">
          <p className="mb-0 w-max max-w-full text-left font-['Bahianita',sans-serif] text-[40px] text-white">
            Henüz bir torrent yüklemedin.
          </p>
          <div className="w-full min-w-0">
            <img
              src="/frames/stream-video-frame.svg"
              alt=""
              className="block h-auto w-[min(100%,810px)] min-w-[min(100%,380px)] min-h-[228px] max-h-[calc(90vh-220px)] max-w-none object-contain object-left"
              width={810}
              height={486}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
