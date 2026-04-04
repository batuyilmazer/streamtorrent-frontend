import type { ReactNode } from 'react';

export function FilmPageStage({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh overflow-x-auto overflow-y-hidden bg-[#eb3321]">
      <div className="relative mx-auto h-full max-h-[832px] w-[1280px] overflow-hidden bg-[#eb3321]">
        {children}
      </div>
    </div>
  );
}
