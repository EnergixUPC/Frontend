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

  constructor() { }

  saveTokens(tokens: TokenPair): void {
    console.log('TokenService - Starting to save tokens...');
    console.log('TokenService - Access token length:', tokens.accessToken?.length || 0);
    console.log('TokenService - Refresh token:', tokens.refreshToken ? 'Present' : 'Not present');

    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('TokenService - localStorage is available');

      localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
      console.log('TokenService - Access token saved with key:', this.TOKEN_KEY);

      if (tokens.refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
        console.log('TokenService - Refresh token saved with key:', this.REFRESH_TOKEN_KEY);
      } else {
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        console.log('TokenService - Refresh token removed');
      }

      // Also save token expiration
      const expirationDate = tokens.getExpirationDate();
      localStorage.setItem(`${this.TOKEN_KEY}_expires`, expirationDate.toISOString());
      console.log('TokenService - Token expiration saved:', expirationDate.toISOString());

      // Verify what was actually saved
      const savedToken = localStorage.getItem(this.TOKEN_KEY);
      console.log('TokenService - Verification - Token saved successfully:', savedToken ? 'Yes' : 'No');
      if (savedToken) {
        console.log('TokenService - Saved token preview:', savedToken.substring(0, 20) + '...');
      }
    } else {
      console.error('TokenService - localStorage not available!');
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

    if (!accessToken || !expiresAt) {
      return null;
    }

    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const expiresIn = Math.max(0, Math.floor((expirationDate.getTime() - now.getTime()) / 1000));

    return new TokenPair(accessToken, refreshToken || undefined, expiresIn);
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
    console.log('TokenService - Starting to save user...');
    console.log('TokenService - User data:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: user.role,
      plan: user.plan
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('TokenService - localStorage available for user saving');

      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePhotoUrl: user.profilePhotoUrl,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString(),
        plan: user.plan
      };

      console.log('TokenService - Complete user data to save:', userData);

      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));

      console.log('TokenService - User saved with key:', this.USER_KEY);

      // Verify what was actually saved
      const savedUserData = localStorage.getItem(this.USER_KEY);
      console.log('TokenService - Verification - User saved successfully:', savedUserData ? 'Yes' : 'No');
      if (savedUserData) {
        try {
          const parsedUser = JSON.parse(savedUserData);
          console.log('TokenService - Saved user email:', parsedUser.email);
        } catch (e) {
          console.error('TokenService - Error parsing saved user data:', e);
        }
      }
    } else {
      console.error('TokenService - localStorage not available for user saving!');
    }
  }

  getUser(): User | null {
    console.log('TokenService - Getting user from localStorage...');

    if (typeof window === 'undefined' || !window.localStorage) {
      console.log('TokenService - localStorage not available for getting user');
      return null;
    }

    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) {
      console.log('TokenService - No user data found in localStorage');
      return null;
    }

    try {
      const parsed = JSON.parse(userData);
      console.log('TokenService - Parsed user data from localStorage:', parsed);

      const user = new User(
        parsed.id,
        parsed.email,
        parsed.firstName,
        parsed.lastName,
        parsed.role,
        parsed.isActive,
        new Date(parsed.createdAt),
        parsed.lastLogin ? new Date(parsed.lastLogin) : undefined,
        parsed.username,
        parsed.phoneNumber,
        parsed.address,
        parsed.profilePhotoUrl,
        parsed.plan || 'basic'
      );

      console.log('TokenService - User object restored from localStorage:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phoneNumber: user.phoneNumber,
        address: user.address,
        plan: user.plan
      });

      return user;
    } catch (e) {
      console.error('TokenService - Error parsing user data from localStorage:', e);
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