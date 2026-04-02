import { useState } from 'react';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
}

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Yeni şifre en az 8 karakter olmalı.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.auth.resetPassword({ token, newPassword });
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err, 'Şifre sıfırlanamadı.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Yeni Şifre Belirle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium">
              Yeni Şifre
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="En az 8 karakter"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Yeni Şifre (Tekrar)
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Şifreyi tekrar girin"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
