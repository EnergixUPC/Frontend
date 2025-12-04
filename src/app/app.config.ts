import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { DEVICE_REPOSITORY_PROVIDER } from './sems/energy-management/infrastructure/repositories/device.repository.provider';
import { DEVICE_PREFERENCE_REPOSITORY_PROVIDER } from './sems/energy-management/infrastructure/repositories/device-preference.repository.provider';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCharts(withDefaultRegisterables()),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'es'
      })
    ),
    DEVICE_REPOSITORY_PROVIDER,
    DEVICE_PREFERENCE_REPOSITORY_PROVIDER
  ]
};
