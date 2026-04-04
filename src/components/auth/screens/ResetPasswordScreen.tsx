import { useState } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { TwoFactorForm } from '@/components/auth/TwoFactorForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

function ResetPasswordContent() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'token' | 'password'>('email');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.auth.sendTwoFactor({ scope: 'reset-password' });
      setStep('token');
    } catch (err) {
      setError(getErrorMessage(err, 'Kod gönderilemedi. Bu işlem için giriş yapılmış bir oturum gerekli.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 'password') {
    return (
      <ResetPasswordForm
        token={token}
        onSuccess={() => {
          window.location.href = '/login';
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {step === 'email' ? (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>Şifre Sıfırlama</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium">
                  E-posta
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ornek@mail.com"
                  disabled={isSubmitting}
                />
              </div>
              {error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Kod gönderiliyor...' : 'Kod Gönder'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <TwoFactorForm
          scope="reset-password"
          onTokenSubmit={(submittedToken) => {
            setToken(submittedToken);
            setStep('password');
          }}
        />
      )}
    </div>
  );
}

export function ResetPasswordScreen() {
  return <ResetPasswordContent />;
}
