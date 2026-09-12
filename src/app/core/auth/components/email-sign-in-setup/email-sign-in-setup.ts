import { Component, OnInit, effect, inject, input, output, signal } from '@angular/core';
import { AuthApiService } from '../../data-access/auth-api.service';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-email-sign-in-setup',
  imports: [],
  templateUrl: './email-sign-in-setup.html',
  styleUrl: './email-sign-in-setup.scss',
})
export class EmailSignInSetup implements OnInit {
  private readonly authApi = inject(AuthApiService);
  private readonly notifications = inject(NotificationService);

  readonly refreshTrigger = input<number>(0);
  readonly statusChanged = output<void>();

  protected readonly enabled = signal(false);
  protected readonly loading = signal(true);
  protected readonly toggling = signal(false);
  protected readonly error = signal<string | null>(null);

  private isFirstRefresh = true;

  constructor() {
    effect(() => {
      this.refreshTrigger();
      if (this.isFirstRefresh) {
        this.isFirstRefresh = false;
        return;
      }
      this.load();
    });
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.authApi.getEmailSignInStatus().subscribe({
      next: (enabled) => {
        this.enabled.set(enabled);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  enable(): void {
    this.toggling.set(true);
    this.error.set(null);
    this.authApi.enableEmailSignIn().subscribe({
      next: () => {
        this.toggling.set(false);
        this.enabled.set(true);
        this.notifications.success('Email sign-in enabled. Two-factor authentication has been turned off.');
        this.statusChanged.emit();
      },
      error: (err) => {
        this.toggling.set(false);
        this.error.set(getApiErrorMessage(err, 'Unable to enable email sign-in.'));
      },
    });
  }

  disable(): void {
    this.toggling.set(true);
    this.error.set(null);
    this.authApi.disableEmailSignIn().subscribe({
      next: () => {
        this.toggling.set(false);
        this.enabled.set(false);
        this.notifications.success('Email sign-in disabled.');
        this.statusChanged.emit();
      },
      error: (err) => {
        this.toggling.set(false);
        this.error.set(getApiErrorMessage(err, 'Unable to disable email sign-in.'));
      },
    });
  }
}