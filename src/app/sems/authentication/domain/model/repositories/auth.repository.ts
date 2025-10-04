import { User } from '../entities/user.entity';
import { TokenPair } from '../entities/token-pair.entity';
import { LoginCredentials } from '../value-objects/login-credentials.value-object';
import { Observable } from 'rxjs';

export interface UserRepository {
  findByEmail(email: string): Observable<User | null>;
  findById(id: string): Observable<User | null>;
  findByUsername(username: string): Observable<User | null>;
  save(user: User): Observable<User>;
  existsByEmail(email: string): Observable<boolean>;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Observable<{
    user: User;
    tokens: TokenPair;
  }>;
  logout(token: string): Observable<void>;
  refreshToken(refreshToken: string): Observable<TokenPair>;
  validateToken(token: string): Observable<boolean>;
  resetPassword(email: string): Observable<void>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<void>;
}