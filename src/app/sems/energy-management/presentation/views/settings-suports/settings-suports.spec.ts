import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSuports } from './settings-suports';

describe('SettingsSuports', () => {
  let component: SettingsSuports;
  let fixture: ComponentFixture<SettingsSuports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsSuports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsSuports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
