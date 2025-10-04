export class Email {
  private readonly _value: string;

  constructor(value: string) {
    this.validateEmail(value);
    this._value = value.toLowerCase().trim();
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Invalid email format');
    }
  }

  public get value(): string {
    return this._value;
  }

  public getDomain(): string {
    return this._value.split('@')[1];
  }

  public getLocalPart(): string {
    return this._value.split('@')[0];
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}