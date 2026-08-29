import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBookReadersPage } from './admin-book-readers-page';

describe('AdminBookReadersPage', () => {
  let component: AdminBookReadersPage;
  let fixture: ComponentFixture<AdminBookReadersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBookReadersPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBookReadersPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
