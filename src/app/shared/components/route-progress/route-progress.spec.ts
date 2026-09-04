import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteProgress } from './route-progress';

describe('RouteProgress', () => {
  let component: RouteProgress;
  let fixture: ComponentFixture<RouteProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteProgress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteProgress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
