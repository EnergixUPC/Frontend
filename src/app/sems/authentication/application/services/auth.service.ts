import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';

import { AuthRepository } from '../../domain/model/repositories/auth.repository';
import { UserRepositoryImpl } from '../../infrastructure/repositories/user-repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { User } from '../../domain/model/entities/user.entity';
import { TokenPair } from '../../domain/model/entities/token-pair.entity';
import { LoginCredentials } from '../../domain/model/value-objects/login-credentials.value-object';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authRepository: AuthRepository;
  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  public readonly authState$ = this.authStateSubject.asObservable();

  constructor(
    private readonly userRepository: UserRepositoryImpl,
    private readonly tokenService: TokenService
  ) {
    this.authRepository = this.userRepository;
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const user = this.tokenService.getUser();
    const hasValidToken = this.tokenService.hasValidToken();

    if (user && hasValidToken) {
      this.updateAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    }
  }

  login(username: string, password: string): Observable<{ user: User; tokens: TokenPair }> {
    this.updateAuthState({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null
    });

    try {
      const credentials = new LoginCredentials(username, password);
      
      return this.authRepository.login(credentials).pipe(
        tap(({ user, tokens }) => {
          // Save tokens and user to local storage
          this.tokenService.saveTokens(tokens);
          this.tokenService.saveUser(user.updateLastLogin());
          
          // Update auth state
          this.updateAuthState({
            user: user.updateLastLogin(),
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }),
        catchError(error => {
          this.updateAuthState({
            ...this.authStateSubject.value,
            isLoading: false,
            error: this.getErrorMessage(error)
          });
          return throwError(() => error);
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials format';
      this.updateAuthState({
        ...this.authStateSubject.value,
        isLoading: false,
        error: errorMessage
      });
      return throwError(() => new Error(errorMessage));
    }
  }

  logout(): Observable<void> {
    const token = this.tokenService.getAccessToken();
    
    if (token) {
      return this.authRepository.logout(token).pipe(
        tap(() => {
          this.clearAuthState();
        }),
        catchError(() => {
          // Even if logout fails on server, clear local state
          this.clearAuthState();
          return throwError(() => new Error('Logout failed'));
        })
      );
    } else {
      this.clearAuthState();
      return new Observable(observer => {
        observer.next();
        observer.complete();
      });
    }
  }

  refreshToken(): Observable<TokenPair> {
    const refreshToken = this.tokenService.getRefreshToken();
    
    if (!refreshToken) {
      this.clearAuthState();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.authRepository.refreshToken(refreshToken).pipe(
      tap(tokens => {
        this.tokenService.saveTokens(tokens);
      }),
      catchError(error => {
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  validateToken(): Observable<boolean> {
    const token = this.tokenService.getAccessToken();
    
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    return this.authRepository.validateToken(token);
  }

  resetPassword(email: string): Observable<void> {
    return this.authRepository.resetPassword(email);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    const user = this.getCurrentUser();
    
    if (!user) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.authRepository.changePassword(user.id, oldPassword, newPassword);
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  isLoading(): boolean {
    return this.authStateSubject.value.isLoading;
  }

  getError(): string | null {
    return this.authStateSubject.value.error;
  }

  clearError(): void {
    this.updateAuthState({
      ...this.authStateSubject.value,
      error: null
    });
  }

  private updateAuthState(newState: AuthState): void {
    this.authStateSubject.next(newState);
  }

  private clearAuthState(): void {
    this.tokenService.clearTokens();
    this.updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status === 401) {
      return 'Invalid username or password';
    }
    if (error?.status === 0) {
      return 'Network error. Please check your connection.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}