import {
  DestroyRef,
  type ElementRef,
  type Signal,
  afterNextRender,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';

/**
 * The first `size` items of `list`, plus `size` more each time the `end` element (placed after the list) comes
 * near the screen, so a long grid renders a screenful first. A new list starts over. Call in an injection context
 */
export function renderInBatches<T>(
  list: Signal<T[]>,
  end: Signal<ElementRef<HTMLElement>>,
  size: number,
): Signal<T[]> {
  const limit = linkedSignal({ source: list, computation: () => size });
  const destroyRef = inject(DestroyRef);
  afterNextRender(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || limit() >= list().length) return;
        limit.update((limit) => limit + size);
        // Observing again reports again, so batches keep coming while the end is still near the screen
        observer.unobserve(entry.target);
        observer.observe(entry.target);
      },
      { rootMargin: '600px' },
    );
    observer.observe(end().nativeElement);
    destroyRef.onDestroy(() => observer.disconnect());
  });
  return computed(() => list().slice(0, limit()));
}
