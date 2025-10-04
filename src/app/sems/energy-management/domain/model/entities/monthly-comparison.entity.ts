export interface MonthlyData {
  month: string;
  year: number;
  consumption: number;
}

export class MonthlyComparison {
  constructor(
    public readonly months: MonthlyData[],
    public readonly currentMonth: string,
    public readonly previousMonthComparison: number // percentage
  ) {}

  static fromJson(json: any): MonthlyComparison {
    return new MonthlyComparison(
      json.months || [],
      json.currentMonth || '',
      json.previousMonthComparison || 0
    );
  }

  toJson(): any {
    return {
      months: this.months,
      currentMonth: this.currentMonth,
      previousMonthComparison: this.previousMonthComparison
    };
  }

  getMonthData(month: string): MonthlyData | undefined {
    return this.months.find(m => m.month === month);
  }
}
