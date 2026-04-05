import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SessionList } from '@/components/auth/SessionList';
import { TwoFactorForm } from '@/components/auth/TwoFactorForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, type MeSession, type MeUser } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

function ProfileContent() {
  const { user, isLoading } = useAuth();
  const [sessions, setSessions] = useState<MeSession[]>([]);
  const [profile, setProfile] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyStep, setVerifyStep] = useState<'idle' | 'sending' | 'code' | 'done'>('idle');
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    async function loadProfile() {
      try {
        const me = await api.auth.me();
        setProfile(me.user);
        setSessions(me.sessions);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, 'Profil yüklenemedi.'));
      }
    }

    void loadProfile();
  }, [isLoading]);

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

  async function refreshProfile() {
    try {
      const me = await api.auth.me();
      setProfile(me.user);
      setSessions(me.sessions);
    } catch (err) {
      setError(getErrorMessage(err, 'Profil yüklenemedi.'));
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
                  await refreshProfile();
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
