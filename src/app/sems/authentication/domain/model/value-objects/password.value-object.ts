export class Password {
  private readonly _value: string;

  constructor(value: string) {
    this.validatePassword(value);
    this._value = value;
  }

  private validatePassword(password: string): void {
    if (!password || password.length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Additional validation rules can be added here
    // For example: uppercase, lowercase, numbers, special characters
  }

  public get value(): string {
    return this._value;
  }

  public validateStrength(): {
    isStrong: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let isStrong = true;

    if (this._value.length < 8) {
      reasons.push('Password should be at least 8 characters long');
      isStrong = false;
    }

    if (!/[A-Z]/.test(this._value)) {
      reasons.push('Password should contain at least one uppercase letter');
      isStrong = false;
    }

    if (!/[a-z]/.test(this._value)) {
      reasons.push('Password should contain at least one lowercase letter');
      isStrong = false;
    }

    if (!/\d/.test(this._value)) {
      reasons.push('Password should contain at least one number');
      isStrong = false;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(this._value)) {
      reasons.push('Password should contain at least one special character');
      isStrong = false;
    }

    return { isStrong, reasons };
  }

  public equals(other: Password): boolean {
    return this._value === other._value;
  }
}