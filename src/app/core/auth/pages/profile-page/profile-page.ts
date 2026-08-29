import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../data-access/auth-api.service';
import { AuthStore } from '../../state/auth.store';
import { UserProfile } from '../../models/auth.model';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);

  protected readonly initials = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
  });

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.authApi.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.form.setValue({ firstName: profile.firstName, lastName: profile.lastName });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(getApiErrorMessage(err, 'Unable to load profile.'));
        this.loading.set(false);
      },
    });
  }

  startEditing(): void {
    this.editing.set(true);
  }

  cancelEditing(): void {
    const p = this.profile();
    if (p) {
      this.form.setValue({ firstName: p.firstName, lastName: p.lastName });
    }
    this.editing.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const { firstName, lastName } = this.form.getRawValue();
    this.authApi.updateProfile({ firstName, lastName }).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.authStore.updateDisplayName(firstName, lastName);
        this.loadProfile();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(getApiErrorMessage(err, 'Unable to update profile.'));
      },
    });
  }
}