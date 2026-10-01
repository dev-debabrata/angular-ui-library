/** One animation on the NexLottie page */
export interface GalleryAnimation {
  /** File name in src/stories/nexlottie/files, without .json */
  name: string;
  /** Parsed Lottie JSON (meta.cat and meta.bg are optional: category and card background) */
  data?: { meta?: { bg?: string; cat?: string } };
  /** URL of a pasted link (its JSON is loaded into data) */
  src?: string;
}

export function categoryOf(a: GalleryAnimation) {
  return a.src ? 'From link' : (a.data?.meta?.cat ?? 'Other');
}

/** True for dark #rrggbb backgrounds, so labels on them switch to a light color */
export function isDarkBg(bg: string | undefined) {
  const m = bg?.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return false;
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 96;
}
