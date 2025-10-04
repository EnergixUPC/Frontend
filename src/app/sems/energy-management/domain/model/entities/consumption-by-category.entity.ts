export interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export class ConsumptionByCategory {
  constructor(
    public readonly categories: CategoryData[],
    public readonly totalConsumption: number
  ) {}

  static fromJson(json: any): ConsumptionByCategory {
    return new ConsumptionByCategory(
      json.categories || [],
      json.totalConsumption || 0
    );
  }

  toJson(): any {
    return {
      categories: this.categories,
      totalConsumption: this.totalConsumption
    };
  }

  getCategoryByName(name: string): CategoryData | undefined {
    return this.categories.find(cat => cat.name === name);
  }
}
