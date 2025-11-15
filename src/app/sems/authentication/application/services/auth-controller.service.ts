import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../../domain/model/entities/user.entity';
import { TokenPair } from '../../domain/model/entities/token-pair.entity';

export interface LoginCommand {
  email: string;
  password: string;
}

export interface ResetPasswordCommand {
  email: string;
}

export interface ChangePasswordCommand {
  oldPassword: string;
  newPassword: string;
}

export interface RegisterCommand {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthControllerService {
  constructor(private readonly authService: AuthService) {}

  executeLogin(command: LoginCommand): Observable<{ user: User; tokens: TokenPair }> {
    return this.authService.login(command.email, command.password);
  }

  executeLogout(): Observable<void> {
    return this.authService.logout();
  }

  executeRefreshToken(): Observable<TokenPair> {
    return this.authService.refreshToken();
  }

  executeResetPassword(command: ResetPasswordCommand): Observable<void> {
    return this.authService.resetPassword(command.email);
  }

  executeChangePassword(command: ChangePasswordCommand): Observable<void> {
    return this.authService.changePassword(command.oldPassword, command.newPassword);
  }

  executeRegister(command: RegisterCommand): Observable<{ user: User; tokens: TokenPair }> {
    return this.authService.register(command);
  }

  validateCurrentSession(): Observable<boolean> {
    return this.authService.validateToken();
  }

  getCurrentAuthState() {
    return this.authService.authState$;
  }

  get authState$() {
    return this.authService.authState$;
  }

  register(command: RegisterCommand): Observable<{ user: User; tokens: TokenPair }> {
    return this.authService.register(command);
  }

  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  clearAuthError(): void {
    this.authService.clearError();
  }
}