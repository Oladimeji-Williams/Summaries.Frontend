import { computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../data-access/auth-api.service';
import { AuthResult, LoginRequest, RegisterRequest } from '../models/auth.model';
import { getApiErrorMessage } from '../../../infrastructure/api/api-error.util';

const STORAGE_KEY = 'summaries.auth';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAtUtc: string | null;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  roles: readonly string[];
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAtUtc: null,
  userId: null,
  email: null,
  displayName: null,
  avatarUrl: null,
  roles: [],
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ accessToken, roles }) => ({
    isAuthenticated: computed(() => accessToken() !== null),
    isAdmin: computed(() => roles().includes('Admin')),
  })),
  withMethods((store, authApi = inject(AuthApiService), platformId = inject(PLATFORM_ID)) => {
    function persist(result: AuthResult | null): void {
      if (!isPlatformBrowser(platformId)) return;
      if (result) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    function applyResult(result: AuthResult): void {
      patchState(store, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        accessTokenExpiresAtUtc: result.accessTokenExpiresAtUtc,
        userId: result.userId,
        email: result.email,
        displayName: result.displayName,
        roles: result.roles,
        avatarUrl: result.avatarUrl,
        loading: false,
        error: null,
      });
      persist(result);
    }

    return {
      restoreSession(): void {
        if (!isPlatformBrowser(platformId)) return;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const result: AuthResult = JSON.parse(raw);
        if (new Date(result.accessTokenExpiresAtUtc) <= new Date()) {
          persist(null);
          return;
        }
        patchState(store, {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          accessTokenExpiresAtUtc: result.accessTokenExpiresAtUtc,
          userId: result.userId,
          email: result.email,
          displayName: result.displayName,
          roles: result.roles,
          avatarUrl: result.avatarUrl,
        });

        const rawParsed = JSON.parse(raw);
        if (rawParsed.avatarUrl) {
          patchState(store, { avatarUrl: rawParsed.avatarUrl });
        }
      },

      async register(request: RegisterRequest): Promise<boolean> {
        patchState(store, { loading: true, error: null });
        try {
          await firstValueFrom(authApi.register(request));
          patchState(store, { loading: false });
          return true;
        } catch (err) {
          patchState(store, { loading: false, error: getApiErrorMessage(err, 'Unable to register.') });
          return false;
        }
      },

      async login(request: LoginRequest): Promise<{ success: boolean; twoFactorToken: string | null }> {
        patchState(store, { loading: true, error: null });
        try {
          const result = await firstValueFrom(authApi.login(request));
          if (result.requiresTwoFactor) {
            patchState(store, { loading: false });
            return { success: false, twoFactorToken: result.twoFactorToken };
          }
          applyResult(result);
          return { success: true, twoFactorToken: null };
        } catch (err) {
          patchState(store, { loading: false, error: getApiErrorMessage(err, 'Unable to log in.') });
          return { success: false, twoFactorToken: null };
        }
      },

      async completeTwoFactorLogin(twoFactorToken: string, code: string): Promise<boolean> {
        patchState(store, { loading: true, error: null });
        try {
          const result = await firstValueFrom(authApi.verifyTwoFactor({ twoFactorToken, code }));
          applyResult(result);
          return true;
        } catch (err) {
          patchState(store, { loading: false, error: getApiErrorMessage(err, 'Invalid verification code.') });
          return false;
        }
      },

      async refreshSession(): Promise<boolean> {
        const currentRefreshToken = store.refreshToken();
        if (!currentRefreshToken) return false;
        try {
          const result = await firstValueFrom(authApi.refresh(currentRefreshToken));
          applyResult(result);
          return true;
        } catch {
          patchState(store, initialState);
          persist(null);
          return false;
        }
      },

      async logout(): Promise<void> {
        const currentRefreshToken = store.refreshToken();
        patchState(store, initialState);
        persist(null);
        if (currentRefreshToken) {
          try {
            await firstValueFrom(authApi.revoke(currentRefreshToken));
          } catch {
            // best-effort — session is already cleared client-side regardless
          }
        }
      },

      updateDisplayName(firstName: string, lastName: string): void {
        const displayName = `${firstName} ${lastName}`;
        patchState(store, { displayName });
        if (isPlatformBrowser(platformId)) {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const stored = JSON.parse(raw);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, displayName }));
          }
        }
      },

      updateAvatar(avatarUrl: string): void {
        patchState(store, { avatarUrl });
        if (isPlatformBrowser(platformId)) {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const stored = JSON.parse(raw);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, avatarUrl }));
          }
        }
      },

      clearAvatar(): void {
        patchState(store, { avatarUrl: null });
        if (isPlatformBrowser(platformId)) {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const stored = JSON.parse(raw);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, avatarUrl: null }));
          }
        }
      },
    };
  }),
);