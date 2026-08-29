import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-rating-bar',
  imports: [],
  templateUrl: './rating-bar.html',
  styleUrl: './rating-bar.scss',
})
export class RatingBar {
  readonly rating = input<number | null>(null);
  readonly max = input(5);

  protected readonly segments = computed(() => {
    const value = this.rating() ?? 0;
    return Array.from({ length: this.max() }, (_, i) =>
      Math.min(Math.max(value - i, 0), 1) * 100,
    );
  });
}