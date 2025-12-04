export class CheckoutSession {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly amount: number
  ) { }

  static fromJson(json: any): CheckoutSession {
    return new CheckoutSession(
      json.id,
      json.url,
      json.amount
    );
  }

  toJson(): any {
    return {
      id: this.id,
      url: this.url,
      amount: this.amount
    };
  }
}

