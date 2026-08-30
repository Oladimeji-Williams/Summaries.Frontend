import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../data-access/admin-api.service';
import { AdminUser } from '../../models/admin.model';
import { getApiErrorMessage } from '../../../../infrastructure/api/api-error.util';
import { TableState, ColumnDef } from '../../../../shared/table/table-state';
import { ColumnFilter } from '../../../../shared/components/column-filter/column-filter';
import { SortIndicator } from "../../../../shared/components/sort-indicator/sort-indicator";

@Component({
  selector: 'app-admin-users-page',
  imports: [DatePipe, RouterLink, ColumnFilter, SortIndicator],
  templateUrl: './admin-users-page.html',
  styleUrl: './admin-users-page.scss',
})
export class AdminUsersPage implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  protected readonly users = signal<readonly AdminUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly columns: ColumnDef<AdminUser>[] = [
    { key: 'name', label: 'Name', value: (u) => `${u.firstName} ${u.lastName}`, sortable: true, filterable: true },
    { key: 'email', label: 'Email', value: (u) => u.email, sortable: true, filterable: true },
    {
      key: 'joined', label: 'Joined', sortable: true, filterable: true,
      value: (u) => new Date(u.createdAtUtc).toLocaleString(),
      sortValue: (u) => new Date(u.createdAtUtc).getTime(),
    },
  ];

  protected readonly table = new TableState(this.users, this.columns);

  ngOnInit(): void {
    this.adminApi.getAllUsers().subscribe({
      next: (users) => { this.users.set(users); this.loading.set(false); },
      error: (err) => { this.error.set(getApiErrorMessage(err, 'Unable to load users.')); this.loading.set(false); },
    });
  }
}