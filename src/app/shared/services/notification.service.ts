import { Injectable, signal } from '@angular/core';

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  readonly toasts = signal<readonly Toast[]>([]);

  success(message: string): void {
    this.push(message, 'success');
  }

  error(message: string): void {
    this.push(message, 'error');
  }

  dismiss(id: number): void {
    this.toasts.set(this.toasts().filter((t) => t.id !== id));
  }

  private push(message: string, type: Toast['type']): void {
    const id = this.nextId++;
    this.toasts.set([...this.toasts(), { id, message, type }]);
    setTimeout(() => this.dismiss(id), 3500);
  }
}