import { Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-column-filter',
  imports: [],
  templateUrl: './column-filter.html',
  styleUrl: './column-filter.scss',
})
export class ColumnFilter {
  readonly values = input.required<readonly string[]>();
  readonly selected = input<ReadonlySet<string> | null>(null);
  readonly apply = output<ReadonlySet<string>>();
  readonly clear = output<void>();
        
  protected readonly open = signal(false);
  protected readonly search = signal('');
  protected readonly draft = signal<Set<string>>(new Set());

  protected readonly filteredValues = computed(() => {
    const term = this.search().toLowerCase();
    return this.values().filter((v) => v.toLowerCase().includes(term));
  });

  protected readonly isActive = computed(() => this.selected() !== null);

  toggleOpen(): void {
    if (!this.open()) {
      this.draft.set(new Set(this.selected() ?? this.values()));
      this.search.set('');
    }
    this.open.set(!this.open());
  }

  close(): void {
    this.open.set(false);
  }

  isChecked(value: string): boolean {
    return this.draft().has(value);
  }

  toggleValue(value: string, checked: boolean): void {
    const next = new Set(this.draft());
    if (checked) next.add(value);
    else next.delete(value);
    this.draft.set(next);
  }

  selectAll(): void {
    this.draft.set(new Set(this.values()));
  }

  selectNone(): void {
    this.draft.set(new Set());
  }

  applyFilter(): void {
    this.apply.emit(new Set(this.draft()));
    this.open.set(false);
  }

  clearFilter(): void {
    this.clear.emit();
    this.open.set(false);
  }
}