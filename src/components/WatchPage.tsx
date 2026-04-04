import { useEffect, useReducer, useRef, useState, useCallback } from 'react';
import { api, buildStreamUrl, type TorrentInfo, type StreamSession } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { FileTree } from './FileTree';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { isVideoFile, getErrorMessage } from '@/lib/utils';
import { FilmBiraPizzaNavbar } from '@/components/layout/FilmBiraPizzaNavbar';
import { FilmPageStage } from '@/components/layout/FilmPageStage';
import { showErrorToast } from '@/lib/toast';

// --- State machine ---

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

// --- Component ---

interface Props {
  torrentId: string;
}

export default function WatchPage({ torrentId }: Props) {
  const [state, dispatch] = useReducer(reducer, { phase: 'loading' });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Save state
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Load torrent + stream session
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

  // Check saved state
  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }
    if (state.phase !== 'watch' || !user) return;
    let cancelled = false;
    api.userTorrents.list().then(({ userTorrents }) => {
      if (cancelled) return;
      setIsSaved(userTorrents.some((ut) => ut.torrent.id === torrentId));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [state.phase, user, torrentId]);

  // Auto-play when stream URL changes
  const streamUrl = state.phase === 'watch'
    ? buildStreamUrl(state.session.streamToken, state.selectedFileIndex)
    : '';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;
    video.load();
    video.play().catch(() => {});
  }, [streamUrl]);

  const toggle = useCallback(async () => {
    if (state.phase !== 'watch') return;
    setSaveLoading(true);
    try {
      if (isSaved) {
        await api.userTorrents.remove(torrentId);
        setIsSaved(false);
      } else {
        await api.userTorrents.save(torrentId);
        setIsSaved(true);
      }
    } catch (err) {
      showErrorToast(err, isSaved ? 'Torrent kütüphaneden kaldırılamadı.' : 'Torrent kaydedilemedi.');
    }
    finally { setSaveLoading(false); }
  }, [state.phase, isSaved, torrentId]);

  // --- Loading state ---
  if (state.phase === 'loading') {
    return (
      <FilmPageStage>
        <FilmBiraPizzaNavbar />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <LoadingSpinner className="size-16 text-[#f7f2e5]" />
          <p className="font-['Bahianita',sans-serif] text-3xl text-[#f7f2e5]">
            Yükleniyor...
          </p>
        </div>
      </FilmPageStage>
    );
  }

  // --- Error state ---
  if (state.phase === 'error') {
    return (
      <FilmPageStage>
        <FilmBiraPizzaNavbar />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <p className="font-['Bahianita',sans-serif] text-3xl text-[#f7f2e5] text-center px-8">
            {state.message}
          </p>
          <button
            onClick={() => history.back()}
            className="font-['Bahianita',sans-serif] text-xl text-[#f7f2e5] underline underline-offset-4"
          >
            ← Geri dön
          </button>
        </div>
      </FilmPageStage>
    );
  }

  // --- Watch state ---
  const selectedFile = state.session.files.find(f => f.index === state.selectedFileIndex) ?? null;

  return (
    <FilmPageStage>
      <FilmBiraPizzaNavbar />

      <div className="absolute left-[38px] top-[230px] h-[204px] w-[313px]">
        <img
          src="/frames/file-list-box-frame.svg"
          alt=""
          className="absolute inset-0 h-full w-full"
          draggable={false}
        />
        <div className="absolute left-[17px] right-[5px] top-[7px] bottom-[30px] overflow-hidden">
          <div className="pointer-events-none flex items-end gap-1 pl-[20px] pt-[14px]">
            <span className="font-['Bahianita',sans-serif] text-[24px] leading-none text-[#505050]">
              video
            </span>
            <span className="font-['Bahianita',sans-serif] text-[36px] leading-none text-black">
              Dosyalar
            </span>
          </div>
          <div className="mt-3 h-[106px] overflow-y-auto pr-2">
            <FileTree
              files={state.session.files}
              selectedIndex={state.selectedFileIndex}
              onSelect={(index) => dispatch({ type: 'SELECT_FILE', index })}
            />
          </div>
        </div>
      </div>

      <p
        className="absolute right-[50px] top-[142px] w-[420px] truncate text-right font-['Bahianita',sans-serif] text-[48px] leading-none text-white"
        title={state.torrent.name}
      >
        {state.torrent.name}
      </p>

      <div className="absolute left-[418px] top-[190.5px] h-[486px] w-[810px]">
        <img
          src="/frames/stream-video-frame.svg"
          alt=""
          className="absolute inset-0 h-full w-full"
          draggable={false}
        />
        {selectedFile && (
          <div
            className="absolute inset-0 z-10"
            style={{ clipPath: 'polygon(2.65% 100%, 0% 0%, 100% 2.57%, 97.2% 97%)' }}
          >
            <video
              ref={videoRef}
              src={streamUrl}
              controls
              preload="metadata"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      {user && (
        <button
          onClick={toggle}
          disabled={saveLoading}
          className="absolute left-[992px] top-[687px] h-[65px] w-[214px] cursor-pointer disabled:opacity-60"
        >
          <img
            src="/frames/add-to-library-button.svg"
            alt=""
            className="absolute inset-0 h-full w-full"
            draggable={false}
          />
          <span
            className="absolute left-[4px] top-[4px] flex h-[48px] w-[205px] items-center justify-center font-['Bahianita',sans-serif] text-[36px] leading-none text-black select-none"
          >
            {saveLoading ? '...' : isSaved ? 'Kütüphanede!' : 'Kütüphaneme Ekle'}
          </span>
        </button>
      )}
    </FilmPageStage>
  );
}
