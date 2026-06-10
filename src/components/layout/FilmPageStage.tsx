import type { ReactNode } from 'react';

export function FilmPageStage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#eb3321]">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col bg-[#eb3321]">
        {children}
      </div>
    </div>
  );
}
