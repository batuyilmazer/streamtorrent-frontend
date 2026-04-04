import { useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/utils';

export function LoginForm() {
  const { login, isLoading: authBootLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = useMemo(
    () => authBootLoading || isSubmitting,
    [authBootLoading, isSubmitting],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') ?? '/';
      window.location.href = next;
    } catch (err) {
      setError(getErrorMessage(err, 'Giriş yapılamadı.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Giriş Yap</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium">
              E-posta
            </label>
            <Input
              id="login-email"
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
            <label htmlFor="login-password" className="text-sm font-medium">
              Şifre
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              disabled={isDisabled}
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isDisabled}>
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
          <div className="text-center">
            <a href="/reset-password" className="text-sm text-primary hover:underline">
              Şifremi Unuttum
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
