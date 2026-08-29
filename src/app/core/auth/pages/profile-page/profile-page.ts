import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../data-access/auth-api.service';
import { AuthStore } from '../../state/auth.store';
import { UserProfile } from '../../models/auth.model';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';
import { AvatarCropper, CropResult } from '../../components/avatar-cropper/avatar-cropper';

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, RouterLink, ReactiveFormsModule, AvatarCropper],
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
  protected readonly uploading = signal(false);
  protected readonly removing = signal(false);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly showCropper = signal(false);
  protected readonly selectedFile = signal<File | null>(null);

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadError.set(null);
    this.selectedFile.set(file);
    this.showCropper.set(true);
    input.value = '';
  }

  onCropSaved(result: CropResult): void {
    this.showCropper.set(false);
    const croppedFile = new File([result.blob], 'avatar.png', { type: 'image/png' });

    this.uploading.set(true);
    this.authApi.uploadAvatar(croppedFile).subscribe({
      next: (avatarUrl) => {
        this.uploading.set(false);
        this.authStore.updateAvatar(avatarUrl);
        this.loadProfile();
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(getApiErrorMessage(err, 'Unable to upload image.'));
      },
    });
  }

  onCropCancelled(): void {
    this.showCropper.set(false);
  }

  removeAvatar(): void {
    this.removing.set(true);
    this.uploadError.set(null);
    this.authApi.removeAvatar().subscribe({
      next: () => {
        this.removing.set(false);
        this.authStore.clearAvatar();
        this.loadProfile();
      },
      error: (err) => {
        this.removing.set(false);
        this.uploadError.set(getApiErrorMessage(err, 'Unable to remove image.'));
      },
    });
  }
}