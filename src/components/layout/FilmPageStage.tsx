import type { ReactNode } from 'react';

export function FilmPageStage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-auto bg-[#eb3321]">
      <div className="relative mx-auto h-[832px] w-[1280px] overflow-hidden bg-[#eb3321]">
        {children}
      </div>
    </div>
  );
}
