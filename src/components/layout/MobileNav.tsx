import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useAuth } from '@/components/auth/AuthProvider';

interface NavLink {
  href: string;
  label: string;
}

const linkClass =
  "block w-full font-['Bahianita',sans-serif] text-[36px] leading-none text-[#f7f2e5] py-2 hover:opacity-80 transition-opacity";

export default function MobileNav({
  variant = 'figma',
}: { variant?: 'figma' | 'plain' } = {}) {
  const { user, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links: NavLink[] = user
    ? [
        { href: '/library', label: 'Kütüphanem' },
        { href: '/collections', label: 'Koleksiyonlar' },
        { href: '/profile', label: 'Profil' },
      ]
    : [
        { href: '/login', label: 'Oturum Aç' },
        { href: '/register', label: 'Hesap Oluştur' },
      ];

  const triggerSvg =
    variant === 'figma' ? (
      <svg
        width="32"
        height="39"
        viewBox="0 0 31.8044 39.0681"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        overflow="visible"
      >
        <g>
          <path
            d="M3.61413 8.02957L2.50454 1.72957L29.5045 1.02957L28.7648 7.32957L3.61413 8.02957Z"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
          <path
            d="M3.50454 22.0296V14.0296L28.5045 15.4841V20.9387L3.50454 22.0296Z"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
          <path
            d="M1.50454 35.0296L4.06336 28.7664L28.7987 28.0296L30.5045 34.2927L1.50454 35.0296Z"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
        </g>
      </svg>
    ) : (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Menüyü aç"
          className="flex shrink-0 cursor-pointer items-center justify-center"
        >
          {triggerSvg}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-[#eb3321] border-black flex flex-col gap-6"
      >
        <SheetTitle className="font-['Bahianita',sans-serif] text-[40px] leading-none text-[#f7f2e5]">
          Menü
        </SheetTitle>
        <nav className="flex flex-col gap-2">
          {isLoading ? (
            <div className="h-10 w-full animate-pulse rounded bg-white/20" />
          ) : (
            links.map((link) => (
              <SheetClose asChild key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </SheetClose>
            ))
          )}
          {user && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className={`${linkClass} text-left`}
            >
              Çıkış Yap
            </button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
