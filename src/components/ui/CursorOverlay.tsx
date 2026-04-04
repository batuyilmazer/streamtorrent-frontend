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
const CURSOR_EASING = 0.32;
const CURSOR_SNAP_DISTANCE = 0.35;
const ARROW_CURSOR_SIZE = 48;
const TEXT_CURSOR_VIEWBOX = { width: 266, height: 423 };
const TEXT_CURSOR_HEIGHT = 48;
const TEXT_CURSOR_WIDTH =
  (TEXT_CURSOR_VIEWBOX.width / TEXT_CURSOR_VIEWBOX.height) * TEXT_CURSOR_HEIGHT;

function getCursorMetrics(mode: CursorMode) {
  if (mode === 'text') {
    return {
      width: TEXT_CURSOR_WIDTH,
      height: TEXT_CURSOR_HEIGHT,
      hotX: TEXT_CURSOR_WIDTH / 2,
      hotY: TEXT_CURSOR_HEIGHT / 2,
    };
  }

  return {
    width: ARROW_CURSOR_SIZE,
    height: ARROW_CURSOR_SIZE,
    hotX: 1,
    hotY: 1,
  };
}

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
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });
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

    const applyPosition = (x: number, y: number, mode = modeRef.current) => {
      if (!cursorRef.current) {
        return;
      }

      const { hotX, hotY } = getCursorMetrics(mode);
      cursorRef.current.style.transform = `translate3d(${x - hotX}px, ${y - hotY}px, 0)`;
    };

    const syncPosition = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      const deltaX = target.x - current.x;
      const deltaY = target.y - current.y;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance <= CURSOR_SNAP_DISTANCE) {
        current.x = target.x;
        current.y = target.y;
        applyPosition(current.x, current.y);
        frameRef.current = null;
        return;
      }

      current.x += deltaX * CURSOR_EASING;
      current.y += deltaY * CURSOR_EASING;
      applyPosition(current.x, current.y);
      frameRef.current = window.requestAnimationFrame(syncPosition);
    };

    const queuePosition = (x: number, y: number) => {
      targetRef.current = { x, y };

      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(syncPosition);
    };

    const syncImmediately = (x: number, y: number) => {
      targetRef.current = { x, y };
      currentRef.current = { x, y };
      applyPosition(x, y);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
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
      applyPosition(currentRef.current.x, currentRef.current.y, nextMode);
    };

    const handlePointer = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        return;
      }

      const nextVisible = true;
      const wasVisible = visibleRef.current;
      updateVisible(true);
      updateMode(resolveCursorMode(event.target));

      if (!wasVisible && nextVisible) {
        syncImmediately(event.clientX, event.clientY);
        return;
      }

      queuePosition(event.clientX, event.clientY);
    };

    const hideCursor = () => {
      updateVisible(false);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    const refreshModeFromElement = (element: Element | null) => {
      updateMode(resolveCursorMode(element));
    };

    const handleScroll = () => {
      const hovered = document.elementFromPoint(targetRef.current.x, targetRef.current.y);
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

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
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
      data-visible={isVisible}
      data-interactive={mode === 'interactive'}
      data-mode={mode}
      className="cursor-overlay fixed left-0 top-0 z-[200] pointer-events-none"
      style={{
        width: mode === 'text' ? `${TEXT_CURSOR_WIDTH}px` : `${ARROW_CURSOR_SIZE}px`,
        height: mode === 'text' ? `${TEXT_CURSOR_HEIGHT}px` : `${ARROW_CURSOR_SIZE}px`,
      }}
    >
      {mode === 'text' ? (
        <svg
          viewBox="0 0 266 423"
          className="size-full"
          fill="none"
          shapeRendering="geometricPrecision"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M266 103.5V26.5L237 0H0V75L28.5 103.5H81.5V320H0V395L28.5 423H266V346L237 320H184V103.5H266Z"
            fill="black"
          />
          <path
            d="M233 31.5H34V70H113.5V350.5H34V389H233V350.5H154V70H233V31.5Z"
            fill="#F7F2E5"
          />
          <path
            d="M34 70V32.5L52.5 51.5H130.5V366L113.5 350.5V70H34Z"
            fill="#DDD3BA"
          />
          <path d="M154 70V51.5H216L232.5 70H154Z" fill="#DDD3BA" />
          <path d="M34 389V350.5L52.5 370.5H216L232.5 389H34Z" fill="#DDD3BA" />
        </svg>
      ) : (
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
      )}
    </div>
  );
}
