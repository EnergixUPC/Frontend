import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePreferences } from './device-preferences';

describe('DevicePreferences', () => {
  let component: DevicePreferences;
  let fixture: ComponentFixture<DevicePreferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevicePreferences]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicePreferences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
