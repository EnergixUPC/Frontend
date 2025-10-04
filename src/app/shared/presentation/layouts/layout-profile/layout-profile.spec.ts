import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutProfile } from './layout-profile';

describe('LayoutProfile', () => {
  let component: LayoutProfile;
  let fixture: ComponentFixture<LayoutProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
