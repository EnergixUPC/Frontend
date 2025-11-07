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

    const loginRequest = {
      username: username,
      password: password
    };

    return this.http.post<any>(`${environment.apiUrl}/api/v1/auth/login`, loginRequest).pipe(
      switchMap(response => {
        console.log('AuthService - API response:', response);

        // El backend devuelve un TokenPair con accessToken
        const tokens = new TokenPair(
          response.accessToken,
          response.refreshToken || response.accessToken,
          response.expiresIn || 3600
        );

        // Guardar tokens primero
        this.tokenService.saveTokens(tokens);

        // Llamar al endpoint /profile para obtener datos completos del usuario
        return this.getUserProfile(tokens.accessToken).pipe(
          map(user => ({ user, tokens }))
        );
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

  private getUserProfile(token: string): Observable<User> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${environment.apiUrl}/api/v1/auth/profile`, { headers }).pipe(
      map(userData => {
        const user = new User(
          userData.id.toString(),
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
}
