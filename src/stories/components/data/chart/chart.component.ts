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

export const CHART_TYPES = [
  'line',
  'area',
  'bar',
  'pie',
  'doughnut',
  'radar',
  'radial',
  'gauge',
  'sparkline',
] as const;
export type ChartType = (typeof CHART_TYPES)[number];

export interface ChartDataset {
  label: string;
  /** One value per label */
  data: number[];
  /** Any CSS color. Defaults to the theme's --ui-chart-N colors in order */
  color?: string;
}

type Point = readonly [number, number];

/** Types that draw the first series, colored per label */
const PART_TYPES: readonly ChartType[] = ['pie', 'doughnut', 'radial', 'gauge'];

/** Space for the axis labels around the plot */
const PAD = { top: 12, right: 12, bottom: 28, left: 48 };

let nextId = 0;

/** Point at angle `a` on a circle */
function polar(cx: number, cy: number, r: number, a: number): Point {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

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

/** Arc drawn as a stroke (radial rings and the gauge) */
function strokeArc(cx: number, cy: number, r: number, a0: number, a1: number) {
  a1 = Math.min(a1, a0 + Math.PI * 2 - 1e-4);
  return `M${polar(cx, cy, r, a0)}A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${polar(cx, cy, r, a1)}`;
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

/** SVG chart without dependencies: line, area, bar, pie, doughnut, radar, radial, gauge and sparkline */
@Component({
  selector: 'np-chart',
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class ChartComponent {
  /** Chart type */
  readonly type = input<ChartType>('line');

  /** Category names along the x axis (or the slice names for pie/doughnut) */
  readonly labels = input<string[]>([]);

  /** Series to draw. Pie, doughnut and radial use the first one, gauge its first value */
  readonly datasets = input<ChartDataset[]>([]);

  /** Height in pixels. The width fills the container */
  readonly height = input(260, { transform: numberAttribute });

  /** Stack bar series on top of each other */
  readonly stacked = input(false, { transform: booleanAttribute });

  /** Curved lines (line and area) */
  readonly smooth = input(false, { transform: booleanAttribute });

  /** Fill under lines with the series color fading to transparent (area, line and sparkline) */
  readonly gradient = input(false, { transform: booleanAttribute });

  /** Value labels at the bar tips (the stack total on stacked bars) */
  readonly showValues = input(false, { transform: booleanAttribute });

  /** Draw the chart in on first render (off with reduced motion) */
  readonly animate = input(false, { transform: booleanAttribute });

  /** Full-scale value of the radial rings and the gauge */
  readonly max = input(100, { transform: numberAttribute });

  /** Horizontal grid lines (rings on radar) */
  readonly showGrid = input(true, { transform: booleanAttribute });

  /** Legend below the chart (shown for two or more series, and for pie, doughnut and radial) */
  readonly showLegend = input(true, { transform: booleanAttribute });

  /** Accessible name, also the caption of the screen-reader data table */
  readonly ariaLabel = input('Chart');

  /** Formats values on the axis, tooltip, labels and doughnut/gauge center */
  readonly format = input<(value: number) => string>((value) => value.toLocaleString());

  protected readonly uid = `np-chart-${nextId++}-`;
  protected readonly width = signal(600);
  /** Hovered label index, or slice/ring index */
  protected readonly hover = signal<number | null>(null);

  protected readonly byLabel = computed(() => PART_TYPES.includes(this.type()));
  protected readonly cartesian = computed(() => !this.byLabel() && this.type() !== 'radar');

  protected readonly count = computed(() =>
    Math.max(this.labels().length, ...this.datasets().map((d) => d.data.length), 0),
  );

  protected readonly plot = computed(() => {
    const n = Math.max(this.count(), 1);
    const sets = this.datasets();
    const stack = this.stacked() && this.type() === 'bar';
    const all = sets.flatMap((d) => d.data);
    const values = stack
      ? Array.from({ length: n }, (_, i) =>
          sets.reduce((sum, d) => sum + Math.max(0, d.data[i] ?? 0), 0),
        )
      : all;
    const max = Math.max(0, ...values);
    const min = Math.min(0, ...all);
    const step = niceStep((max - min) / 4 || 1);
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step || step;
    const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
    // A sparkline has no axes (6px for its end dot) and fits its own range
    const spark = this.type() === 'sparkline';
    const [from, to] = spark ? [Math.min(...all), Math.max(...all)] : [lo, hi];
    const [x0, x1, y0, y1] = spark
      ? [6, this.width() - 6, 6, this.height() - 6]
      : [PAD.left, this.width() - PAD.right, PAD.top, this.height() - PAD.bottom];
    const y = (v: number) => y1 - ((v - from) / (to - from || 1)) * (y1 - y0);
    const band = (x1 - x0) / n;
    const base = y(Math.min(Math.max(0, from), to));
    return { x0, x1, y0, y1, y, band, base, ticks, cx: (i: number) => x0 + band * (i + 0.5) };
  });

  /** Lines and fills; on radar a closed shape per series */
  protected readonly series = computed(() => {
    const p = this.plot();
    const radar = this.type() === 'radar' && this.radar();
    return this.datasets().map((d, i) => {
      const points = radar
        ? radar.spokes.map((_, j) => radar.at(j, Math.max(0, d.data[j] ?? 0)))
        : d.data.map((v, j): Point => [p.cx(j), p.y(v)]);
      const line =
        this.smooth() && !radar ? smoothPath(points) : `M${points.join('L')}${radar ? 'Z' : ''}`;
      const area = radar
        ? line
        : points.length
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
    const format = this.format();
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
        const path = barPath(x, y, w, h, !stack || i === top);
        const text = (stack ? i === top : value > 0) ? format(stack ? sum : value) : '';
        return { d: path, color: this.color(i), x: x + w / 2, y, text };
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
      const [x, y] = polar(cx, cy, (r + inner) / 2 || r * 0.6, mid);
      return { d, value, percent: value / total, color: this.color(i), x, y };
    });
  });

  /** Radial rings (outside in) or the gauge's half ring (first value), filled up to `max` */
  protected readonly rings = computed(() => {
    const gauge = this.type() === 'gauge';
    const values = (this.datasets()[0]?.data ?? []).slice(0, gauge ? 1 : undefined);
    const [w, h] = [this.width(), this.height()];
    const outer = gauge ? Math.min(w / 2 - 16, h - 48) : h / 2 - 4;
    const n = values.length || 1;
    const width = Math.max(4, Math.min(24, gauge ? outer * 0.2 : (outer * 0.7) / n - 4));
    const [cx, cy] = [w / 2, gauge ? (h + outer) / 2 - 8 : h / 2];
    const [a0, sweep] = gauge ? [Math.PI, Math.PI] : [-Math.PI / 2, Math.PI * 2];
    return values.map((value, i) => {
      const r = outer - width / 2 - i * (width + 4);
      const percent = Math.min(Math.max(value / (this.max() || 1), 0), 1);
      const [x, y] = polar(cx, cy, r, a0 + sweep * percent);
      const track = strokeArc(cx, cy, r, a0, a0 + sweep);
      const d = percent ? strokeArc(cx, cy, r, a0, a0 + sweep * percent) : '';
      return { r, cx, cy, width, value, percent, x, y, track, d, color: this.color(i) };
    });
  });

  /** Radar: one spoke per label and rings at round ticks */
  protected readonly radar = computed(() => {
    const n = Math.max(this.count(), 1);
    const [cx, cy, r] = [this.width() / 2, this.height() / 2, this.height() / 2 - 28];
    // The plot's round ticks above zero
    const ticks = this.plot().ticks.filter((t) => t > 0);
    const hi = ticks.at(-1)!;
    const at = (i: number, v: number) =>
      polar(cx, cy, (r * v) / hi, (i / n) * Math.PI * 2 - Math.PI / 2);
    const spokes = Array.from({ length: n }, (_, i) => {
      const [x, y] = at(i, hi * 1.1);
      const anchor = Math.abs(x - cx) < 1 ? 'middle' : x > cx ? 'start' : 'end';
      return { end: at(i, hi), x, y, anchor };
    });
    const rings = ticks.map((tick) => ({
      tick,
      y: cy - (r * tick) / hi,
      d: `M${spokes.map((_, i) => at(i, tick)).join('L')}Z`,
    }));
    return { cx, cy, at, spokes, rings };
  });

  protected readonly legend = computed(() =>
    this.byLabel()
      ? this.labels().map((label, i) => ({ label, color: this.color(i) }))
      : this.datasets().map((d, i) => ({ label: d.label, color: this.color(i) })),
  );

  protected readonly tooltip = computed(() => {
    const i = this.hover();
    if (i === null) return null;
    const format = this.format();
    const title = this.labels()[i] ?? '';
    if (this.byLabel()) {
      const s = (['pie', 'doughnut'].includes(this.type()) ? this.slices() : this.rings())[i];
      if (!s) return null;
      const rows = [
        {
          label: this.datasets()[0]?.label ?? '',
          color: s.color,
          value: `${format(s.value)} (${Math.round(s.percent * 100)}%)`,
        },
      ];
      return { title, rows, x: s.x, y: s.y };
    }
    const rows = this.datasets().map((d, k) => ({
      label: d.label,
      color: this.color(k),
      value: format(d.data[i] ?? 0),
    }));
    // Above the topmost point (a missing value sits on the baseline)
    const p = this.plot();
    const points = this.series().map((s) => s.points[i] ?? [p.cx(i), p.base]);
    const [x, y] = points.reduce((a, b) => (b[1] < a[1] ? b : a), [p.cx(i), Infinity]);
    return { title, rows, x: Math.min(Math.max(x, 90), this.width() - 90), y };
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
    return (!this.byLabel() && this.datasets()[i]?.color) || `var(--ui-chart-${(i % 8) + 1})`;
  }

  /** A series may be shorter than the labels */
  protected valueAt(dataset: ChartDataset, index: number) {
    return dataset.data[index] ?? 0;
  }

  /** Hover: the label band under the pointer, or on radar the nearest spoke */
  protected onMove({ offsetX: x, offsetY: y }: PointerEvent) {
    const [n, p] = [this.count(), this.plot()];
    const angle = Math.atan2(y - this.height() / 2, x - this.width() / 2) / Math.PI + 0.5;
    const i =
      this.type() === 'radar'
        ? Math.round((angle * n) / 2 + n) % n
        : Math.floor((x - p.x0) / p.band);
    this.hover.set(Math.min(Math.max(i, 0), n - 1));
  }
}
