import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getErrorMessage as getNormalizedErrorMessage } from './errors';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  return getNormalizedErrorMessage(err, fallback);
}

export const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mkv', 'avi', 'mov', 'ts', 'm4v']);

export function isVideoFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return VIDEO_EXTENSIONS.has(ext);
}
