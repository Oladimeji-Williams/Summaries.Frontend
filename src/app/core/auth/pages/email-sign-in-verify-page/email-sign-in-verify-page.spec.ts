import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSignInVerifyPage } from './email-sign-in-verify-page';

describe('EmailSignInVerifyPage', () => {
  let component: EmailSignInVerifyPage;
  let fixture: ComponentFixture<EmailSignInVerifyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailSignInVerifyPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailSignInVerifyPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
