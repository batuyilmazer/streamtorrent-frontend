import { useCallback, useReducer } from 'react';
import { FilmBiraPizzaNavbar } from '@/components/layout/FilmBiraPizzaNavbar';
import { FilmPageStage } from '@/components/layout/FilmPageStage';
import { MagnetInput } from '@/features/torrents/components/MagnetInput';
import { TorrentUploader } from '@/features/torrents/components/TorrentUploader';
import { submitMagnetUri, uploadTorrentFile } from '@/features/torrents/services/torrents';
import { getErrorMessage } from '@/lib/utils';
import type { TorrentInfo } from '@/lib/api';

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

export default function TorrentLandingScreen() {
  const [state, dispatch] = useReducer(reducer, { phase: 'upload' });

  const navigateToTorrent = useCallback((torrent: TorrentInfo) => {
    window.location.href = `/watch/${torrent.id}`;
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      dispatch({ type: 'LOADING' });
      try {
        const torrent = await uploadTorrentFile(file);
        navigateToTorrent(torrent);
      } catch (err) {
        dispatch({ type: 'ERROR', message: getErrorMessage(err, 'Yükleme başarısız.') });
      }
    },
    [navigateToTorrent],
  );

  const handleMagnet = useCallback(
    async (uri: string) => {
      dispatch({ type: 'LOADING' });
      try {
        const torrent = await submitMagnetUri(uri);
        navigateToTorrent(torrent);
      } catch (err) {
        dispatch({ type: 'ERROR', message: getErrorMessage(err, 'Magnet eklenemedi.') });
      }
    },
    [navigateToTorrent],
  );

  const isLoading = state.phase === 'loading';

  return (
    <FilmPageStage>
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

      <div className="flex flex-1 flex-col gap-8 px-4 pb-10 pt-4 sm:px-8 lg:flex-row lg:items-start lg:gap-10 lg:px-[38px] lg:pt-[60px]">
        <div className="flex w-full max-w-[313px] flex-col items-center gap-6 self-center sm:gap-[33px] lg:self-auto">
          <TorrentUploader onTorrent={handleUpload} loading={isLoading} />
          <p className="w-full text-center font-['Bahianita',sans-serif] text-[26px] leading-none text-white sm:text-[32px]">
            veya Magnet Linki Yapıştırın:
          </p>
          <MagnetInput onMagnet={handleMagnet} loading={isLoading} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-6 lg:items-stretch">
          <p className="w-full text-center font-['Bahianita',sans-serif] text-[32px] leading-none text-white sm:text-[40px] lg:text-[48px]">
            Henüz bir torrent yüklemedin
          </p>
          <div className="aspect-[810/486] w-full max-w-[810px] self-center">
            <img
              src="/frames/stream-video-frame.svg"
              alt=""
              className="block h-full w-full"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </FilmPageStage>
  );
}
