import { Component, computed, input, linkedSignal, model, output } from '@angular/core';

import type { TreeNode } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

export interface TreeTableColumn {
  /** Property name in each node's `data` object */
  field: string;
  /** Text shown in the header cell */
  header: string;
}

/** Keys of every node in the tree whose `expanded` flag is set */
const expandedKeysOf = (nodes: TreeNode[]): string[] =>
  nodes.flatMap((n) => [...(n.expanded ? [n.key] : []), ...expandedKeysOf(n.children ?? [])]);

@Component({
  selector: 'np-tree-table',
  imports: [IconComponent],
  templateUrl: './tree-table.html',
  styleUrl: './tree-table.css',
})
export class TreeTableComponent {
  /** Root nodes. Each row reads its cells from `node.data[column.field]` */
  readonly value = input<TreeNode[]>([]);

  /** Column definitions. The first column shows the indentation and expand toggle */
  readonly columns = input<TreeTableColumn[]>([]);

  /** Set to 'single' to highlight one row on click */
  readonly selectionMode = input<'single' | null>(null);

  /** Selected node. Supports [(selection)] two-way binding */
  readonly selection = model<TreeNode | null>(null);

  /** Text shown when there are no rows */
  readonly emptyMessage = input('No data available');

  /** Emits the node that was selected */
  readonly nodeSelect = output<TreeNode>();

  /** Emits the node that was expanded */
  readonly nodeExpand = output<TreeNode>();

  /** Emits the node that was collapsed */
  readonly nodeCollapse = output<TreeNode>();

  /** Keys of expanded nodes. Reset from `node.expanded` whenever `value` changes */
  protected readonly expandedKeys = linkedSignal(() => new Set(expandedKeysOf(this.value())));

  /** The tree flattened into the rows currently visible (children of collapsed nodes are skipped) */
  protected readonly rows = computed(() => {
    const expanded = this.expandedKeys();
    /** Each visible row: the node plus its depth, used for indentation */
    const rows: { node: TreeNode; level: number }[] = [];
    const walk = (nodes: TreeNode[], level: number) => {
      for (const node of nodes) {
        rows.push({ node, level });
        if (node.children && expanded.has(node.key)) walk(node.children, level + 1);
      }
    };
    walk(this.value(), 0);
    return rows;
  });

  protected cell(node: TreeNode, field: string) {
    return (node.data as Record<string, unknown> | undefined)?.[field] ?? '';
  }

  protected isExpanded(node: TreeNode) {
    return this.expandedKeys().has(node.key);
  }

  protected toggle(node: TreeNode) {
    const expand = !this.isExpanded(node);
    this.expandedKeys.update((keys) => {
      const next = new Set(keys);
      next[expand ? 'add' : 'delete'](node.key);
      return next;
    });
    (expand ? this.nodeExpand : this.nodeCollapse).emit(node);
  }

  protected select(node: TreeNode) {
    if (this.selectionMode() !== 'single' || node.selectable === false || this.isSelected(node))
      return;
    this.selection.set(node);
    this.nodeSelect.emit(node);
  }

  protected isSelected(node: TreeNode) {
    return this.selection()?.key === node.key;
  }
}
