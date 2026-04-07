import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { FigmaAuthField } from '@/components/auth/FigmaAuthField';
import { FigmaAuthLayout } from '@/components/auth/FigmaAuthLayout';
import { getErrorMessage } from '@/lib/utils';

export function RegisterForm() {
  const { register, isLoading: authBootLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = authBootLoading || isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('Devam etmek için kullanım şartlarını onaylayın.');
      return;
    }

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
    <FigmaAuthLayout
      busySubmitLabel="Oluşturuluyor..."
      error={error}
      footerLead="Hesabın var mı?"
      footerLinkHref="/login"
      footerLinkLabel="Oturum Aç"
      isSubmitting={isDisabled}
      onSubmit={handleSubmit}
      submitButtonAssetSrc="/figma-auth/signup-button-background.svg"
      submitLabel="Hesap Oluştur"
      title="Hesap Oluştur"
    >
          <div className="space-y-1">
            <FigmaAuthField
              id="register-email"
              label="E-posta"
              type="email"
              autoComplete="email"
              inputComponentFrameSrc="/figma-auth/signup-input-component-frame.svg"
              inputInnerFrameSrc="/figma-auth/signup-input-inner-frame.svg"
              placeholder="email@gmail.com"
              value={email}
              onChange={setEmail}
              disabled={isDisabled}
            />

            <FigmaAuthField
              id="register-password"
              label="Şifre"
              type="password"
              autoComplete="new-password"
              inputComponentFrameSrc="/figma-auth/signup-input-component-frame.svg"
              inputInnerFrameSrc="/figma-auth/signup-input-inner-frame.svg"
              placeholder="∗∗∗∗∗∗∗∗"
              value={password}
              onChange={setPassword}
              disabled={isDisabled}
            />

            <FigmaAuthField
              id="register-password-confirm"
              label="Şifre (Tekrar)"
              type="password"
              autoComplete="new-password"
              inputComponentFrameSrc="/figma-auth/signup-input-component-frame.svg"
              inputInnerFrameSrc="/figma-auth/signup-input-inner-frame.svg"
              placeholder="∗∗∗∗∗∗∗∗"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              disabled={isDisabled}
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-left" htmlFor="register-terms">
            <span className="relative block size-7 shrink-0">
              <input
                id="register-terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="peer sr-only"
                disabled={isDisabled}
              />
              <span className="absolute inset-0 border-[4px] border-[#7c0b00] bg-white shadow-[0_4px_0_0_#7c0b00] transition-transform duration-150 peer-active:translate-y-px peer-disabled:opacity-60" />
              <span className="absolute inset-[7px] bg-[#eb3321] opacity-0 transition-opacity duration-150 peer-checked:opacity-100" />
            </span>
            <span className="font-['Bahianita',sans-serif] text-[20px] leading-none text-white sm:text-[24px]">
              Kullanım şartlarını okudum ve onaylıyorum
            </span>
          </label>
    </FigmaAuthLayout>
  );
}
