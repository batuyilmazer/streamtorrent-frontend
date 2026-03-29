import { useRef, useEffect } from 'react';

interface Props {
  src: string;
  title: string;
}

export function VideoPlayer({ src, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [src]);

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground truncate" title={title}>
        {title}
      </p>
      <video
        ref={videoRef}
        src={src}
        controls
        preload="metadata"
        className="w-full aspect-video bg-black rounded-xl"
      />
    </div>
  );
}
