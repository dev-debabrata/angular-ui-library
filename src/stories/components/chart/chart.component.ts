import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

export const CHART_TYPES = ['line', 'area', 'bar', 'pie', 'doughnut'] as const;
export type ChartType = (typeof CHART_TYPES)[number];

export interface ChartDataset {
  label: string;
  /** One value per label */
  data: number[];
  /** Any CSS color. Defaults to the theme's --ui-chart-N colors in order */
  color?: string;
}

type Point = readonly [number, number];

/** Space for the axis labels around the plot */
const PAD = { top: 12, right: 12, bottom: 28, left: 48 };

/** 1, 2, 2.5 or 5 times a power of ten, so axis ticks are round numbers */
function niceStep(raw: number) {
  const power = 10 ** Math.floor(Math.log10(raw));
  return ([1, 2, 2.5, 5].find((f) => raw / power <= f) ?? 10) * power;
}

/** Curve through the points (Catmull-Rom as cubic Béziers) */
function smoothPath(p: Point[]) {
  if (p.length < 3) return `M${p.join('L')}`;
  let d = `M${p[0]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, e] = [p[i - 1] ?? p[i], p[i], p[i + 1], p[i + 2] ?? p[i + 1]];
    d += `C${b[0] + (c[0] - a[0]) / 6},${b[1] + (c[1] - a[1]) / 6} ${c[0] - (e[0] - b[0]) / 6},${c[1] - (e[1] - b[1]) / 6} ${c}`;
  }
  return d;
}

/** Bar with 4px rounded top corners and a square base */
function barPath(x: number, y: number, w: number, h: number, round: boolean) {
  const r = round ? Math.min(4, w / 2, h) : 0;
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

/** Pie slice, or a ring segment when `inner` > 0 */
function arcPath(cx: number, cy: number, r: number, inner: number, a0: number, a1: number) {
  a1 = Math.min(a1, a0 + Math.PI * 2 - 1e-4);
  const at = (radius: number, angle: number) =>
    `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return inner
    ? `M${at(r, a0)}A${r},${r} 0 ${large} 1 ${at(r, a1)}L${at(inner, a1)}A${inner},${inner} 0 ${large} 0 ${at(inner, a0)}Z`
    : `M${cx},${cy}L${at(r, a0)}A${r},${r} 0 ${large} 1 ${at(r, a1)}Z`;
}

/** SVG chart without dependencies: line, area, bar (grouped or stacked), pie and doughnut */
@Component({
  selector: 'nex-chart',
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class ChartComponent {
  /** Chart type */
  readonly type = input<ChartType>('line');

  /** Category names along the x axis (or the slice names for pie/doughnut) */
  readonly labels = input<string[]>([]);

  /** Series to draw. Pie and doughnut use the first one */
  readonly datasets = input<ChartDataset[]>([]);

  /** Height in pixels. The width fills the container */
  readonly height = input(260, { transform: numberAttribute });

  /** Stack bar series on top of each other */
  readonly stacked = input(false, { transform: booleanAttribute });

  /** Curved lines (line and area) */
  readonly smooth = input(false, { transform: booleanAttribute });

  /** Horizontal grid lines */
  readonly showGrid = input(true, { transform: booleanAttribute });

  /** Legend below the chart (shown for two or more series, and for pie/doughnut) */
  readonly showLegend = input(true, { transform: booleanAttribute });

  /** Accessible name, also the caption of the screen-reader data table */
  readonly ariaLabel = input('Chart');

  /** Formats values on the axis, tooltip and doughnut center */
  readonly format = input<(value: number) => string>((value) => value.toLocaleString());

  protected readonly width = signal(600);
  /** Hovered label index (cartesian) or slice index (pie) */
  protected readonly hover = signal<number | null>(null);

  protected readonly cartesian = computed(() => !['pie', 'doughnut'].includes(this.type()));

  protected readonly count = computed(() =>
    Math.max(this.labels().length, ...this.datasets().map((d) => d.data.length), 0),
  );

  protected readonly plot = computed(() => {
    const n = Math.max(this.count(), 1);
    const sets = this.datasets();
    const stack = this.stacked() && this.type() === 'bar';
    const values = stack
      ? Array.from({ length: n }, (_, i) =>
          sets.reduce((sum, d) => sum + Math.max(0, d.data[i] ?? 0), 0),
        )
      : sets.flatMap((d) => d.data);
    const max = Math.max(0, ...values);
    const min = Math.min(0, ...sets.flatMap((d) => d.data));
    const step = niceStep((max - min) / 4 || 1);
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step || step;
    const [x0, x1, y0, y1] = [
      PAD.left,
      this.width() - PAD.right,
      PAD.top,
      this.height() - PAD.bottom,
    ];
    const y = (v: number) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
    const band = (x1 - x0) / n;
    const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
    return { x0, x1, y0, y1, y, band, base: y(0), ticks, cx: (i: number) => x0 + band * (i + 0.5) };
  });

  protected readonly series = computed(() => {
    const p = this.plot();
    return this.datasets().map((d, i) => {
      const points = d.data.map((v, j): Point => [p.cx(j), p.y(v)]);
      const line = this.smooth() ? smoothPath(points) : `M${points.join('L')}`;
      const area = points.length
        ? `${line}L${points.at(-1)![0]},${p.base}L${points[0][0]},${p.base}Z`
        : '';
      return { color: this.color(i), line, area, points };
    });
  });

  /** Bars are at most 24px wide with a 2px gap between neighbours and between stacked segments */
  protected readonly bars = computed(() => {
    const p = this.plot();
    const sets = this.datasets();
    const stack = this.stacked();
    const perGroup = stack ? 1 : sets.length;
    const w = Math.max(2, Math.min(24, (p.band * 0.72 - (perGroup - 1) * 2) / perGroup));
    return Array.from({ length: this.count() }, (_, j) => {
      const top = stack ? sets.reduce((last, d, i) => ((d.data[j] ?? 0) > 0 ? i : last), -1) : -1;
      let sum = 0;
      return sets.map((d, i) => {
        const value = Math.max(0, d.data[j] ?? 0);
        const from = stack ? sum : 0;
        sum += stack ? value : 0;
        const x = p.cx(j) - (stack ? w / 2 : (perGroup * w + (perGroup - 1) * 2) / 2 - i * (w + 2));
        const y = p.y(from + value);
        const h = Math.max(0, p.y(from) - y - (from > 0 ? 2 : 0));
        return { d: barPath(x, y, w, h, !stack || i === top), color: this.color(i) };
      });
    }).flat();
  });

  protected readonly total = computed(() =>
    (this.datasets()[0]?.data ?? []).reduce((sum, v) => sum + Math.max(0, v), 0),
  );

  protected readonly slices = computed(() => {
    const size = this.height();
    const [cx, cy, r] = [this.width() / 2, size / 2, size / 2 - 4];
    const inner = this.type() === 'doughnut' ? r * 0.62 : 0;
    const total = this.total() || 1;
    let angle = -Math.PI / 2;
    return (this.datasets()[0]?.data ?? []).map((value, i) => {
      const sweep = (Math.max(0, value) / total) * Math.PI * 2;
      const mid = angle + sweep / 2;
      const d = arcPath(cx, cy, r, inner, angle, angle + sweep);
      angle += sweep;
      const at = (r + inner) / 2 || r * 0.6;
      return {
        d,
        value,
        percent: value / total,
        color: this.color(i),
        x: cx + at * Math.cos(mid),
        y: cy + at * Math.sin(mid),
      };
    });
  });

  protected readonly legend = computed(() =>
    this.cartesian()
      ? this.datasets().map((d, i) => ({ label: d.label, color: this.color(i) }))
      : this.labels().map((label, i) => ({ label, color: this.color(i) })),
  );

  protected readonly tooltip = computed(() => {
    const i = this.hover();
    if (i === null) return null;
    const format = this.format();
    const title = this.labels()[i] ?? '';
    if (!this.cartesian()) {
      const s = this.slices()[i];
      const rows = [
        {
          label: this.datasets()[0]?.label ?? '',
          color: s.color,
          value: `${format(s.value)} (${Math.round(s.percent * 100)}%)`,
        },
      ];
      return { title, rows, x: s.x, y: s.y };
    }
    const p = this.plot();
    const rows = this.datasets().map((d, k) => ({
      label: d.label,
      color: this.color(k),
      value: format(d.data[i] ?? 0),
    }));
    const top = Math.min(...this.datasets().map((d) => p.y(d.data[i] ?? 0)));
    return { title, rows, x: Math.min(Math.max(p.cx(i), 90), this.width() - 90), y: top };
  });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) =>
        this.width.set(Math.round(entry.contentRect.width) || 600),
      );
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected color(i: number) {
    return (this.cartesian() && this.datasets()[i]?.color) || `var(--ui-chart-${(i % 8) + 1})`;
  }

  /** A series may be shorter than the labels */
  protected valueAt(dataset: ChartDataset, index: number) {
    return dataset.data[index] ?? 0;
  }

  /** Cartesian hover: the label band under the pointer */
  protected onMove(event: PointerEvent) {
    const p = this.plot();
    const i = Math.floor((event.offsetX - p.x0) / p.band);
    this.hover.set(Math.min(Math.max(i, 0), this.count() - 1));
  }
}
