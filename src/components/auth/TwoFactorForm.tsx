import { useMemo, useState } from 'react';
import { api, type TwoFactorScope } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TwoFactorFormProps {
  scope: TwoFactorScope;
  onSuccess?: () => void;
  onTokenSubmit?: (token: string) => void;
}

export function TwoFactorForm({
  scope,
  onSuccess,
  onTokenSubmit,
}: TwoFactorFormProps) {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalized = useMemo(() => token.trim(), [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (normalized.length !== 6) {
      setError('Token 6 haneli olmalı.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (scope === 'verify-email') {
        await api.auth.verifyEmail({ token: normalized });
        onSuccess?.();
      } else {
        onTokenSubmit?.(normalized);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token doğrulanamadı.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Doğrulama Kodu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="twofa-token" className="text-sm font-medium">
              6 haneli kod
            </label>
            <Input
              id="twofa-token"
              inputMode="numeric"
              pattern="[0-9a-zA-Z]{6}"
              maxLength={6}
              required
              value={token}
              onChange={(event) =>
                setToken(event.target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 6))
              }
              placeholder="123456"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Doğrulanıyor...' : 'Doğrula'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
