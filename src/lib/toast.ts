import { getErrorMessage } from './errors';

export interface ToastItem {
  id: string;
  message: string;
  variant: 'error';
}

interface ShowToastInput {
  message: string;
  durationMs?: number;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let toasts: ToastItem[] = [];

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export const toastStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): ToastItem[] {
    return toasts;
  },

  dismiss(id: string) {
    toasts = toasts.filter((toast) => toast.id !== id);
    emit();
  },
};

export function showToast({ message, durationMs = 5000 }: ShowToastInput): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  toasts = [...toasts.slice(-2), { id, message, variant: 'error' }];
  emit();

  window.setTimeout(() => {
    toastStore.dismiss(id);
  }, durationMs);

  return id;
}

export function showErrorToast(error: unknown, fallback: string): string {
  return showToast({ message: getErrorMessage(error, fallback) });
}
