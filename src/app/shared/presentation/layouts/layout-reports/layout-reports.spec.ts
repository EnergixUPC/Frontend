import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutReports } from './layout-reports';

describe('LayoutReports', () => {
  let component: LayoutReports;
  let fixture: ComponentFixture<LayoutReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutReports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
