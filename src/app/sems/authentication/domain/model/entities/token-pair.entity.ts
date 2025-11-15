export class TokenPair {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken?: string,
    public readonly expiresIn: number = 3600,
    public readonly tokenType: string = 'Bearer'
  ) {
    this.validateTokens();
  }

  private validateTokens(): void {
    if (!this.accessToken || this.accessToken.trim().length === 0) {
      throw new Error('Access token cannot be empty');
    }
    if (this.refreshToken != null && this.refreshToken.trim().length === 0) {
      throw new Error('Refresh token cannot be empty');
    }
    if (this.expiresIn <= 0) {
      throw new Error('Expires in must be a positive number');
    }
  }

  public isExpired(): boolean {
    // This is a simplified implementation
    // In a real scenario, you would decode the JWT and check the exp claim
    return false;
  }

  public getAuthorizationHeader(): string {
    return `${this.tokenType} ${this.accessToken}`;
  }

  public getExpirationDate(): Date {
    return new Date(Date.now() + this.expiresIn * 1000);
  }
}