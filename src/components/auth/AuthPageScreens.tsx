import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { SessionList } from '@/components/auth/SessionList';
import { TwoFactorForm } from '@/components/auth/TwoFactorForm';
import { api, type MeSession, type MeUser } from '@/lib/api';
import { useEffect, useState, useCallback } from 'react';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function LoginScreen() {
  return <LoginForm />;
}

export function RegisterScreen() {
  return <RegisterForm />;
}

function VerifyEmailContent() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let active = true;
    async function sendToken() {
      setStatus('sending');
      try {
        await api.auth.sendTwoFactor({ scope: 'verify-email' });
        if (!active) return;
        setStatus('sent');
        setMessage('Doğrulama kodu e-posta adresinize gönderildi.');
      } catch (err) {
        if (!active) return;
        setStatus('error');
        setMessage(getErrorMessage(err, 'Kod gönderilemedi.'));
      }
    }
    void sendToken();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      {status === 'sending' && <p className="text-sm text-muted-foreground">Kod gönderiliyor...</p>}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <TwoFactorForm scope="verify-email" onSuccess={() => (window.location.href = '/profile')} />
    </div>
  );
}

export function VerifyEmailScreen() {
  return <VerifyEmailContent />;
}

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

function ProfileContent() {
  const { user, isLoading } = useAuth();
  const [sessions, setSessions] = useState<MeSession[]>([]);
  const [profile, setProfile] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyStep, setVerifyStep] = useState<'idle' | 'sending' | 'code' | 'done'>('idle');
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const me = await api.auth.me();
      setProfile(me.user);
      setSessions(me.sessions);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Profil yüklenemedi.'));
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    void loadProfile();
  }, [isLoading, loadProfile]);

  async function handleSendVerification() {
    setVerifyError(null);
    setVerifyStep('sending');
    try {
      await api.auth.sendTwoFactor({ scope: 'verify-email' });
      setVerifyStep('code');
    } catch (err) {
      setVerifyError(getErrorMessage(err, 'Kod gönderilemedi.'));
      setVerifyStep('idle');
    }
  }

  const userInfo = profile ?? user;

  return (
    <div className="space-y-6">
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-sm">
            <strong>E-posta:</strong> {userInfo?.email ?? '-'}
          </p>
          <p className="text-sm">
            <strong>E-posta Doğrulandı:</strong> {userInfo?.emailVerified ? 'Evet' : 'Hayır'}
          </p>
        </CardContent>
      </Card>

      {userInfo && !userInfo.emailVerified && (
        <Card className="mx-auto w-full max-w-3xl">
          <CardHeader>
            <CardTitle>E-posta Doğrulama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {verifyStep === 'done' ? (
              <p className="text-sm text-green-600">E-posta adresiniz doğrulandı.</p>
            ) : verifyStep === 'code' ? (
              <TwoFactorForm
                scope="verify-email"
                onSuccess={async () => {
                  setVerifyStep('done');
                  await loadProfile();
                }}
              />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  E-posta adresinizi doğrulamak için bir kod gönderebilirsiniz.
                </p>
                {verifyError && (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {verifyError}
                  </p>
                )}
                <Button
                  onClick={handleSendVerification}
                  disabled={verifyStep === 'sending'}
                  variant="outline"
                >
                  {verifyStep === 'sending' ? 'Kod gönderiliyor...' : 'Doğrulama Kodu Gönder'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <SessionList sessions={sessions} />
    </div>
  );
}

export function ProfileScreen() {
  return <ProfileContent />;
}
