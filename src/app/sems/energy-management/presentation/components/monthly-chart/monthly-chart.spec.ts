import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyChart } from './monthly-chart';

describe('MonthlyChart', () => {
  let component: MonthlyChart;
  let fixture: ComponentFixture<MonthlyChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
