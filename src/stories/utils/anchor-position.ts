/** Fixed-position coordinates for a popover anchored to a target element. Shared by popovers and popup menus */
export interface AnchorPosition {
  top: number;
  left: number;
  /** Arrow offset from the popover's left edge */
  arrowLeft: number;
  /** 'below' unless there was no room under the target */
  placement: 'below' | 'above';
}

const GAP = 12;
const MARGIN = 8;

/** Place `popover` below `target` (left-aligned, kept inside the viewport), flipping above when it doesn't fit */
export function anchorPosition(target: Element, popover: HTMLElement): AnchorPosition {
  const t = target.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = popover;

  const left = Math.max(MARGIN, Math.min(t.left, window.innerWidth - width - MARGIN));
  const fitsBelow = t.bottom + GAP + height <= window.innerHeight - MARGIN;
  const fitsAbove = t.top - GAP - height >= MARGIN;
  const placement = fitsBelow || !fitsAbove ? 'below' : 'above';
  const top = placement === 'below' ? t.bottom + GAP : t.top - GAP - height;
  const arrowLeft = Math.max(16, Math.min(t.left + Math.min(t.width / 2, 24) - left, width - 16));

  return { top, left, arrowLeft, placement };
}
