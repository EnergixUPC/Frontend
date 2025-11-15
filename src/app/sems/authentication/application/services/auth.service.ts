// typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    // Use API to validate credentials
    return this.http.post<any>(`${environment.apiUrl}/api/v1/auth/login`, { email: username, password }).pipe(
      map(response => {
        console.log('AuthService - API response:', response);
        const userData = response.user || response;
        console.log('AuthService - User data from API:', userData);
        const user = new User(
          (userData.id ?? 0).toString(),
          userData.email,
          userData.firstName,
          userData.lastName,
          userData.role,
          true,
          new Date(userData.createdAt || new Date()),
          new Date(),
          userData.username,
          userData.phoneNumber,
          userData.address,
          userData.profilePhotoUrl
        );

        console.log('AuthService - Created user object:', user);

        const tokens = new TokenPair(
          response.accessToken,
          response.refreshToken || undefined,
          response.expiresIn
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
      }),
      catchError(error => {
        console.error('AuthService - Login error:', error);
        const errorMessage = this.getErrorMessage(error);
        
        this.updateAuthState({
          ...this.authStateSubject.value,
          isLoading: false,
          error: errorMessage
        });

        return throwError(() => error);
      })
    );
  }

  private getUserProfile(token: string): Observable<User> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${environment.apiUrl}/api/v1/auth/profile`, { headers }).pipe(
      map(userData => {
        const user = new User(
          (userData.id ?? 0).toString(),
          userData.email,
          userData.firstName,
          userData.lastName,
          userData.role,
          true,
          new Date(userData.createdAt || new Date()),
          new Date()
        );

        this.tokenService.saveUser(user);

        this.updateAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        console.log('AuthService - Auth state updated with user:', user);

        return user;
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
    }

    this.clearAuthState();
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  refreshToken(): Observable<TokenPair> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
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
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.authRepository.validateToken(token).pipe(
      catchError(() => {
        this.clearAuthState();
        return new Observable<boolean>(observer => {
          observer.next(false);
          observer.complete();
        });
      })
    );
  }

  register(command: { firstName: string; lastName: string; email: string; username: string; password: string; phoneNumber: string; address: string }): Observable<{ user: User; tokens: TokenPair }> {
    this.updateAuthState({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null
    });

    // Register user via API
    return this.http.post<any>(`${environment.apiUrl}/api/v1/auth/register`, command).pipe(
      switchMap(response => {
        console.log('AuthService - User registered successfully:', response);
        
        // After registration, automatically login to get tokens
        return this.login(command.email, command.password);
      }),
      catchError(error => {
        console.error('AuthService - Register error:', error);
        const errorMessage = this.getErrorMessage(error);
        
        this.updateAuthState({
          ...this.authStateSubject.value,
          isLoading: false,
          error: errorMessage
        });

        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  resetPassword(email: string): Observable<void> {
    this.updateAuthState({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null
    });

    return this.http.post<any>(`${environment.apiUrl}/api/v1/auth/reset-password`, { email }).pipe(
      tap(() => {
        this.updateAuthState({
          ...this.authStateSubject.value,
          isLoading: false,
          error: null
        });
      }),
      map(() => undefined),
      catchError(error => {
        const errorMessage = 'Reset password failed';
        this.updateAuthState({
          ...this.authStateSubject.value,
          isLoading: false,
          error: errorMessage
        });
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    this.updateAuthState({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null
    });

    const token = this.tokenService.getAccessToken();
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    return this.http.post<any>(
      `${environment.apiUrl}/api/v1/auth/change-password`,
      { oldPassword, newPassword },
      headers ? { headers } : {}
    ).pipe(
      tap(() => {
        this.updateAuthState({
          ...this.authStateSubject.value,
          isLoading: false,
          error: null
        });
      }),
      map(() => undefined),
      catchError(error => {
        const errorMessage = 'Change password failed';
        this.updateAuthState({
          ...this.authStateSubject.value,
          isLoading: false,
          error: errorMessage
        });
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  clearError(): void {
    this.updateAuthState({
      ...this.authStateSubject.value,
      error: null
    });
  }

  private updateAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
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
