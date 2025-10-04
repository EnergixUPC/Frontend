import { Injectable } from '@angular/core';
import { TokenPair } from '../../domain/model/entities/token-pair.entity';
import { User } from '../../domain/model/entities/user.entity';
import { environment } from '../../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = environment.tokenKey;
  private readonly REFRESH_TOKEN_KEY = environment.refreshTokenKey;
  private readonly USER_KEY = environment.userKey;

  constructor() {}

  saveTokens(tokens: TokenPair): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
      
      // Also save token expiration
      const expirationDate = tokens.getExpirationDate();
      localStorage.setItem(`${this.TOKEN_KEY}_expires`, expirationDate.toISOString());
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  getTokenPair(): TokenPair | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiresAt = localStorage.getItem(`${this.TOKEN_KEY}_expires`);

    if (!accessToken || !refreshToken || !expiresAt) {
      return null;
    }

    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const expiresIn = Math.max(0, Math.floor((expirationDate.getTime() - now.getTime()) / 1000));

    return new TokenPair(accessToken, refreshToken, expiresIn);
  }

  isTokenExpired(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return true;
    }
    
    const expiresAt = localStorage.getItem(`${this.TOKEN_KEY}_expires`);
    if (!expiresAt) {
      return true;
    }

    const expirationDate = new Date(expiresAt);
    return new Date() >= expirationDate;
  }

  saveUser(user: User): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.USER_KEY, JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString()
      }));
    }
  }

  getUser(): User | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) {
      return null;
    }

    try {
      const parsed = JSON.parse(userData);
      return new User(
        parsed.id,
        parsed.email,
        parsed.firstName,
        parsed.lastName,
        parsed.role,
        parsed.isActive,
        new Date(parsed.createdAt),
        parsed.lastLogin ? new Date(parsed.lastLogin) : undefined
      );
    } catch {
      return null;
    }
  }

  clearTokens(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(`${this.TOKEN_KEY}_expires`);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  hasValidToken(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired();
  }

  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    return `Bearer ${token}`;
  }
}