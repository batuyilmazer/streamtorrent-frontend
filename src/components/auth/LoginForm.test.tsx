import { createElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from '@/components/auth/LoginForm';

const useAuthMock = vi.fn();

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({
      login: vi.fn().mockResolvedValue(undefined),
      isLoading: false,
    });
    window.history.replaceState({}, '', '/login');
  });

  it('submits trimmed email credentials through auth', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useAuthMock.mockReturnValue({
      login,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(createElement(LoginForm));

    await user.type(screen.getByLabelText('E-posta'), '  user@example.com  ');
    await user.type(screen.getByLabelText('Şifre'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Giriş Yap' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret',
      });
    });
  });

  it('renders the fallback error message when login fails', async () => {
    const login = vi.fn().mockRejectedValue(new Error(''));
    useAuthMock.mockReturnValue({
      login,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(createElement(LoginForm));

    await user.type(screen.getByLabelText('E-posta'), 'user@example.com');
    await user.type(screen.getByLabelText('Şifre'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Giriş Yap' }));

    expect(await screen.findByText('Giriş yapılamadı.')).toBeInTheDocument();
  });
});
