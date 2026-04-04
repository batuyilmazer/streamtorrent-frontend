import { useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { authStore } from '@/lib/authStore';
import MenuButton from '@/components/layout/MenuButton';

const brandTextShadow = [
  '2px 8px 0 #000', '-2px 8px 0 #000',
  '0 10px 0 #000', '0 6px 0 #000',
  '2px 10px 0 #000', '-2px 10px 0 #000',
  '2px 6px 0 #000', '-2px 6px 0 #000',
  '2px 0 0 #000', '-2px 0 0 #000',
  '0 2px 0 #000', '0 -2px 0 #000',
  '2px 2px 0 #000', '-2px 2px 0 #000',
  '2px -2px 0 #000', '-2px -2px 0 #000',
  '0px 8px 0 #000',
].join(', ');

const brandClass =
  "absolute left-1/2 top-[26px] -translate-x-1/2 whitespace-nowrap font-['Bahianita',sans-serif] text-[48px] leading-none text-[#f7f2e5]";

const navLinkClass =
  "font-['Bahianita',sans-serif] text-[36px] leading-none text-white transition-opacity hover:opacity-80";

export function FilmBiraPizzaNavbar() {
  const { user, isLoading, sessionExpired } = useAuth();

  const dismissExpiry = useCallback(() => {
    authStore.clearSessionExpired();
  }, []);

  return (
    <>
      {sessionExpired && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-amber-500/90 px-4 py-2 text-sm text-white backdrop-blur">
          <span>Oturumunuz sona erdi. Lütfen tekrar giriş yapın.</span>
          <a href="/login" className="rounded border border-white/70 px-3 py-1 text-xs uppercase tracking-wide transition-opacity hover:opacity-80">
            Giriş Yap
          </a>
          <button
            type="button"
            onClick={dismissExpiry}
            className="text-xs uppercase tracking-wide opacity-80 transition-opacity hover:opacity-100"
          >
            Kapat
          </button>
        </div>
      )}

      <nav className="absolute left-0 top-0 h-[111px] w-[1280px] px-[47px] py-[14px]">
        <div className="relative flex h-full items-center justify-between">
          <MenuButton />

          <a
            href="/"
            className={brandClass}
            style={{
              WebkitTextStroke: '0.5px #000',
              textShadow: brandTextShadow,
            }}
          >
            film.bira.pizza
          </a>

          <div className="ml-auto flex h-[65px] items-center gap-[34px]">
            {isLoading ? (
              <>
                <div className="h-9 w-20 animate-pulse rounded bg-white/25" />
                <div className="h-[65px] w-[160px] animate-pulse rounded bg-white/25" />
              </>
            ) : user ? (
              <>
                <a href="/profile" className={navLinkClass}>
                  Profil
                </a>
                <a href="/library" className="relative block h-[65px] w-[160px] transition-transform hover:translate-y-px">
                  <img
                    src="/frames/navbar-auth-button.svg"
                    alt=""
                    className="absolute inset-0 h-full w-full"
                    draggable={false}
                  />
                  <span className="absolute inset-x-[4px] top-[4px] flex h-[48px] items-center justify-center font-['Bahianita',sans-serif] text-[36px] leading-none text-black">
                    Kütüphanem
                  </span>
                </a>
              </>
            ) : (
              <>
                <a href="/login" className={navLinkClass}>
                  Oturum Aç
                </a>
                <a href="/register" className="relative block h-[65px] w-[160px] transition-transform hover:translate-y-px">
                  <img
                    src="/frames/navbar-auth-button.svg"
                    alt=""
                    className="absolute inset-0 h-full w-full"
                    draggable={false}
                  />
                  <span className="absolute inset-x-[4px] top-[4px] flex h-[48px] items-center justify-center font-['Bahianita',sans-serif] text-[36px] leading-none text-black">
                    Hesap Oluştur
                  </span>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
