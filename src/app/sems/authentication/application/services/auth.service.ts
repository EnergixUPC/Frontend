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
    const token = this.tokenService.getAccessToken();
    const hasValidToken = this.tokenService.hasValidToken();

    if (user && hasValidToken && token) {
      // Use cached user data
      console.log('AuthService - Using cached user data:', user);
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
    return this.http.post<any>(`${environment.apiUrl}/api/v1/authentication/sign-in`, { email: username, password }).pipe(
      map(response => {
        console.log('AuthService - Full API response:', JSON.stringify(response, null, 2));

        // Extract token - could be 'token', 'accessToken', or 'access_token'
        const token = response.token || response.accessToken || response.access_token;
        const refreshToken = response.refreshToken || response.refresh_token;

        console.log('AuthService - Extracted token:', token);
        console.log('AuthService - Extracted refreshToken:', refreshToken);

        const tokens = new TokenPair(
          token,
          refreshToken || undefined,
          response.expiresIn || 3600
        );

        // Save tokens first
        this.tokenService.saveTokens(tokens);

        // Extract user data from response.user object
        const userFromResponse = response.user;
        console.log('AuthService - User object from response:', userFromResponse);

        if (!userFromResponse) {
          throw new Error('No user data received from server');
        }

        // Create user from response.user
        const user = new User(
          (userFromResponse.id ?? 0).toString(),
          userFromResponse.email || username,
          userFromResponse.name || 'User',
          userFromResponse.lastName || '',
          'USER',
          true,
          new Date(),
          new Date(),
          undefined,
          userFromResponse.phone,
          userFromResponse.address,
          userFromResponse.profilePhotoUrl
        );

        console.log('AuthService - Created user object:', user);

        // Save user
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

  register(command: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string; address: string }): Observable<{ user: User; tokens: TokenPair }> {
    this.updateAuthState({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null
    });

    // Transform to match backend expected format
    const requestBody = {
      email: command.email,
      password: command.password,
      name: command.firstName,
      lastName: command.lastName,
      phone: command.phoneNumber.replace(/\s+/g, ''), // Remove all spaces from phone
      address: command.address
    };

    // Log the request payload
    console.log('AuthService - Register payload:', JSON.stringify(requestBody, null, 2));
    console.log('AuthService - Register URL:', `${environment.apiUrl}/api/v1/authentication/sign-up`);

    // Register user via API with text response type to capture error details
    return this.http.post<any>(`${environment.apiUrl}/api/v1/authentication/sign-up`, requestBody, {
      observe: 'response',
      responseType: 'json' as 'json'
    }).pipe(
      map(response => response.body),
      switchMap(response => {
        console.log('AuthService - User registered successfully:', response);

        // After registration, automatically login to get tokens
        return this.login(command.email, command.password);
      }),
      catchError(error => {
        console.error('AuthService - Register error:', error);
        console.error('AuthService - Register error status:', error.status);
        console.error('AuthService - Register error body:', error.error);
        console.error('AuthService - Register error message:', error.message);
        
        // Try to extract meaningful error message
        let errorMessage = 'Error en el registro. Por favor verifica que el email no esté ya registrado.';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.details) {
            errorMessage = error.error.details;
          }
        }
        
        console.error('AuthService - Extracted error message:', errorMessage);

        this.updateAuthState({
          ...this.authStateSubject.value,
          isLoading: false,
          error: errorMessage
        });

        return throwError(() => new Error(errorMessage));
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

  // Public method to update user data (e.g., when profile is updated)
  public updateCurrentUser(user: User): void {
    this.tokenService.saveUser(user);
    this.updateAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
    console.log('AuthService - User updated and state notified');
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
