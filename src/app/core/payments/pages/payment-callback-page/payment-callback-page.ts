import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaymentsApiService } from '../../data-access/payments-api.service';

@Component({
  selector: 'app-payment-callback-page',
  imports: [RouterLink],
  templateUrl: './payment-callback-page.html',
  styleUrl: './payment-callback-page.scss',
})
export class PaymentCallbackPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentsApi = inject(PaymentsApiService);

  protected readonly status = signal<'checking' | 'success' | 'failed'>('checking');

  async ngOnInit(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;
    // Paystack's hosted checkout appends both on redirect depending on integration type.
    const reference = params.get('reference') ?? params.get('trxref');

    if (!reference) {
      this.status.set('failed');
      return;
    }

    try {
      const success = await firstValueFrom(this.paymentsApi.verify(reference));
      this.status.set(success ? 'success' : 'failed');
    } catch {
      this.status.set('failed');
    }
  }
}