import type { Action } from 'svelte/action';

/**
 * Container action: ArrowUp / ArrowDown move focus between the text inputs
 * marked with `data-nav` inside the node, in DOM order. Left/Right still move
 * the caret within a field. Attach to a wrapper; tag each navigable input with
 * `data-nav`.
 */
export const arrowNav: Action<HTMLElement> = (node) => {
  function onKeydown(e: KeyboardEvent) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const target = e.target as HTMLElement;
    if (!target.matches?.('[data-nav]')) return;

    const inputs = Array.from(
      node.querySelectorAll<HTMLInputElement>('[data-nav]'),
    );
    const idx = inputs.indexOf(target as HTMLInputElement);
    if (idx === -1) return;

    const next = inputs[e.key === 'ArrowDown' ? idx + 1 : idx - 1];
    if (!next) return;

    e.preventDefault();
    next.focus();
    const len = next.value.length;
    next.setSelectionRange(len, len);
  }

  node.addEventListener('keydown', onKeydown);
  return { destroy: () => node.removeEventListener('keydown', onKeydown) };
};
