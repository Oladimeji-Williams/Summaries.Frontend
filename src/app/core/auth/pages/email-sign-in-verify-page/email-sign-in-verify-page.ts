import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-email-sign-in-verify-page',
  imports: [RouterLink],
  templateUrl: './email-sign-in-verify-page.html',
  styleUrl: './email-sign-in-verify-page.scss',
})
export class EmailSignInVerifyPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(AuthStore);

  protected readonly status = signal<'checking' | 'failed'>('checking');

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('failed');
      return;
    }
    const success = await this.store.completeEmailSignInWithLink(token);
    if (success) {
      void this.router.navigateByUrl('/books');
    } else {
      this.status.set('failed');
    }
  }
}