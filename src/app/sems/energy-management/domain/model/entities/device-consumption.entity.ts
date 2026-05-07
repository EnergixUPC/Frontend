export interface DeviceConsumption {
  id: number;
  deviceId: number;
  period: 'daily' | 'weekly' | 'monthly';
  consumption: number;
}
