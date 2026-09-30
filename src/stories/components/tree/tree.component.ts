import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import type { TreeNode } from '../../types';
import { IconComponent } from '../icon/icon.component';
import { SearchInputComponent } from '../search-input/search-input.component';

export type TreeSelectionMode = 'single' | 'multiple' | 'checkbox' | null;

/** Node and all of its descendants, depth first */
const flatten = (nodes: TreeNode[]): TreeNode[] =>
  nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);

/** Keys of the nodes (and descendants) matching `test` */
const keysWhere = (nodes: TreeNode[], test: (n: TreeNode) => unknown) =>
  new Set(
    flatten(nodes)
      .filter(test)
      .map((n) => n.key),
  );

@Component({
  selector: 'nex-tree',
  imports: [NgTemplateOutlet, IconComponent, SearchInputComponent],
  templateUrl: './tree.html',
  styleUrl: './tree.css',
})
export class TreeComponent {
  /** Root nodes of the tree */
  readonly value = input<TreeNode[]>([]);

  /** How nodes are selected: one node, several nodes (click toggles), checkboxes, or not at all */
  readonly selectionMode = input<TreeSelectionMode>(null);

  /** Selected node (single) or nodes (multiple/checkbox). Supports [(selection)] two-way binding */
  readonly selection = model<TreeNode | TreeNode[] | null>(null);

  /** Show a search box that filters nodes by label? */
  readonly filter = input(false, { transform: booleanAttribute });

  /** Placeholder text for the search box */
  readonly filterPlaceholder = input('Search...');

  /** Text shown when there are no nodes, or the filter matches none */
  readonly emptyMessage = input('No results found');

  /** Emits the node that was selected or checked */
  readonly nodeSelect = output<TreeNode>();

  /** Emits the node that was unselected or unchecked */
  readonly nodeUnselect = output<TreeNode>();

  /** Emits the node that was expanded */
  readonly nodeExpand = output<TreeNode>();

  /** Emits the node that was collapsed */
  readonly nodeCollapse = output<TreeNode>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Keys of expanded nodes. Reset from `node.expanded` whenever `value` changes */
  protected readonly expandedKeys = linkedSignal(() => keysWhere(this.value(), (n) => n.expanded));
  protected readonly filterText = signal('');

  private readonly selectedNodes = computed(() => {
    const selection = this.selection();
    return Array.isArray(selection) ? selection : selection ? [selection] : [];
  });

  protected readonly selectedKeys = computed(() => new Set(this.selectedNodes().map((n) => n.key)));

  /** Checkbox mode: unchecked parents that have at least one checked descendant */
  protected readonly partialKeys = computed(() => {
    const checked = this.selectedKeys();
    const partial = new Set<string>();
    const visit = (node: TreeNode): boolean => {
      // Visit every child (no short-circuit) so nested partial parents are found too
      const anyChild = (node.children ?? []).map(visit).some(Boolean);
      if (anyChild && !checked.has(node.key)) partial.add(node.key);
      return anyChild || checked.has(node.key);
    };
    this.value().forEach(visit);
    return partial;
  });

  private readonly nodeMap = computed(() => new Map(flatten(this.value()).map((n) => [n.key, n])));

  /** Nodes whose label matches the filter, plus their ancestors so the path stays visible */
  protected readonly visibleNodes = computed(() => {
    const query = this.filterText().trim().toLowerCase();
    const prune = (nodes: TreeNode[]): TreeNode[] =>
      nodes.flatMap((node) => {
        if (node.label?.toLowerCase().includes(query)) return [node];
        const children = prune(node.children ?? []);
        return children.length ? [{ ...node, children }] : [];
      });
    return query ? prune(this.value()) : this.value();
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
    if (!text.trim()) return;
    // Auto-expand the ancestors kept by the filter so matches are visible
    const parents = keysWhere(this.visibleNodes(), (n) => n.children?.length);
    this.expandedKeys.update((keys) => new Set([...keys, ...parents]));
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

  protected checkState(node: TreeNode): 'true' | 'false' | 'mixed' {
    if (this.selectedKeys().has(node.key)) return 'true';
    return this.partialKeys().has(node.key) ? 'mixed' : 'false';
  }

  protected select(visible: TreeNode) {
    // Filtered nodes are pruned copies; work with the original so all descendants are included
    const node = this.nodeMap().get(visible.key) ?? visible;
    const mode = this.selectionMode();
    if (!mode || node.selectable === false) return;
    const selected = this.selectedKeys().has(node.key);

    if (mode === 'single') {
      if (!selected) {
        this.selection.set(node);
        this.nodeSelect.emit(node);
      }
      return;
    }

    const current = this.selectedNodes();
    this.selection.set(
      mode === 'checkbox'
        ? this.toggleCheck(node, !selected)
        : selected
          ? current.filter((n) => n.key !== node.key)
          : [...current, node],
    );
    (selected ? this.nodeUnselect : this.nodeSelect).emit(node);
  }

  /**
   * Checkbox mode: (un)check the node and all its descendants, then recompute every parent
   * so it is checked exactly when all of its children are. Returns the new list of checked nodes.
   */
  private toggleCheck(node: TreeNode, check: boolean): TreeNode[] {
    const keys = new Set(this.selectedKeys());
    for (const n of flatten([node])) keys[check ? 'add' : 'delete'](n.key);
    const sync = (n: TreeNode): boolean => {
      if (n.children?.length) keys[n.children.map(sync).every(Boolean) ? 'add' : 'delete'](n.key);
      return keys.has(n.key);
    };
    this.value().forEach(sync);
    return flatten(this.value()).filter((n) => keys.has(n.key));
  }

  protected onKeydown(event: KeyboardEvent, node: TreeNode) {
    // Tree items are nested, so stop the event from reaching the parent item's handler
    event.stopPropagation();
    const { key } = event;
    if (key === 'Enter' || key === ' ') this.select(node);
    else if (key === 'ArrowRight' || key === 'ArrowLeft') this.toggle(node, key === 'ArrowRight');
    else if (key === 'ArrowDown' || key === 'ArrowUp') {
      // Collapsed children aren't rendered, so DOM order is visible order
      const items = [...this.host.nativeElement.querySelectorAll<HTMLElement>('[role="treeitem"]')];
      const index = items.indexOf(event.currentTarget as HTMLElement);
      items[index + (key === 'ArrowDown' ? 1 : -1)]?.focus();
    } else return;
    event.preventDefault();
  }
}
