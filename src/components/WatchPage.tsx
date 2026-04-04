import { useEffect, useReducer, useRef, useState, useCallback } from 'react';
import { api, buildStreamUrl, type TorrentInfo, type StreamSession } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { FileTree } from './FileTree';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { isVideoFile, getErrorMessage } from '@/lib/utils';
import MenuButton from '@/components/layout/MenuButton';

// --- Constants ---

const TEXT_SHADOW = [
  '2px 8px 0 #000', '-2px 8px 0 #000',
  '0 10px 0 #000',  '0 6px 0 #000',
  '2px 10px 0 #000', '-2px 10px 0 #000',
  '2px 6px 0 #000',  '-2px 6px 0 #000',
  '2px 0 0 #000',   '-2px 0 0 #000',
  '0 2px 0 #000',   '0 -2px 0 #000',
  '2px 2px 0 #000',  '-2px 2px 0 #000',
  '2px -2px 0 #000', '-2px -2px 0 #000',
  '0px 8px 0 #000',
].join(', ');

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
    } catch { /* silent */ }
    finally { setSaveLoading(false); }
  }, [state.phase, isSaved, torrentId]);

  // Navbar — shared across all states
  const Navbar = (
    <nav className="relative flex items-center px-12 h-[78px]">
      <MenuButton />
      <h1
        className="absolute left-1/2 -translate-x-1/2 font-['Bahianita',sans-serif] text-5xl text-[#f7f2e5] whitespace-nowrap pointer-events-none select-none tracking-[-0.02em]"
        style={{ textShadow: TEXT_SHADOW }}
      >
        film.bira.pizza
      </h1>
    </nav>
  );

  // --- Loading state ---
  if (state.phase === 'loading') {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {Navbar}
        <div className="flex flex-col items-center justify-center pt-40 gap-6">
          <LoadingSpinner className="size-16 text-[#f7f2e5]" />
          <p className="font-['Bahianita',sans-serif] text-3xl text-[#f7f2e5]">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (state.phase === 'error') {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {Navbar}
        <div className="flex flex-col items-center justify-center pt-40 gap-6">
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
      </div>
    );
  }

  // --- Watch state ---
  const selectedFile = state.session.files.find(f => f.index === state.selectedFileIndex) ?? null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {Navbar}

      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-start gap-10 px-10 pt-16 pb-10 lg:grid-cols-[3fr_7fr]">

        {/* Left column — file list in comic frame */}
        <div className="flex w-full justify-center lg:justify-end">
          <div className="relative w-full max-w-[313px] shrink-0" style={{ height: 204 }}>
            <img
              src="/frames/file-list-box-frame.svg"
              alt=""
              className="absolute inset-0 w-full h-full"
              draggable={false}
            />
            {/* Content inside inner cream area: top:7 left:17 right:5 bottom:30 */}
            <div
              className="absolute flex flex-col overflow-hidden"
              style={{ top: 7, left: 17, right: 5, bottom: 30 }}
            >
              <p className="font-['Bahianita',sans-serif] text-2xl text-black text-center leading-tight shrink-0 mb-0.5">
                Dosyalar
              </p>
              <div className="flex-1 overflow-y-auto min-h-0
                              [&_button]:text-xs [&_button]:py-0.5 [&_button]:px-1
                              [&_button:hover]:bg-black/10 [&_.bg-accent]:bg-black/15
                              [&_.text-muted-foreground]:text-[#505050]
                              [&_[class*='badge']]:text-[10px] [&_[class*='badge']]:px-1 [&_[class*='badge']]:py-0">
                <FileTree
                  files={state.session.files}
                  selectedIndex={state.selectedFileIndex}
                  onSelect={(index) => dispatch({ type: 'SELECT_FILE', index })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — torrent name + video frame + button */}
        <div className="flex flex-col items-end min-w-0 -mt-10">
          {/* Torrent name — right-aligned above frame */}
          <p
            className="mb-2 text-right font-['Bahianita',sans-serif] text-[48px] leading-none text-[#f7f2e5] max-w-full truncate"
            title={state.torrent.name}
          >
            {state.torrent.name}
          </p>

          {/* Video frame */}
          <div className="w-full min-w-[380px]" style={{ maxHeight: 'calc(90vh - 220px)' }}>
            <div className="relative w-full" style={{ aspectRatio: '810 / 486' }}>
              {/* SVG cream frame — background / no-video fallback */}
              <img
                src="/frames/stream-video-frame.svg"
                alt=""
                className="absolute inset-0 w-full h-full"
                draggable={false}
              />
              {/* Video clipped to the polygon shape of the SVG frame.
                  Clip on wrapper div preserves native video controls.
                  Polygon from: M21.5 486 L0 0 L810 12.5 L787 471.5 */}
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
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="mt-4">
            <button
              onClick={toggle}
              disabled={saveLoading}
              className="relative w-[214px] h-[65px] shrink-0 disabled:opacity-60 cursor-pointer mr-8"
            >
              <img
                src="/frames/add-to-library-button.svg"
                alt=""
                className="absolute inset-0 w-full h-full"
                draggable={false}
              />
              <span className="absolute flex items-center justify-center font-['Bahianita',sans-serif] text-[28px] text-black leading-none select-none" style={{ left: 4, top: 4, width: 205, height: 48 }}>
                {saveLoading ? '...' : isSaved ? 'Kütüphanede!' : 'Kütüphaneme Ekle'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
