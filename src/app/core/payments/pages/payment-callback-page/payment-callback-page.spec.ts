import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCallbackPage } from './payment-callback-page';

describe('PaymentCallbackPage', () => {
  let component: PaymentCallbackPage;
  let fixture: ComponentFixture<PaymentCallbackPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCallbackPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentCallbackPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
