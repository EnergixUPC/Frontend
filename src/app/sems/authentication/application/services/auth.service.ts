import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthRepository } from '../../domain/model/repositories/auth.repository';
import { UserRepositoryImpl } from '../../infrastructure/repositories/user-repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { User } from '../../domain/model/entities/user.entity';
import { TokenPair } from '../../domain/model/entities/token-pair.entity';
import { environment } from '../../../../../environments/environments';

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
    private readonly tokenService: TokenService,
    private readonly http: HttpClient
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

    // Use API to validate credentials against db.json
    return this.http.get<any[]>(`${environment.apiUrl}/users?username=${username}&password=${password}`).pipe(
      map(users => {
        console.log('AuthService - API response:', users);
        if (users && users.length > 0) {
          const userData = users[0];
          console.log('AuthService - User data from API:', userData);
          const user = new User(
            userData.id.toString(),
            userData.email,
            userData.firstName,
            userData.lastName,
            userData.role,
            true,
            new Date(userData.createdAt),
            new Date()
          );

          console.log('AuthService - Created user object:', user);

          const tokens = new TokenPair(
            'mock-access-token-' + Date.now(),
            'mock-refresh-token-' + Date.now(),
            3600
          );

          // Save tokens and user
          this.tokenService.saveTokens(tokens);
          this.tokenService.saveUser(user);

          // Update auth state
          this.updateAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          console.log('AuthService - Auth state updated with user:', user);

          return { user, tokens };
        } else {
          throw new Error('Invalid credentials');
        }
      }),
      catchError(error => {
        const errorMessage = 'Invalid credentials';
        this.updateAuthState({
          ...this.authStateSubject.value,
          isLoading: false,
          error: errorMessage
        });
        return throwError(() => new Error(errorMessage));
      })
    );
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