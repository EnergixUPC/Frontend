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
    console.log('🚀 AuthService - Initializing auth state...');
    
    const hasValidToken = this.tokenService.hasValidToken();
    
    console.log('🔑 AuthService - Has valid token:', hasValidToken);
    
    if (hasValidToken) {
      console.log('✅ AuthService - Token valid, fetching user profile from backend...');
      // Si hay token válido, obtener el perfil del usuario desde el backend
      this.getUserProfile().subscribe({
        next: (user) => {
          console.log('✅ AuthService - Profile loaded successfully:', user);
          this.updateAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        },
        error: (error) => {
          console.error('❌ AuthService - Failed to load profile:', error);
          this.clearAuthState();
        }
      });
    } else {
      console.log('❌ AuthService - No valid token, setting unauthenticated state');
      this.updateAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }

  private getUserProfile(): Observable<User> {
    const token = this.tokenService.getAccessToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${environment.apiUrl}/api/v1/auth/profile`, { headers }).pipe(
      map(userData => {
        console.log('🔄 AuthService - Processing profile data from backend:', userData);
        
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

        console.log('✨ AuthService - User object created from profile:', {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phoneNumber: user.phoneNumber,
          address: user.address
        });

        // Save user to localStorage for offline access
        this.tokenService.saveUser(user);

        return user;
      })
    );
  }

  login(username: string, password: string): Observable<{ user: User; tokens: TokenPair }> {
    console.log('🔐 AuthService - Starting login process');
    console.log('👤 AuthService - Username:', username);
    console.log('🔒 AuthService - Password length:', password.length);
    
    this.updateAuthState({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null
    });

    const apiUrl = `${environment.apiUrl}/api/v1/auth/login`;
    const loginPayload = { email: username, password };
    
    console.log('📡 AuthService - Making login POST request to:', apiUrl);
    console.log('📤 AuthService - Login payload:', { email: username, password: '***' });

    // Use API to validate credentials
    return this.http.post<any>(apiUrl, loginPayload).pipe(
      tap(response => {
        console.log('✅ AuthService - Login API response received');
        console.log('📋 AuthService - Response keys:', Object.keys(response));
        console.log('🔍 AuthService - Full response:', response);
      }),
      map(response => {
        console.log('🔄 AuthService - Processing login response...');
        console.log('🔍 AuthService - Response structure:', JSON.stringify(response, null, 2));
        
        const userData = response.user || response;
        console.log('👤 AuthService - User data extracted:', JSON.stringify(userData, null, 2));
        console.log('📝 AuthService - userData.firstName:', userData.firstName);
        console.log('📝 AuthService - userData.lastName:', userData.lastName);
        console.log('📝 AuthService - userData.email:', userData.email);
        console.log('📝 AuthService - userData.username:', userData.username);
        console.log('📝 AuthService - userData.phoneNumber:', userData.phoneNumber);
        console.log('📝 AuthService - userData.address:', userData.address);
        
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

        console.log('✨ AuthService - User object created:', JSON.stringify({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phoneNumber: user.phoneNumber,
          address: user.address
        }, null, 2));

        const tokens = new TokenPair(
          response.accessToken,
          response.refreshToken || undefined,
          response.expiresIn
        );

        console.log('🔑 AuthService - Token pair created');
        console.log('🔑 Access Token preview:', response.accessToken ? response.accessToken.substring(0, 20) + '...' : 'No access token');
        console.log('🔄 Refresh Token:', response.refreshToken ? 'Present' : 'Not present');

        // Save tokens and user
        console.log('💾 AuthService - Saving tokens to localStorage...');
        this.tokenService.saveTokens(tokens);
        
        console.log('💾 AuthService - Saving user to localStorage...');
        this.tokenService.saveUser(user);

        // Verify saved data
        const savedToken = this.tokenService.getAccessToken();
        const savedUser = this.tokenService.getUser();
        console.log('✅ AuthService - Verification - Token saved:', savedToken ? 'Yes' : 'No');
        console.log('✅ AuthService - Verification - User saved:', savedUser ? 'Yes' : 'No');

        // Update auth state
        this.updateAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        console.log('🎉 AuthService - Auth state updated successfully!');
        console.log('👤 AuthService - Current user in state:', this.authStateSubject.value.user?.email);
        console.log('🔐 AuthService - Is authenticated:', this.authStateSubject.value.isAuthenticated);

        return { user, tokens };
      }),
      catchError(error => {
        console.error('❌ AuthService - Login error occurred:', error);
        console.error('❌ Login error status:', error.status);
        console.error('❌ Login error message:', error.message);
        console.error('❌ Full login error:', JSON.stringify(error, null, 2));
        
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
    console.log('🚀 AuthService - Starting registration process with command:', command);
    
    this.updateAuthState({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null
    });

    const apiUrl = `${environment.apiUrl}/api/v1/auth/register`;
    console.log('📡 AuthService - Making POST request to:', apiUrl);
    console.log('📤 AuthService - Request payload:', JSON.stringify(command, null, 2));

    // Register user via API
    return this.http.post<any>(apiUrl, command).pipe(
      tap(response => {
        console.log('✅ AuthService - Registration successful, response received:', response);
        console.log('📋 AuthService - Response structure:', Object.keys(response));
      }),
      switchMap(response => {
        console.log('🔄 AuthService - Now attempting auto-login with email:', command.email);
        
        // After registration, automatically login to get tokens
        return this.login(command.email, command.password);
      }),
      catchError(error => {
        console.error('❌ AuthService - Registration error occurred:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error:', JSON.stringify(error, null, 2));
        
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
