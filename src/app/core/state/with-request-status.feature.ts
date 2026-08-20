// src/app/core/state/with-request-status.feature.ts
import { computed } from '@angular/core';
import { signalStoreFeature, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'error';

type RequestStatusState = {
  requestStatus: RequestStatus;
  error: string | null;
};

export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>({ requestStatus: 'idle', error: null }),
    withComputed(({ requestStatus }) => ({
      isLoading: computed(() => requestStatus() === 'pending'),
    })),
    withMethods((store) => ({
      setPending(): void {
        patchState(store, { requestStatus: 'pending', error: null });
      },
      setFulfilled(): void {
        patchState(store, { requestStatus: 'fulfilled', error: null });
      },
      setError(error: string): void {
        patchState(store, { requestStatus: 'error', error });
      },
      clearError(): void {
        patchState(store, { error: null });
      },
    })),
  );
}