export enum DeviceStatus {
  ON = 'ON',
  OFF = 'OFF'
}

export enum DeviceType {
  SMART_LAMP = 'Smart Lamp',
  SMART_TV = 'Smart TV',
  SMART_FAN = 'Smart Fan',
  OTHER = 'Other'
}

export class Device {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly location: string,
    public readonly type: DeviceType,
    public readonly status: DeviceStatus,
    public readonly lastActive?: string,
    public readonly consumption?: number
  ) {}

  static fromJson(json: any): Device {
    return new Device(
      json.id,
      json.name,
      json.location,
      json.type as DeviceType,
      json.status as DeviceStatus,
      json.lastActive,
      json.consumption
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      type: this.type,
      status: this.status,
      lastActive: this.lastActive,
      consumption: this.consumption
    };
  }

  isActive(): boolean {
    return this.status === DeviceStatus.ON;
  }

  getDisplayName(): string {
    return `${this.location} - ${this.name}`;
  }
}
