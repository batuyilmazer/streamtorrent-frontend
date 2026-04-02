import { useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { authStore } from '@/lib/authStore';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user, isLoading, sessionExpired, logout } = useAuth();
  const userLabel = user?.email ?? 'Kullanıcı';

  const dismissExpiry = useCallback(() => {
    authStore.clearSessionExpired();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
        <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <>
      {sessionExpired && (
        <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-3 bg-amber-500/90 px-4 py-2 text-sm text-white backdrop-blur">
          <span>Oturumunuz sona erdi. Lütfen tekrar giriş yapın.</span>
          <a href="/login" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
            Giriş Yap
          </a>
          <Button variant="ghost" size="sm" className="text-white hover:text-white/80" onClick={dismissExpiry}>
            Kapat
          </Button>
        </div>
      )}
      {!user ? (
        <div className="flex items-center gap-2">
          <a href="/login" className={buttonVariants({ variant: 'secondary' })}>
            Giriş Yap
          </a>
          <a href="/register" className={buttonVariants({ variant: 'default' })}>
            Kayıt Ol
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <a href="/library" className={buttonVariants({ variant: 'secondary' })}>
            Kütüphane
          </a>
          <a href="/profile" className={buttonVariants({ variant: 'outline' })}>
            {userLabel}
          </a>
          <button
            type="button"
            onClick={() => void logout()}
            className={buttonVariants({ variant: 'ghost' })}
          >
            Çıkış Yap
          </button>
        </div>
      )}
    </>
  );
}
