import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserRepository, AuthRepository } from '../../domain/model/repositories/auth.repository';
import { User } from '../../domain/model/entities/user.entity';
import { TokenPair } from '../../domain/model/entities/token-pair.entity';
import { LoginCredentials } from '../../domain/model/value-objects/login-credentials.value-object';
import { environment } from '../../../../../environments/environments';

// DTOs for API communication
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  plan?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserRepositoryImpl implements UserRepository, AuthRepository {
  private readonly authUrl = `${environment.apiUrl}/api/v1/authentication`;
  private readonly usersUrl = `${environment.apiUrl}/api/v1/users`;
  constructor(private readonly http: HttpClient) {}

  // UserRepository methods
  findByEmail(email: string): Observable<User | null> {
    return this.http.get<UserResponse>(`${this.usersUrl}/email/${email}`)
      .pipe(
        map(response => this.mapToUser(response)),
        catchError(() => of(null))
      );
  }

  findById(id: string): Observable<User | null> {
    return this.http.get<UserResponse>(`${this.usersUrl}/${id}`)
      .pipe(
        map(response => this.mapToUser(response)),
        catchError(() => of(null))
      );
  }

  findByUsername(username: string): Observable<User | null> {
    return this.http.get<UserResponse>(`${this.usersUrl}/username/${username}`)
      .pipe(
        map(response => this.mapToUser(response)),
        catchError(() => of(null))
      );
  }

  save(user: User): Observable<User> {
    const userDto = this.mapToUserResponse(user);
    return this.http.put<UserResponse>(`${this.usersUrl}/${user.id}`, userDto)
      .pipe(
        map(response => this.mapToUser(response))
      );
  }

  existsByEmail(email: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${this.usersUrl}/email/${email}/exists`)
      .pipe(
        map(response => response.exists),
        catchError(() => of(false))
      );
  }

  // AuthRepository methods
  login(credentials: LoginCredentials): Observable<{ user: User; tokens: TokenPair; }> {
    const loginRequest: LoginRequest = {
      username: credentials.username,
      password: credentials.password
    };

    return this.http.post<LoginResponse>(`${this.authUrl}/sign-in`, loginRequest)
      .pipe(
        map(response => ({
          user: this.mapToUser(response.user),
          tokens: new TokenPair(
            response.accessToken,
            response.refreshToken || undefined,
            response.expiresIn,
            response.tokenType
          )
        }))
      );
  }

  logout(token: string): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/sign-out`, { token });
  }

  refreshToken(refreshToken: string): Observable<TokenPair> {
    return this.http.post<TokenResponse>(`${this.authUrl}/refresh`, { refreshToken })
      .pipe(
        map(response => new TokenPair(
          response.accessToken,
          response.refreshToken || undefined,
          response.expiresIn,
          response.tokenType
        ))
      );
  }

  validateToken(token: string): Observable<boolean> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ valid: boolean }>(`${this.authUrl}/validate`, { headers })
      .pipe(
        map(response => response.valid),
        catchError(() => of(false))
      );
  }

  resetPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/reset-password`, { email });
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.usersUrl}/${userId}/password`, {
      oldPassword,
      newPassword
    });
  }

  // Mappers
  private mapToUser(response: UserResponse): User {
    return new User(
      response.id,
      response.email,
      response.firstName,
      response.lastName,
      response.role,
      response.isActive,
      new Date(response.createdAt || new Date()),
      response.lastLogin ? new Date(response.lastLogin) : undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      response.plan || 'basic'
    );
  }

  private mapToUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      plan: user.plan
    };
  }
}
