import { useAuth } from '@/components/auth/AuthProvider';
import { showErrorToast } from '@/lib/toast';
import { getErrorMessage, isVideoFile } from '@/lib/utils';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  createStreamUrl,
  isTorrentSaved,
  listSavedTorrents,
  loadTorrentWatchData,
  removeTorrent,
  saveTorrent,
} from '@/features/torrents/services/torrents';
import type { StreamSession, TorrentInfo } from '@/lib/api';

type WatchState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'watch'; torrent: TorrentInfo; session: StreamSession; selectedFileIndex: number };

type WatchAction =
  | { type: 'READY'; torrent: TorrentInfo; session: StreamSession }
  | { type: 'ERROR'; message: string }
  | { type: 'SELECT_FILE'; index: number };

function reducer(state: WatchState, action: WatchAction): WatchState {
  switch (action.type) {
    case 'READY': {
      const firstVideoIndex = action.session.files.findIndex((file) => isVideoFile(file.name));
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

export function useWatchScreen(torrentId: string) {
  const [state, dispatch] = useReducer(reducer, { phase: 'loading' });
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { torrent, session } = await loadTorrentWatchData(torrentId);
        if (!cancelled) {
          dispatch({ type: 'READY', torrent, session });
        }
      } catch (err) {
        if (!cancelled) {
          dispatch({ type: 'ERROR', message: getErrorMessage(err, 'Yüklenemedi.') });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [torrentId]);

  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }
    if (state.phase !== 'watch') return;

    let cancelled = false;
    listSavedTorrents()
      .then((items) => {
        if (!cancelled) {
          setIsSaved(isTorrentSaved(items, torrentId));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [state.phase, torrentId, user]);

  const streamUrl =
    state.phase === 'watch'
      ? createStreamUrl(state.session.streamToken, state.selectedFileIndex)
      : '';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    video.load();
    video.play().catch(() => {});
  }, [streamUrl]);

  const selectFile = useCallback((index: number) => {
    dispatch({ type: 'SELECT_FILE', index });
  }, []);

  const toggleSaved = useCallback(async () => {
    if (state.phase !== 'watch') return;

    setSaveLoading(true);
    try {
      if (isSaved) {
        await removeTorrent(torrentId);
        setIsSaved(false);
      } else {
        await saveTorrent(torrentId);
        setIsSaved(true);
      }
    } catch (err) {
      showErrorToast(err, isSaved ? 'Torrent kütüphaneden kaldırılamadı.' : 'Torrent kaydedilemedi.');
    } finally {
      setSaveLoading(false);
    }
  }, [isSaved, state.phase, torrentId]);

  const selectedFile =
    state.phase === 'watch'
      ? state.session.files.find((file) => file.index === state.selectedFileIndex) ?? null
      : null;

  return {
    state,
    user,
    isSaved,
    saveLoading,
    selectedFile,
    streamUrl,
    videoRef,
    selectFile,
    toggleSaved,
  };
}
