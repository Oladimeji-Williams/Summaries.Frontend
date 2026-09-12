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
    if (!this.twoFactorToken || !this.code().trim()) return;

    const success = await this.store.completeTwoFactorLogin(this.twoFactorToken, this.code().trim());
    if (success) {
      void this.router.navigateByUrl('/books');
    }
  }
}
