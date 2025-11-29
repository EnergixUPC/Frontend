export interface Device {
  id: string;
  name: string;
  category: string;
  type: string;
  brand: string;
  model: string;
  status: DeviceStatus;
  realTimeStatus: string;
  lastActive: string;
  alertHistory?: string;
  energyConsumption?: string;
  energyConsumptionValue?: number; // Valor numérico para cálculos
  location: string;
  isActive: number;
}

export enum DeviceStatus {
  ON = 'ON',
  OFF = 'OFF',
  STANDBY = 'STANDBY',
  CHARGING = 'CHARGING'
}

export enum DeviceType {
  AIR_CONDITIONER = 'AIR_CONDITIONER',
  REFRIGERATOR = 'REFRIGERATOR',
  TV = 'TV',
  MICROWAVE = 'MICROWAVE',
  LAPTOP = 'LAPTOP',
  SMART_SPEAKER = 'SMART_SPEAKER'
}

export enum DeviceCategory {
  HEATING_COOLING = 'Heating & Cooling',
  MAJOR_APPLIANCES = 'Major Appliances',
  ELECTRONICS = 'Electronics',
  OTHER = 'Other'
}
