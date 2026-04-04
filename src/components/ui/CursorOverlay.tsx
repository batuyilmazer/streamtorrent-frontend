import { useEffect, useRef, useState } from 'react';

const DESKTOP_CURSOR_QUERY = '(hover: hover) and (pointer: fine)';

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'summary',
  'label[for]',
  'select:not(:disabled)',
  'input[type="button"]:not(:disabled)',
  'input[type="submit"]:not(:disabled)',
  'input[type="reset"]:not(:disabled)',
  'input[type="checkbox"]:not(:disabled)',
  'input[type="radio"]:not(:disabled)',
  '[role="button"]:not([aria-disabled="true"])',
  '[data-slot="button"]',
  '.group\\/button',
  '.cursor-pointer',
].join(', ');

const TEXT_SELECTOR = [
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])',
  'textarea',
  '[contenteditable="true"]',
  '[contenteditable=""]',
  '[contenteditable="plaintext-only"]',
].join(', ');

type CursorMode = 'default' | 'interactive' | 'text';

function resolveCursorMode(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) {
    return 'default';
  }

  if (target.closest(TEXT_SELECTOR)) {
    return 'text';
  }

  if (target.closest(INTERACTIVE_SELECTOR)) {
    return 'interactive';
  }

  return 'default';
}

export default function CursorOverlay() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const modeRef = useRef<CursorMode>('default');
  const visibleRef = useRef(false);
  const pointRef = useRef({ x: -100, y: -100 });
  const [mode, setMode] = useState<CursorMode>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const media = window.matchMedia(DESKTOP_CURSOR_QUERY);
    if (!media.matches) {
      return undefined;
    }

    const root = document.documentElement;
    root.classList.add('custom-cursor-enabled');

    const syncPosition = () => {
      frameRef.current = null;

      if (!cursorRef.current) {
        return;
      }

      const { x, y } = pointRef.current;
      cursorRef.current.style.transform = `translate3d(${x - 1}px, ${y - 1}px, 0)`;
    };

    const queuePosition = (x: number, y: number) => {
      pointRef.current = { x, y };

      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(syncPosition);
    };

    const updateVisible = (nextVisible: boolean) => {
      if (visibleRef.current === nextVisible) {
        return;
      }

      visibleRef.current = nextVisible;
      setIsVisible(nextVisible);
    };

    const updateMode = (nextMode: CursorMode) => {
      if (modeRef.current === nextMode) {
        return;
      }

      modeRef.current = nextMode;
      setMode(nextMode);
    };

    const handlePointer = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        return;
      }

      updateVisible(true);
      updateMode(resolveCursorMode(event.target));
      queuePosition(event.clientX, event.clientY);
    };

    const hideCursor = () => {
      updateVisible(false);
    };

    const refreshModeFromElement = (element: Element | null) => {
      updateMode(resolveCursorMode(element));
    };

    const handleScroll = () => {
      const hovered = document.elementFromPoint(pointRef.current.x, pointRef.current.y);
      refreshModeFromElement(hovered);
    };

    const handleWindowBlur = () => {
      hideCursor();
    };

    const handleWindowMouseOut = (event: MouseEvent) => {
      if (event.relatedTarget === null) {
        hideCursor();
      }
    };

    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        root.classList.add('custom-cursor-enabled');
        return;
      }

      root.classList.remove('custom-cursor-enabled');
      hideCursor();
    };

    document.addEventListener('pointermove', handlePointer, true);
    document.addEventListener('pointerdown', handlePointer, true);
    document.addEventListener('pointerover', handlePointer, true);
    document.addEventListener('scroll', handleScroll, true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('mouseout', handleWindowMouseOut);
    media.addEventListener('change', handleMediaChange);

    return () => {
      document.removeEventListener('pointermove', handlePointer, true);
      document.removeEventListener('pointerdown', handlePointer, true);
      document.removeEventListener('pointerover', handlePointer, true);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('mouseout', handleWindowMouseOut);
      media.removeEventListener('change', handleMediaChange);
      root.classList.remove('custom-cursor-enabled');

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      data-visible={isVisible && mode !== 'text'}
      data-interactive={mode === 'interactive'}
      className="cursor-overlay fixed left-0 top-0 z-[200] size-12 pointer-events-none"
    >
      <svg
        viewBox="0 0 395 395"
        className="size-full"
        fill="none"
        shapeRendering="geometricPrecision"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M178.983 389.5L117.672 377.046L6 5.5L387 157.024V215.143L262.19 250.43L178.983 389.5Z"
          fill="black"
        />
        <path
          d="M59 54.5L146.576 327.5L218.826 204.546L348 164.95L59 54.5Z"
          data-cursor-fill=""
        />
        <path
          d="M146.671 329.5L59 54.5L219 204.5L146.671 329.5Z"
          data-cursor-fill=""
        />
      </svg>
    </div>
  );
}
