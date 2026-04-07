import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { FigmaAuthField } from '@/components/auth/FigmaAuthField';
import { FigmaAuthLayout } from '@/components/auth/FigmaAuthLayout';
import { getErrorMessage } from '@/lib/utils';

export function LoginForm() {
  const { login, isLoading: authBootLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = authBootLoading || isSubmitting;

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
    <FigmaAuthLayout
      busySubmitLabel="Açılıyor..."
      error={error}
      footerLead="Hesabın Yok mu?"
      footerLinkHref="/register"
      footerLinkLabel="Hesap Oluştur"
      isSubmitting={isDisabled}
      onSubmit={handleSubmit}
      submitButtonAssetSrc="/figma-auth/login-button-background.svg"
      submitLabel="Oturum Aç"
      title="Oturum Aç"
    >
      <div className="space-y-1">
        <FigmaAuthField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          inputComponentFrameSrc="/figma-auth/login-input-component-frame.svg"
          inputInnerFrameSrc="/figma-auth/login-input-inner-frame.svg"
          placeholder="email@gmail.com"
          value={email}
          onChange={setEmail}
          disabled={isDisabled}
        />

        <FigmaAuthField
          id="login-password"
          label="Şifre"
          type="password"
          autoComplete="current-password"
          inputComponentFrameSrc="/figma-auth/login-input-component-frame.svg"
          inputInnerFrameSrc="/figma-auth/login-input-inner-frame.svg"
          placeholder="∗∗∗∗∗∗∗∗"
          value={password}
          onChange={setPassword}
          disabled={isDisabled}
        />
      </div>
    </FigmaAuthLayout>
  );
}
