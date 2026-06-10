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
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
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
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
          <p className="font-['Bahianita',sans-serif] text-3xl text-[#f7f2e5] text-center">
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

      <div className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-2 sm:px-8 lg:flex-row lg:gap-8 lg:px-[38px]">
        <aside className="order-2 w-full lg:order-1 lg:w-[313px] lg:shrink-0">
          <div className="relative w-full max-w-[313px] mx-auto lg:mx-0" style={{ aspectRatio: '313 / 204' }}>
            <img
              src="/frames/file-list-box-frame.svg"
              alt=""
              className="absolute inset-0 h-full w-full"
              draggable={false}
            />
            <div className="absolute left-[17px] right-[5px] top-[7px] bottom-[30px] flex flex-col overflow-hidden">
              <div className="pointer-events-none flex items-end gap-1 pl-[20px] pt-[14px]">
                <span className="font-['Bahianita',sans-serif] text-[24px] leading-none text-[#505050]">
                  video
                </span>
                <span className="font-['Bahianita',sans-serif] text-[36px] leading-none text-black">
                  Dosyalar
                </span>
              </div>
              <div className="mt-3 flex-1 overflow-y-auto pr-2">
                <FileTree
                  files={state.session.files}
                  selectedIndex={state.selectedFileIndex}
                  onSelect={selectFile}
                />
              </div>
            </div>
          </div>
        </aside>

        <section className="order-1 flex min-w-0 flex-1 flex-col gap-4 lg:order-2">
          <p
            className="w-full truncate text-center font-['Bahianita',sans-serif] text-[28px] leading-tight text-white sm:text-[36px] lg:text-right lg:text-[48px] lg:leading-none"
            title={state.torrent.name}
          >
            {state.torrent.name}
          </p>

          <div className="relative aspect-[810/486] w-full max-w-[810px] self-center lg:self-stretch">
            <img
              src="/frames/stream-video-frame.svg"
              alt=""
              className="absolute inset-0 h-full w-full pointer-events-none"
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
                  playsInline
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
              className="relative h-[56px] w-full max-w-[214px] cursor-pointer self-center disabled:opacity-60 sm:h-[65px] lg:self-end"
            >
              <img
                src="/frames/add-to-library-button.svg"
                alt=""
                className="absolute inset-0 h-full w-full"
                draggable={false}
              />
              <span
                className="absolute inset-x-[4px] top-[4px] flex h-[40px] items-center justify-center font-['Bahianita',sans-serif] text-[28px] leading-none text-black select-none sm:h-[48px] sm:text-[36px]"
              >
                {saveLoading ? '...' : isSaved ? 'Kütüphanede!' : 'Kütüphaneme Ekle'}
              </span>
            </button>
          )}
        </section>
      </div>
    </FilmPageStage>
  );
}
