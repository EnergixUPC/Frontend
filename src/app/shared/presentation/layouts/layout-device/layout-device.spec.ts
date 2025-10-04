import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutDevice } from './layout-device';

describe('LayoutDevice', () => {
  let component: LayoutDevice;
  let fixture: ComponentFixture<LayoutDevice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutDevice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutDevice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
