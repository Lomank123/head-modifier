export type OverlaySize = 'compact' | 'scrollable';

const OVERLAY_MIN_HEIGHT: Record<OverlaySize, number> = {
  compact: 320,
  scrollable: 420,
};

/** Bump popup height while a modal is open; restore natural height on close. */
export function setOverlaySize(size: OverlaySize | null): void {
  const body = document.body;

  if (!size) {
    body.style.minHeight = '';
    const main = document.querySelector('main');
    if (main) {
      const h = Math.ceil(main.getBoundingClientRect().height);
      body.style.height = `${h}px`;
      requestAnimationFrame(() => {
        body.style.height = '';
      });
    }
    return;
  }

  const main = document.querySelector('main');
  const mainH = main ? Math.ceil(main.getBoundingClientRect().height) : 0;
  body.style.minHeight = `${Math.max(mainH, OVERLAY_MIN_HEIGHT[size])}px`;
}
