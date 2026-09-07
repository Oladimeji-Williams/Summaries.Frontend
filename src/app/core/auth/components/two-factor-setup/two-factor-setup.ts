import { Component, OnInit, inject, signal } from '@angular/core';
import * as QRCode from 'qrcode';
import { AuthApiService } from '../../data-access/auth-api.service';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-two-factor-setup',
  imports: [],
  templateUrl: './two-factor-setup.html',
  styleUrl: './two-factor-setup.scss',
})
export class TwoFactorSetup implements OnInit {
  private readonly authApi = inject(AuthApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly enabled = signal(false);
  protected readonly loading = signal(true);
  protected readonly settingUp = signal(false);
  protected readonly qrDataUrl = signal<string | null>(null);
  protected readonly sharedKey = signal<string | null>(null);
  protected readonly code = signal('');
  protected readonly confirming = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly disabling = signal(false);
  protected readonly disablePassword = signal('');
  protected readonly showDisableForm = signal(false);

  ngOnInit(): void {
    this.authApi.getTwoFactorStatus().subscribe({
      next: (enabled) => {
        this.enabled.set(enabled);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  async startSetup(): Promise<void> {
    this.settingUp.set(true);
    this.error.set(null);
    this.authApi.beginTwoFactorSetup().subscribe({
      next: async (result) => {
        this.sharedKey.set(result.sharedKey);
        this.qrDataUrl.set(await QRCode.toDataURL(result.authenticatorUri));
      },
      error: (err) => {
        this.settingUp.set(false);
        this.error.set(getApiErrorMessage(err, 'Unable to start 2FA setup.'));
      },
    });
  }

  confirmSetup(): void {
    this.confirming.set(true);
    this.error.set(null);
    this.authApi.confirmTwoFactorSetup({ code: this.code() }).subscribe({
      next: () => {
        this.confirming.set(false);
        this.settingUp.set(false);
        this.enabled.set(true);
        this.notifications.success('Two-factor authentication enabled.');
      },
      error: (err) => {
        this.confirming.set(false);
        this.error.set(getApiErrorMessage(err, 'Invalid code. Please try again.'));
      },
    });
  }

  cancelSetup(): void {
    this.settingUp.set(false);
    this.qrDataUrl.set(null);
    this.sharedKey.set(null);
    this.code.set('');
  }

  showDisable(): void {
    this.showDisableForm.set(true);
  }

  disable(): void {
    this.disabling.set(true);
    this.error.set(null);
    this.authApi.disableTwoFactor({ currentPassword: this.disablePassword() }).subscribe({
      next: () => {
        this.disabling.set(false);
        this.enabled.set(false);
        this.showDisableForm.set(false);
        this.disablePassword.set('');
        this.notifications.success('Two-factor authentication disabled.');
      },
      error: (err) => {
        this.disabling.set(false);
        this.error.set(getApiErrorMessage(err, 'Incorrect password.'));
      },
    });
  }
}