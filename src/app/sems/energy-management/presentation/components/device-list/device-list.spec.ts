import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceList } from './device-list';

describe('DeviceList', () => {
  let component: DeviceList;
  let fixture: ComponentFixture<DeviceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
