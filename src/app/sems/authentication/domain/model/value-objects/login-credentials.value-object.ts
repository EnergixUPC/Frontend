export class LoginCredentials {
  constructor(
    public readonly username: string,
    public readonly password: string
  ) {
    this.validateCredentials();
  }

  private validateCredentials(): void {
    if (!this.username || this.username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }
    if (!this.password || this.password.length === 0) {
      throw new Error('Password cannot be empty');
    }
  }

  public isEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.username.trim());
  }

  public getUsernameNormalized(): string {
    return this.username.toLowerCase().trim();
  }
}