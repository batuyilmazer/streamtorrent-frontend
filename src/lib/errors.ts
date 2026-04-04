export interface ApiErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorPayload {
  error?: unknown;
  message?: unknown;
  details?: unknown;
}

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: 'İstek işlenemedi. Gönderdiğiniz bilgileri kontrol edin.',
  401: 'Oturumunuz doğrulanamadı. Yeniden giriş yapın.',
  403: 'Bu işlem için yetkiniz yok.',
  404: 'İstenen içerik bulunamadı.',
  408: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
  409: 'Bu işlem mevcut durumla çakıştı.',
  413: 'Gönderdiğiniz içerik çok büyük.',
  422: 'Girilen bilgiler geçersiz.',
  429: 'Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.',
  500: 'Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
  502: 'Sunucu şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.',
  503: 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
  504: 'Sunucu zamanında yanıt vermedi. Lütfen tekrar deneyin.',
};

const CODE_MESSAGES: Record<string, string> = {
  NOT_FOUND: 'İstenen içerik bulunamadı.',
  INTERNAL_SERVER_ERROR: 'Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
  TOKEN_EXPIRED: 'Oturumunuzun süresi doldu. Yeniden giriş yapın.',
  VALIDATION_ERROR: 'Gönderdiğiniz bilgiler doğrulanamadı.',
  validation_error: 'Gönderdiğiniz bilgiler doğrulanamadı.',
};

const RAW_MESSAGE_MAP: Record<string, string> = {
  'Too many uploads, please try again later.': 'Yükleme limiti doldu. Lütfen biraz sonra tekrar deneyin.',
  'Too many requests, please try again later.': 'Kısa sürede çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.',
  'Too many stream sessions, please try again later.': 'Kısa sürede çok fazla oynatma isteği yapıldı. Lütfen biraz sonra tekrar deneyin.',
  'Too many stream requests, please try again later.': 'Video isteği limiti doldu. Lütfen biraz sonra tekrar deneyin.',
  'Too many login attempts, please try again later.': 'Çok fazla başarısız giriş denemesi yapıldı. Lütfen biraz sonra tekrar deneyin.',
  'Too many refresh attempts, please try again later.': 'Oturum yenileme limiti doldu. Lütfen biraz sonra tekrar deneyin.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCodeLike(value: string): boolean {
  return /^[A-Z0-9_]+$/.test(value) || /^[a-z0-9_]+$/.test(value);
}

function sanitizeMessage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getStatusFallback(statusCode: number, statusText?: string): string {
  return STATUS_FALLBACK_MESSAGES[statusCode]
    ?? sanitizeMessage(statusText)
    ?? 'Beklenmeyen bir hata oluştu.';
}

function parseErrorDetails(details: unknown): ApiErrorDetail[] | undefined {
  if (!Array.isArray(details)) return undefined;

  const parsed = details
    .map((detail) => {
      if (!isRecord(detail)) return null;
      const message = sanitizeMessage(detail.message);
      if (!message) return null;

      const pathValue = Array.isArray(detail.path)
        ? detail.path.filter((part): part is string | number => typeof part === 'string' || typeof part === 'number')
        : typeof detail.path === 'string'
          ? [detail.path]
          : [];

      const path = pathValue.map(String).filter(Boolean).join('.');
      return { path, message };
    })
    .filter((detail): detail is ApiErrorDetail => detail !== null);

  return parsed.length > 0 ? parsed : undefined;
}

function formatErrorDetails(details?: ApiErrorDetail[]): string | null {
  if (!details || details.length === 0) return null;

  return details
    .map((detail) => (detail.path ? `${detail.path}: ${detail.message}` : detail.message))
    .join(' ');
}

function normalizeRawMessage(rawMessage: string): string {
  return RAW_MESSAGE_MAP[rawMessage] ?? rawMessage;
}

function resolvePayloadMessage(
  payload: ErrorPayload,
  statusCode: number,
  statusText?: string,
): { code: string; message: string; details?: ApiErrorDetail[] } {
  const details = parseErrorDetails(payload.details);
  const explicitMessage = sanitizeMessage(payload.message);
  const rawError = sanitizeMessage(payload.error);

  if (explicitMessage) {
    return {
      code: rawError ?? 'UNKNOWN',
      message: normalizeRawMessage(explicitMessage),
      details,
    };
  }

  if (rawError) {
    if (!isCodeLike(rawError)) {
      return { code: 'UNKNOWN', message: normalizeRawMessage(rawError), details };
    }

    const detailMessage = formatErrorDetails(details);
    const mappedMessage = CODE_MESSAGES[rawError];
    return {
      code: rawError,
      message: detailMessage ?? mappedMessage ?? getStatusFallback(statusCode, statusText),
      details,
    };
  }

  const detailMessage = formatErrorDetails(details);
  return {
    code: 'UNKNOWN',
    message: detailMessage ?? getStatusFallback(statusCode, statusText),
    details,
  };
}

export function createApiError(
  statusCode: number,
  payload: unknown,
  statusText?: string,
): ApiError {
  const normalizedPayload = isRecord(payload) ? payload as ErrorPayload : {};
  const { code, message, details } = resolvePayloadMessage(normalizedPayload, statusCode, statusText);
  return new ApiError(statusCode, code, message, details);
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.message || fallback;
  }

  if (err instanceof TypeError) {
    return 'Sunucuya ulaşılamadı. Bağlantınızı ve API servisinin çalıştığını kontrol edin.';
  }

  if (err instanceof Error) {
    const message = sanitizeMessage(err.message);
    return message ?? fallback;
  }

  return fallback;
}
