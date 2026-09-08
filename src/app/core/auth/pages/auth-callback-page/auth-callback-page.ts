import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-auth-callback-page',
  imports: [],
  templateUrl: './auth-callback-page.html',
  styleUrl: './auth-callback-page.scss',
})
export class AuthCallbackPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(AuthStore);

  async ngOnInit(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');
    const externalError = params.get('externalError');

    if (externalError || !code) {
      void this.router.navigateByUrl('/login?externalError=1');
      return;
    }

    const success = await this.store.completeExternalLogin(code);
    void this.router.navigateByUrl(success ? '/books' : '/login');
  }
}