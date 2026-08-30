import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-sort-indicator',
  imports: [],
  templateUrl: './sort-indicator.html',
  styleUrl: './sort-indicator.scss',
})
export class SortIndicator {
  readonly direction = input<'asc' | 'desc' | null>(null);
  readonly priority = input<number | null>(null);
  readonly showPriority = input(false);
  readonly sortClick = output<void>();
  readonly clearClick = output<void>();
}