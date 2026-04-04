import { useSyncExternalStore } from 'react';
import { toastStore } from '@/lib/toast';

export default function ToastViewport() {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot,
  );

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-xl border border-destructive/35 bg-background/95 px-4 py-3 text-sm text-foreground shadow-xl backdrop-blur"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 size-2 shrink-0 rounded-full bg-destructive" />
            <p className="flex-1 leading-5">{toast.message}</p>
            <button
              type="button"
              onClick={() => toastStore.dismiss(toast.id)}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Bildirimi kapat"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
