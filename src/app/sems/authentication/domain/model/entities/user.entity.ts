export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly lastLogin?: Date
  ) {}

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public hasRole(role: string): boolean {
    return this.role === role;
  }

  public isAuthenticated(): boolean {
    return this.isActive;
  }

  public updateLastLogin(): User {
    return new User(
      this.id,
      this.email,
      this.firstName,
      this.lastName,
      this.role,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.firstName,
      this.lastName,
      this.role,
      false,
      this.createdAt,
      this.lastLogin
    );
  }

  public changePassword(newPassword: string): void {
    // This would typically trigger a domain event
    // Domain events are beyond the scope of this implementation
  }
}
