import { Signal, computed, signal } from '@angular/core';

export interface ColumnDef<T> {
  readonly key: string;
  readonly label: string;
  readonly value: (row: T) => string;
  readonly sortValue?: (row: T) => string | number;
  readonly filterable?: boolean;
  readonly sortable?: boolean;
}

type SortDirection = 'asc' | 'desc';
interface SortEntry {
  readonly key: string;
  readonly direction: SortDirection;
}

export class TableState<T> {
  private readonly sortEntries = signal<readonly SortEntry[]>([]);
  private readonly filters = signal<ReadonlyMap<string, ReadonlySet<string>>>(new Map());

  constructor(
    private readonly rows: Signal<readonly T[]>,
    private readonly columns: readonly ColumnDef<T>[],
  ) {}

  readonly hasAnyFilter = computed(() => this.filters().size > 0);
  readonly hasAnySort = computed(() => this.sortEntries().length > 0);

  /** 1-based position in the sort priority, or null if this column isn't sorted. */
  sortPriority(key: string): number | null {
    const index = this.sortEntries().findIndex((e) => e.key === key);
    return index === -1 ? null : index + 1;
  }

  sortDirectionFor(key: string): SortDirection | null {
    return this.sortEntries().find((e) => e.key === key)?.direction ?? null;
  }

  uniqueValues(key: string): readonly string[] {
    const column = this.columns.find((c) => c.key === key);
    if (!column) return [];
    const values = new Set(this.rows().map((row) => column.value(row)));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  activeFilterFor(key: string): ReadonlySet<string> | null {
    return this.filters().get(key) ?? null;
  }

  isFiltered(key: string): boolean {
    return this.filters().has(key);
  }

  setFilter(key: string, values: ReadonlySet<string>): void {
    const next = new Map(this.filters());
    next.set(key, values);
    this.filters.set(next);
  }

  clearFilter(key: string): void {
    const next = new Map(this.filters());
    next.delete(key);
    this.filters.set(next);
  }

  clearAllFilters(): void {
    this.filters.set(new Map());
  }

  /** Click-to-add, click-to-cycle-direction, click-to-remove — progressive multi-column sort. */
  toggleSort(key: string): void {
    const entries = this.sortEntries();
    const index = entries.findIndex((e) => e.key === key);

    if (index === -1) {
      this.sortEntries.set([...entries, { key, direction: 'asc' }]);
      return;
    }

    const entry = entries[index];
    if (entry.direction === 'asc') {
      const next = [...entries];
      next[index] = { key, direction: 'desc' };
      this.sortEntries.set(next);
      return;
    }

    this.sortEntries.set(entries.filter((e) => e.key !== key));
  }

  clearSort(key?: string): void {
    if (key === undefined) {
      this.sortEntries.set([]);
      return;
    }
    this.sortEntries.set(this.sortEntries().filter((e) => e.key !== key));
  }

  readonly rowsView = computed<readonly T[]>(() => {
    let result = this.rows();

    for (const [key, allowed] of this.filters()) {
      const column = this.columns.find((c) => c.key === key);
      if (!column) continue;
      result = result.filter((row) => allowed.has(column.value(row)));
    }

    const entries = this.sortEntries();
    if (entries.length > 0) {
      const resolved = entries
        .map((e) => ({ ...e, column: this.columns.find((c) => c.key === e.key) }))
        .filter((e) => e.column !== undefined) as Array<SortEntry & { column: ColumnDef<T> }>;

      if (resolved.length > 0) {
        result = [...result].sort((a, b) => {
          for (const { column, direction } of resolved) {
            const getValue = column.sortValue ?? column.value;
            const av = getValue(a);
            const bv = getValue(b);
            const cmp = av < bv ? -1 : av > bv ? 1 : 0;
            if (cmp !== 0) {
              return direction === 'asc' ? cmp : -cmp;
            }
          }
          return 0;
        });
      }
    }

    return result;
  });
}