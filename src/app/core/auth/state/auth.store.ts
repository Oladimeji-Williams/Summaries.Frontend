import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../data-access/auth-api.service';
import { AuthResult, LoginRequest, RegisterRequest } from '../models/auth.model';
import { getApiErrorMessage } from '../../../infrastructure/api/api-error.util';
import { LocalStorageService } from '../../../infrastructure/storage/local-storage.service';
import { withRequestStatus } from '../../state/with-request-status.feature';

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
};

type StartLoginOutcome =
  | 'AccountNotFound'
  | 'UsePassword'
  | 'EmailCodeSent'
  | 'NoPasswordSet'
  | 'EmailDeliveryFailed';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withRequestStatus(),
  withComputed(({ accessToken, roles }) => ({
    isAuthenticated: computed(() => accessToken() !== null),
    isAdmin: computed(() => roles().includes('Admin')),
  })),
  withMethods((store, authApi = inject(AuthApiService), storage = inject(LocalStorageService)) => {
    function persist(result: AuthResult | null): void {
      if (result) {
        storage.setJson(STORAGE_KEY, result);
      } else {
        storage.removeItem(STORAGE_KEY);
      }
    }

    function applySession(result: AuthResult): void {
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
    }

    function applyResult(result: AuthResult): void {
      applySession(result);
      store.setFulfilled();
      persist(result);
    }

    return {
      restoreSession(): void {
        const result = storage.getJson<AuthResult>(STORAGE_KEY);
        if (!result) return;
        if (new Date(result.accessTokenExpiresAtUtc) <= new Date()) {
          persist(null);
          return;
        }
        applySession(result);
      },

      async register(request: RegisterRequest): Promise<boolean> {
        store.setPending();
        try {
          await firstValueFrom(authApi.register(request));
          store.setFulfilled();
          return true;
        } catch (err) {
          store.setError(getApiErrorMessage(err, 'Unable to register.'));
          return false;
        }
      },

      async login(request: LoginRequest): Promise<{ success: boolean; twoFactorToken: string | null }> {
        store.setPending();
        try {
          const result = await firstValueFrom(authApi.login(request));
          if (result.requiresTwoFactor) {
            store.setFulfilled();
            return { success: false, twoFactorToken: result.twoFactorToken };
          }
          applyResult(result);
          return { success: true, twoFactorToken: null };
        } catch (err) {
          store.setError(getApiErrorMessage(err, 'Unable to log in.'));
          return { success: false, twoFactorToken: null };
        }
      },

      async completeTwoFactorLogin(twoFactorToken: string, code: string): Promise<boolean> {
        store.setPending();
        try {
          const result = await firstValueFrom(authApi.verifyTwoFactor({ twoFactorToken, code }));
          applyResult(result);
          return true;
        } catch (err) {
          store.setError(getApiErrorMessage(err, 'Invalid verification code.'));
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
        storage.patchJson<AuthResult>(STORAGE_KEY, { displayName });
      },

      updateAvatar(avatarUrl: string): void {
        patchState(store, { avatarUrl });
        storage.patchJson<AuthResult>(STORAGE_KEY, { avatarUrl });
      },

      clearAvatar(): void {
        patchState(store, { avatarUrl: null });
        storage.patchJson<AuthResult>(STORAGE_KEY, { avatarUrl: null });
      },

      async completeExternalLogin(code: string): Promise<boolean> {
        store.setPending();
        try {
          const result = await firstValueFrom(authApi.exchangeExternalLogin(code));
          applyResult(result);
          return true;
        } catch (err) {
          store.setError(getApiErrorMessage(err, 'Unable to complete sign-in.'));
          return false;
        }
      },

      async startLogin(email: string): Promise<StartLoginOutcome | null> {
        store.setPending();
        try {
          const result = await firstValueFrom(authApi.startLogin(email));
          store.setFulfilled();
          return result.outcome as StartLoginOutcome;
        } catch (err) {
          store.setError(getApiErrorMessage(err, 'Unable to continue.'));
          return null;
        }
      },

      async completeEmailSignInWithCode(email: string, code: string): Promise<boolean> {
        store.setPending();
        try {
          const result = await firstValueFrom(authApi.completeEmailSignInWithCode(email, code));
          applyResult(result);
          return true;
        } catch (err) {
          store.setError(getApiErrorMessage(err, 'Invalid or expired code.'));
          return false;
        }
      },

      async completeEmailSignInWithLink(token: string): Promise<boolean> {
        store.setPending();
        try {
          const result = await firstValueFrom(authApi.completeEmailSignInWithLink(token));
          applyResult(result);
          return true;
        } catch (err) {
          store.setError(getApiErrorMessage(err, 'Invalid or expired link.'));
          return false;
        }
      },
    };
  }),
);
