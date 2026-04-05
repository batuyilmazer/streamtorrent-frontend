import { FilmBiraPizzaNavbar } from '@/components/layout/FilmBiraPizzaNavbar';
import { FilmPageStage } from '@/components/layout/FilmPageStage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FileTree } from '@/features/torrents/components/FileTree';
import { useWatchScreen } from '@/features/torrents/hooks/useWatchScreen';

interface Props {
  torrentId: string;
}

export default function WatchScreen({ torrentId }: Props) {
  const {
    state,
    user,
    isSaved,
    saveLoading,
    selectedFile,
    streamUrl,
    videoRef,
    selectFile,
    toggleSaved,
  } = useWatchScreen(torrentId);

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
              onSelect={selectFile}
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
          onClick={toggleSaved}
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
