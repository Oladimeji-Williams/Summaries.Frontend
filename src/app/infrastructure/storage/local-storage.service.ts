import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * SSR-safe wrapper around `window.localStorage`.
 *
 * Feature and layout code should depend on this service instead of calling
 * `localStorage` directly, so storage access stays testable, mockable, and
 * safe to run on the server (see docs/ARCHITECTURE.md — infrastructure/storage).
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Returns the raw string stored at `key`, or `null` if unavailable/absent. */
  getItem(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key);
  }

  /** Parses the value stored at `key` as JSON, or returns `null` if absent or invalid. */
  getJson<T>(key: string): T | null {
    const raw = this.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, value);
  }

  setJson<T>(key: string, value: T): void {
    this.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  /** Merges `patch` into the JSON object stored at `key`. No-op if nothing is stored yet. */
  patchJson<T extends object>(key: string, patch: Partial<T>): void {
    const current = this.getJson<T>(key);
    if (current === null) return;
    this.setJson(key, { ...current, ...patch });
  }
}
