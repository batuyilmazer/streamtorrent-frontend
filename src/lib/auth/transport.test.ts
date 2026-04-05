import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestLogin, requestRefresh } from '@/lib/auth/transport';

const fetchMock = vi.fn<typeof fetch>();

describe('auth transport', () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it('normalizes a successful login response', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          access: 'token-123',
          user: {
            userId: 'user-1',
            email: 'user@example.com',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      requestLogin({
        email: 'user@example.com',
        password: 'secret',
      }),
    ).resolves.toEqual({
      access: 'token-123',
      user: {
        id: undefined,
        userId: 'user-1',
        email: 'user@example.com',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });

  it('returns null when refresh fails', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401, statusText: 'Unauthorized' }));

    vi.stubGlobal('fetch', fetchMock);

    await expect(requestRefresh()).resolves.toBeNull();
  });
});
