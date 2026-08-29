import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserHistoryPage } from './admin-user-history-page';

describe('AdminUserHistoryPage', () => {
  let component: AdminUserHistoryPage;
  let fixture: ComponentFixture<AdminUserHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserHistoryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserHistoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
