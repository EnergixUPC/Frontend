export interface ConsumptionDataPoint {
  time: string;
  value: number;
}

export class DailyConsumption {
  constructor(
    public readonly date: Date,
    public readonly dataPoints: ConsumptionDataPoint[],
    public readonly totalConsumption: number,
    public readonly peakTime: string,
    public readonly peakValue: number
  ) {}

  static fromJson(json: any): DailyConsumption {
    return new DailyConsumption(
      new Date(json.date),
      json.dataPoints || [],
      json.totalConsumption || 0,
      json.peakTime || '',
      json.peakValue || 0
    );
  }

  toJson(): any {
    return {
      date: this.date.toISOString(),
      dataPoints: this.dataPoints,
      totalConsumption: this.totalConsumption,
      peakTime: this.peakTime,
      peakValue: this.peakValue
    };
  }
}
