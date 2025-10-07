import { Provider } from '@angular/core';
import { DEVICE_PREFERENCE_REPOSITORY_TOKEN } from '../../domain/model/repositories/device-preference.repository';
import { DevicePreferenceRepositoryImpl } from './device-preference-repository.impl';

export const DEVICE_PREFERENCE_REPOSITORY_PROVIDER: Provider = {
  provide: DEVICE_PREFERENCE_REPOSITORY_TOKEN,
  useClass: DevicePreferenceRepositoryImpl
};