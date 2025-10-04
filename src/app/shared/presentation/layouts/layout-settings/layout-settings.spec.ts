import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSettings } from './layout-settings';

describe('LayoutSettings', () => {
  let component: LayoutSettings;
  let fixture: ComponentFixture<LayoutSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
