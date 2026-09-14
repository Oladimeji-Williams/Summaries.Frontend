import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-two-factor-verify-page',
  imports: [RouterLink],
  templateUrl: './two-factor-verify-page.html',
  styleUrl: './two-factor-verify-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoFactorVerifyPage {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly store = inject(AuthStore);

  protected readonly code = signal('');
  protected readonly codeDigits = [0, 1, 2, 3, 4, 5];
  protected readonly missingToken = signal(false);
  private readonly twoFactorToken: string | null;

  constructor() {
    const navigationState = this.router.getCurrentNavigation()?.extras.state as
      | { twoFactorToken?: string }
      | undefined;
    const browserState = isPlatformBrowser(this.platformId)
      ? (history.state as { twoFactorToken?: string })
      : undefined;
    this.twoFactorToken = navigationState?.twoFactorToken ?? browserState?.twoFactorToken ?? null;
    this.missingToken.set(!this.twoFactorToken);
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    await this.verifyCode();
  }

  protected onCodeInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const digit = target.value.replace(/\D/g, '').slice(-1);
    const code = this.code().padEnd(6, '').split('');
    code[index] = digit;
    this.code.set(code.join('').slice(0, 6));

    if (digit && index < 5) {
      this.focusCodeInput(index + 1);
    }
    if (code.every(Boolean)) {
      void this.verifyCode();
    }
  }

  protected onCodeKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.code()[index] && index > 0) {
      this.focusCodeInput(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusCodeInput(index - 1);
    }
    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusCodeInput(index + 1);
    }
  }

  protected onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedCode = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    this.code.set(pastedCode);
    if (pastedCode.length === 6) {
      void this.verifyCode();
    }
  }

  private focusCodeInput(index: number): void {
    document.getElementById(`twoFactorCode-${index}`)?.focus();
  }

  private async verifyCode(): Promise<void> {
    if (!this.twoFactorToken || this.code().length !== 6 || this.store.isLoading()) return;

    const success = await this.store.completeTwoFactorLogin(this.twoFactorToken, this.code());
    if (success) {
      void this.router.navigateByUrl('/books');
    }
  }
}