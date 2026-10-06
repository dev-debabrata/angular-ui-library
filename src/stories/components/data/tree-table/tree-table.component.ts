import {
  Component,
  booleanAttribute,
  computed,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';

import type { Size, TreeNode } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';
import { SearchInputComponent } from '../../form/search-input/search-input.component';

export interface TreeTableColumn {
  /** Property name in each node's `data` object */
  field: string;
  /** Text shown in the header cell */
  header: string;
  /** Text alignment of the column's cells */
  align?: 'left' | 'center' | 'right';
  /** CSS width of the column, e.g. '120px' or '30%' */
  width?: string;
}

/** Looks of the tree table */
export const TREE_TABLE_VARIANTS = [
  'default',
  'striped',
  'bordered',
  'lines',
  'minimal',
  'glass',
] as const;
export type TreeTableVariant = (typeof TREE_TABLE_VARIANTS)[number];

/** Node and all of its descendants, depth first */
const flatten = (nodes: TreeNode[]): TreeNode[] =>
  nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);

/** Keys of the nodes (and descendants) matching `test` */
const keysWhere = (nodes: TreeNode[], test: (n: TreeNode) => unknown) =>
  new Set(flatten(nodes).flatMap((n) => (test(n) ? [n.key] : [])));

@Component({
  selector: 'np-tree-table',
  imports: [IconComponent, SearchInputComponent],
  templateUrl: './tree-table.html',
  styleUrl: './tree-table.css',
})
export class TreeTableComponent {
  /** Root nodes. Each row reads its cells from `node.data[column.field]` */
  readonly value = input<TreeNode[]>([]);
  /** Column definitions. The first column shows the indentation and expand toggle */
  readonly columns = input<TreeTableColumn[]>([]);
  /** Look: default, striped, bordered (column lines), lines (indent guides), minimal (no panel) or glass */
  readonly variant = input<TreeTableVariant>('default');
  /** Row density */
  readonly size = input<Size>('medium');
  /** Max height of the table (e.g. '320px'); the body scrolls under a sticky header */
  readonly scrollHeight = input('');
  /** 'single' highlights one row on click; 'checkbox' adds tri-state checkboxes (a parent checks its children) */
  readonly selectionMode = input<'single' | 'checkbox' | null>(null);
  /** Selected node (single) or checked nodes (checkbox). Supports [(selection)] two-way binding */
  readonly selection = model<TreeNode | TreeNode[] | null>(null);
  /** Show a search box that keeps the rows whose cells match, plus their ancestors */
  readonly filter = input(false, { transform: booleanAttribute });
  /** Placeholder text for the search box */
  readonly filterPlaceholder = input('Search...');
  /** Text shown when there are no rows */
  readonly emptyMessage = input('No data available');
  /** Emits the node that was selected or checked */
  readonly nodeSelect = output<TreeNode>();
  /** Emits the node that was unchecked (checkbox mode) */
  readonly nodeUnselect = output<TreeNode>();
  /** Emits the node that was expanded */
  readonly nodeExpand = output<TreeNode>();
  /** Emits the node that was collapsed */
  readonly nodeCollapse = output<TreeNode>();

  /** Keys of expanded nodes. Reset from `node.expanded` whenever `value` changes */
  protected readonly expandedKeys = linkedSignal(() => keysWhere(this.value(), (n) => n.expanded));
  protected readonly filterText = signal('');

  protected readonly selectedKeys = computed(
    () => new Set([this.selection() ?? []].flat().map((n) => n.key)),
  );

  /** Keys of the rows kept by the filter (matches and their ancestors), or null when not filtering */
  private readonly matchKeys = computed(() => {
    const query = this.filterText().trim().toLowerCase();
    if (!query) return null;
    const keys = new Set<string>();
    const visit = (node: TreeNode): boolean => {
      // Visit every child (no short-circuit) so all matches are found
      const hit =
        (node.children ?? []).map(visit).some(Boolean) ||
        this.columns().some((c) => String(this.cell(node, c.field)).toLowerCase().includes(query));
      if (hit) keys.add(node.key);
      return hit;
    };
    this.value().forEach(visit);
    return keys;
  });

  /** The tree flattened into the rows currently visible (children of collapsed nodes are skipped) */
  protected readonly rows = computed(() => {
    const expanded = this.expandedKeys();
    const kept = this.matchKeys();
    /** Each visible row: the node plus its depth, used for indentation */
    const rows: { node: TreeNode; level: number }[] = [];
    const walk = (nodes: TreeNode[], level: number) => {
      for (const node of nodes) {
        if (kept && !kept.has(node.key)) continue;
        rows.push({ node, level });
        if (node.children && expanded.has(node.key)) walk(node.children, level + 1);
      }
    };
    walk(this.value(), 0);
    return rows;
  });

  /** Expand every node */
  expandAll() {
    this.expandedKeys.set(keysWhere(this.value(), (n) => n.children?.length));
  }

  /** Collapse every node */
  collapseAll() {
    this.expandedKeys.set(new Set());
  }

  protected onFilter(text: string) {
    this.filterText.set(text);
    // Open the ancestors kept by the filter so matches are visible
    this.expandedKeys.update((keys) => new Set([...keys, ...(this.matchKeys() ?? [])]));
  }

  protected cell(node: TreeNode, field: string) {
    return (node.data as Record<string, unknown> | undefined)?.[field] ?? '';
  }

  protected isExpanded(node: TreeNode) {
    return this.expandedKeys().has(node.key);
  }

  protected toggle(node: TreeNode, expand = !this.isExpanded(node)) {
    if (!node.children?.length || expand === this.isExpanded(node)) return;
    this.expandedKeys.update((keys) => {
      const next = new Set(keys);
      next[expand ? 'add' : 'delete'](node.key);
      return next;
    });
    (expand ? this.nodeExpand : this.nodeCollapse).emit(node);
  }

  protected checkState(node: TreeNode) {
    const keys = this.selectedKeys();
    if (keys.has(node.key)) return 'true';
    return flatten(node.children ?? []).some((n) => keys.has(n.key)) ? 'mixed' : 'false';
  }

  protected select(node: TreeNode) {
    const mode = this.selectionMode();
    if (!mode || node.selectable === false) return;
    const selected = this.selectedKeys().has(node.key);
    if (mode === 'single') {
      if (selected) return;
      this.selection.set(node);
    } else {
      // Checkbox: (un)check the node and its descendants, then check each parent exactly when all its children are
      const keys = new Set(this.selectedKeys());
      for (const n of flatten([node])) keys[selected ? 'delete' : 'add'](n.key);
      const sync = (n: TreeNode): boolean => {
        if (n.children?.length) keys[n.children.map(sync).every(Boolean) ? 'add' : 'delete'](n.key);
        return keys.has(n.key);
      };
      this.value().forEach(sync);
      this.selection.set(flatten(this.value()).filter((n) => keys.has(n.key)));
    }
    (selected ? this.nodeUnselect : this.nodeSelect).emit(node);
  }
}
