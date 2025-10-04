import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutDevicePreferences } from './layout-device-preferences';

describe('LayoutDevicePreferences', () => {
  let component: LayoutDevicePreferences;
  let fixture: ComponentFixture<LayoutDevicePreferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutDevicePreferences]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutDevicePreferences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
