import { DEVICE_PREFERENCE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device-preference.repository.provider';
import { DEVICE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device.repository.provider';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { Reports } from './reports';

describe('Reports', () => {
  let component: Reports;
  let fixture: ComponentFixture<Reports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reports, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideCharts(withDefaultRegisterables()), DEVICE_REPOSITORY_PROVIDER, DEVICE_PREFERENCE_REPOSITORY_PROVIDER]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
