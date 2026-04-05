import { useEffect, useState } from 'react';
import { TwoFactorForm } from '@/components/auth/TwoFactorForm';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

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
