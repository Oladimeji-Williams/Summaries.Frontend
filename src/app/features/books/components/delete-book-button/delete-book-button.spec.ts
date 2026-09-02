import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteBookButton } from './delete-book-button';

describe('DeleteBookButton', () => {
  let component: DeleteBookButton;
  let fixture: ComponentFixture<DeleteBookButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteBookButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteBookButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
