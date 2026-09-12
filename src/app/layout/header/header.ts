import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStatus } from '../../core/auth/components/auth-status/auth-status';
import { AuthStore } from '../../core/auth/state/auth.store';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, AuthStatus],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly auth = inject(AuthStore);
  protected readonly logoUrl = environment.logoUrl;
  protected readonly isDarkTheme = signal(false);

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const storedTheme = localStorage.getItem('summaries-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = storedTheme === 'dark' || (storedTheme !== 'light' && prefersDark) ? 'dark' : 'light';
      this.applyTheme(theme);
    }
  }

  protected toggleTheme(): void {
    const theme = this.isDarkTheme() ? 'light' : 'dark';
    this.applyTheme(theme);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('summaries-theme', theme);
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    this.isDarkTheme.set(theme === 'dark');
    this.document.documentElement.dataset['theme'] = theme;
  }
}