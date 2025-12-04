export class CreateCheckoutSessionRequest {
  constructor(
    public readonly amount: number
  ) { }

  toJson(): any {
    return {
      amount: this.amount
    };
  }
}

export class CreatePaymentIntentRequest {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly description: string
  ) { }

  toJson(): any {
    return {
      userId: this.userId,
      amount: this.amount,
      currency: this.currency,
      description: this.description
    };
  }
}

export class ConfirmPaymentRequest {
  constructor(
    public readonly paymentIntentId: string,
    public readonly userId: string
  ) { }

  toJson(): any {
    return {
      paymentIntentId: this.paymentIntentId,
      userId: this.userId
    };
  }
}

