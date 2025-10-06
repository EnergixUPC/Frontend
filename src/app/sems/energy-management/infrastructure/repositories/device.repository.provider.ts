import { Provider } from '@angular/core';
import { DEVICE_REPOSITORY_TOKEN } from '../../domain/model/repositories/device.repository';
import { DeviceRepositoryImpl } from './device-repository.impl';

export const DEVICE_REPOSITORY_PROVIDER: Provider = {
  provide: DEVICE_REPOSITORY_TOKEN,
  useClass: DeviceRepositoryImpl
};