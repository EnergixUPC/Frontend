import { DEVICE_PREFERENCE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device-preference.repository.provider';
import { DEVICE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device.repository.provider';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSuports } from './settings-suports';

describe('SettingsSuports', () => {
  let component: SettingsSuports;
  let fixture: ComponentFixture<SettingsSuports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsSuports, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), DEVICE_REPOSITORY_PROVIDER, DEVICE_PREFERENCE_REPOSITORY_PROVIDER]
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
