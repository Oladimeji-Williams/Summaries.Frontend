import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookTableSkeleton } from './book-table-skeleton';

describe('BookTableSkeleton', () => {
  let component: BookTableSkeleton;
  let fixture: ComponentFixture<BookTableSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookTableSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookTableSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
