import { createElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterForm } from '@/components/auth/RegisterForm';

const useAuthMock = vi.fn();

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('@/components/layout/MenuButton', () => ({
  default: () => createElement('button', { type: 'button', 'aria-label': 'Menüyü aç' }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({
      register: vi.fn().mockResolvedValue(undefined),
      isLoading: false,
    });
    window.history.replaceState({}, '', '/register');
  });

  it('submits trimmed email credentials through auth', async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({
      register,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(createElement(RegisterForm));

    await user.type(screen.getByLabelText('E-posta'), '  user@example.com  ');
    await user.type(screen.getByLabelText('Şifre'), 'secretpass');
    await user.type(screen.getByLabelText('Şifre (Tekrar)'), 'secretpass');
    await user.click(screen.getByLabelText('Kullanım şartlarını okudum ve onaylıyorum'));
    await user.click(screen.getByRole('button', { name: 'Hesap Oluştur' }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secretpass',
      });
    });
  });

  it('blocks submit when terms are not accepted', async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({
      register,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(createElement(RegisterForm));

    await user.type(screen.getByLabelText('E-posta'), 'user@example.com');
    await user.type(screen.getByLabelText('Şifre'), 'secretpass');
    await user.type(screen.getByLabelText('Şifre (Tekrar)'), 'secretpass');
    await user.click(screen.getByRole('button', { name: 'Hesap Oluştur' }));

    expect(register).not.toHaveBeenCalled();
    expect(await screen.findByText('Devam etmek için kullanım şartlarını onaylayın.')).toBeTruthy();
  });

  it('shows an error when passwords do not match', async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({
      register,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(createElement(RegisterForm));

    await user.type(screen.getByLabelText('E-posta'), 'user@example.com');
    await user.type(screen.getByLabelText('Şifre'), 'secretpass');
    await user.type(screen.getByLabelText('Şifre (Tekrar)'), 'differentpass');
    await user.click(screen.getByLabelText('Kullanım şartlarını okudum ve onaylıyorum'));
    await user.click(screen.getByRole('button', { name: 'Hesap Oluştur' }));

    expect(register).not.toHaveBeenCalled();
    expect(await screen.findByText('Şifreler eşleşmiyor.')).toBeTruthy();
  });

  it('renders the fallback error message when register fails', async () => {
    const register = vi.fn().mockRejectedValue(new Error(''));
    useAuthMock.mockReturnValue({
      register,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(createElement(RegisterForm));

    await user.type(screen.getByLabelText('E-posta'), 'user@example.com');
    await user.type(screen.getByLabelText('Şifre'), 'secretpass');
    await user.type(screen.getByLabelText('Şifre (Tekrar)'), 'secretpass');
    await user.click(screen.getByLabelText('Kullanım şartlarını okudum ve onaylıyorum'));
    await user.click(screen.getByRole('button', { name: 'Hesap Oluştur' }));

    expect(await screen.findByText('Kayıt oluşturulamadı.')).toBeTruthy();
  });
});
