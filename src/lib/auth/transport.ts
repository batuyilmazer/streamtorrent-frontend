import type { LoginRequest, MeResponse, MeUser, RegisterRequest } from '@/lib/api';
import { createApiError } from '@/lib/errors';
import { fetchApi, mergeHeaders, safeJson } from '@/lib/http';

interface AuthResponseBody {
  access?: string;
  user?: {
    id?: string;
    userId?: string;
    email?: string;
  };
}

export interface AuthSuccessPayload {
  access: string;
  user: {
    id?: string;
    userId?: string;
    email: string;
  };
}

async function readError(response: Response): Promise<Error> {
  const body = await safeJson(response);
  return createApiError(response.status, body, response.statusText);
}

async function assertOk<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await readError(response);
  }
  return safeJson<T>(response);
}

export async function requestRefresh(): Promise<string | null> {
  const response = await fetchApi('/auth/refresh', { method: 'POST' });
  if (!response.ok) return null;
  const data = await safeJson<AuthResponseBody>(response);
  return typeof data.access === 'string' ? data.access : null;
}

export async function requestCurrentUser(accessToken: string): Promise<MeUser | null> {
  const response = await fetchApi('/me', {
    headers: mergeHeaders(undefined, { Authorization: `Bearer ${accessToken}` }),
  });
  if (!response.ok) return null;
  const data = await safeJson<MeResponse>(response);
  return data.user ?? null;
}

function normalizeAuthResponse(data: AuthResponseBody): AuthSuccessPayload {
  if (typeof data.access !== 'string') {
    throw new Error('Auth response is missing access token.');
  }

  const email = data.user?.email;
  if (typeof email !== 'string') {
    throw new Error('Auth response is missing user email.');
  }

  return {
    access: data.access,
    user: {
      id: data.user?.id,
      userId: data.user?.userId,
      email,
    },
  };
}

export async function requestLogin(payload: LoginRequest): Promise<AuthSuccessPayload> {
  const response = await fetchApi('/auth/login', {
    method: 'POST',
    headers: mergeHeaders(undefined, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  return normalizeAuthResponse(await assertOk<AuthResponseBody>(response));
}

export async function requestRegister(payload: RegisterRequest): Promise<AuthSuccessPayload> {
  const response = await fetchApi('/auth/register', {
    method: 'POST',
    headers: mergeHeaders(undefined, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  return normalizeAuthResponse(await assertOk<AuthResponseBody>(response));
}

export async function requestLogout(): Promise<void> {
  const response = await fetchApi('/auth/logout', { method: 'POST' });
  if (!response.ok) {
    throw await readError(response);
  }
}
