export class DashboardStats {
  constructor(
    public readonly energyConsumption: number,
    public readonly estimatedSavings: number,
    public readonly activeDevices: number,
    public readonly estimatedBill: number,
    public readonly todayConsumption: number,
    public readonly currency: string = 'S/.'
  ) {}

  static fromJson(json: any): DashboardStats {
    return new DashboardStats(
      json.energyConsumption || 0,
      json.estimatedSavings || 0,
      json.activeDevices || 0,
      json.estimatedBill || 0,
      json.todayConsumption || 0,
      json.currency || 'S/.'
    );
  }

  toJson(): any {
    return {
      energyConsumption: this.energyConsumption,
      estimatedSavings: this.estimatedSavings,
      activeDevices: this.activeDevices,
      estimatedBill: this.estimatedBill,
      todayConsumption: this.todayConsumption,
      currency: this.currency
    };
  }
}
