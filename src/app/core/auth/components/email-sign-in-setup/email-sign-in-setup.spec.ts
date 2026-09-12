import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSignInSetup } from './email-sign-in-setup';

describe('EmailSignInSetup', () => {
  let component: EmailSignInSetup;
  let fixture: ComponentFixture<EmailSignInSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailSignInSetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailSignInSetup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
