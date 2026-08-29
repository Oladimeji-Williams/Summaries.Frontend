import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../data-access/admin-api.service';
import { AdminUser } from '../../models/admin.model';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';

@Component({
  selector: 'app-admin-users-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-users-page.html',
  styleUrl: './admin-users-page.scss',
})
export class AdminUsersPage implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  protected readonly users = signal<readonly AdminUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.adminApi.getAllUsers().subscribe({
      next: (users) => { this.users.set(users); this.loading.set(false); },
      error: (err) => { this.error.set(getApiErrorMessage(err, 'Unable to load users.')); this.loading.set(false); },
    });
  }
}