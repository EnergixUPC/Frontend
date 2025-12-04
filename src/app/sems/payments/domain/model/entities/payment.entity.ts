export class Payment {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: string,
    public readonly paymentIntentId: string,
    public readonly description: string,
    public readonly createdAt: Date
  ) { }

  static fromJson(json: any): Payment {
    return new Payment(
      json.id || json._id,
      json.userId,
      json.amount,
      json.currency || 'usd',
      json.status,
      json.paymentIntentId,
      json.description || '',
      json.createdAt ? new Date(json.createdAt) : new Date()
    );
  }

  toJson(): any {
    return {
      id: this.id,
      userId: this.userId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      paymentIntentId: this.paymentIntentId,
      description: this.description,
      createdAt: this.createdAt.toISOString()
    };
  }
}
