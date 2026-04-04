import { useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/utils';

export function RegisterForm() {
  const { register, isLoading: authBootLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = useMemo(
    () => authBootLoading || isSubmitting,
    [authBootLoading, isSubmitting],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ email: email.trim(), password });
      window.location.href = '/';
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıt oluşturulamadı.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Kayıt Ol</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-medium">
              E-posta
            </label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ornek@mail.com"
              disabled={isDisabled}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-medium">
              Şifre
            </label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="En az 8 karakter"
              disabled={isDisabled}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password-confirm" className="text-sm font-medium">
              Şifre (Tekrar)
            </label>
            <Input
              id="register-password-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              placeholder="Şifreyi tekrar girin"
              disabled={isDisabled}
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isDisabled}>
            {isSubmitting ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
