import type { ReactNode } from 'react';
import MenuButton from '@/components/layout/MenuButton';

const headingTextShadow = [
  '4px 0 0 #000',
  '-4px 0 0 #000',
  '0 4px 0 #000',
  '0 -4px 0 #000',
  '4px 4px 0 #000',
  '-4px 4px 0 #000',
  '4px -4px 0 #000',
  '-4px -4px 0 #000',
  '0 12px 0 #000',
  '4px 12px 0 #000',
  '-4px 12px 0 #000',
].join(', ');

const brandTextShadow = [
  '2px 0 0 #000',
  '-2px 0 0 #000',
  '0 2px 0 #000',
  '0 -2px 0 #000',
  '2px 2px 0 #000',
  '-2px 2px 0 #000',
  '2px -2px 0 #000',
  '-2px -2px 0 #000',
  '0 6px 0 #000',
  '2px 6px 0 #000',
  '-2px 6px 0 #000',
].join(', ');

interface FigmaAuthLayoutProps {
  busySubmitLabel: string;
  children: ReactNode;
  error: string | null;
  footerLead: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitButtonAssetSrc: string;
  submitLabel: string;
  title: string;
}

export function FigmaAuthLayout({
  busySubmitLabel,
  children,
  error,
  footerLead,
  footerLinkHref,
  footerLinkLabel,
  isSubmitting,
  onSubmit,
  submitButtonAssetSrc,
  submitLabel,
  title,
}: FigmaAuthLayoutProps) {
  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#eb3321] px-5 text-white">
      <div className="absolute inset-x-5 top-6 z-10 mx-auto flex w-auto max-w-6xl items-center justify-between">
        <MenuButton />
      </div>
      <a
        href="/"
        className="absolute left-1/2 top-7 z-10 -translate-x-1/2 whitespace-nowrap font-['Bahianita',sans-serif] text-[32px] leading-none text-[#f7f2e5] sm:text-[40px] md:text-[48px]"
        style={{
          WebkitTextStroke: '0.5px #000',
          textShadow: brandTextShadow,
        }}
      >
        film.bira.pizza
      </a>

      <div className="mx-auto flex min-h-screen w-full max-w-[303px] flex-col items-center justify-center pt-4 sm:pt-6">
        <h1
          className="mb-8 whitespace-nowrap text-center font-['Bahianita',sans-serif] text-[72px] leading-[0.72] text-[#f7f2e5] sm:mb-10 sm:text-[96px] md:text-[120px]"
          style={{
            WebkitTextStroke: '1px #000',
            textShadow: headingTextShadow,
          }}
        >
          {title}
        </h1>

        <form onSubmit={onSubmit} className="w-full">
          {children}

          {error && (
            <p
              className="mt-4 rounded border-2 border-black bg-[#f7f2e5] px-3 py-2 text-center font-['Bahianita',sans-serif] text-[24px] leading-none text-[#7c0b00]"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="group relative z-10 mx-auto mt-6 block h-[65px] w-[240px] cursor-pointer transition-[transform,opacity,filter] duration-300 ease-in-out hover:brightness-105 active:translate-y-px disabled:cursor-default disabled:opacity-60"
            disabled={isSubmitting}
          >
            <img
              src={submitButtonAssetSrc}
              alt=""
              className="absolute inset-0 h-full w-full"
              draggable={false}
            />
            <span className="absolute left-1/2 top-[4px] h-[48px] w-[232px] -translate-x-1/2 bg-[#f7f2e5]" />
            <span className="absolute left-1/2 top-[6px] h-[48px] w-[232px] -translate-x-1/2 whitespace-nowrap font-['Bahianita',sans-serif] text-center text-[36px] leading-none text-black transition-transform duration-300 ease-in-out group-hover:scale-[1.03] group-active:translate-y-px">
              <span className="absolute left-1/2 top-[2px] -translate-x-1/2">
                {isSubmitting ? busySubmitLabel : submitLabel}
              </span>
            </span>
          </button>

          <p className="mt-[18px] text-center font-['Bahianita',sans-serif] text-[36px] leading-none text-white">
            {footerLead}{' '}
            <a href={footerLinkHref} className="underline underline-offset-4">
              {footerLinkLabel}
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}
