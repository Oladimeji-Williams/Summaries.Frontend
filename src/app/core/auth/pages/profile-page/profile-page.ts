import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../data-access/auth-api.service';
import { AuthStore } from '../../state/auth.store';
import { UserProfile } from '../../models/auth.model';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';
import { AvatarCropper, CropResult } from '../../components/avatar-cropper/avatar-cropper';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Spinner } from "../../../../shared/components/spinner/spinner";
import { TwoFactorSetup } from '../../components/two-factor-setup/two-factor-setup';

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, RouterLink, ReactiveFormsModule, AvatarCropper, Spinner, TwoFactorSetup],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

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
    phoneNumber: [''],
    address: [''],
    city: [''],
    country: [''],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.authApi.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.form.setValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber ?? '',
          address: profile.address ?? '',
          city: profile.city ?? '',
          country: profile.country ?? '',
        });
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
      this.form.setValue({
        firstName: p.firstName,
        lastName: p.lastName,
        phoneNumber: p.phoneNumber ?? '',
        address: p.address ?? '',
        city: p.city ?? '',
        country: p.country ?? '',
      });
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
    const { firstName, lastName, phoneNumber, address, city, country } = this.form.getRawValue();
    this.authApi
      .updateProfile({
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        address: address || null,
        city: city || null,
        country: country || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.editing.set(false);
          this.authStore.updateDisplayName(firstName, lastName);
          this.notifications.success('Profile updated successfully.');
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
        this.notifications.success('Profile picture updated.');
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
        this.notifications.success('Profile picture removed.');
        this.loadProfile();
      },
      error: (err) => {
        this.removing.set(false);
        this.uploadError.set(getApiErrorMessage(err, 'Unable to remove image.'));
      },
    });
  }
}