import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Category } from '../../domain/model/category.entity';
import { environment } from '../../../../../environments/environments';
import { TokenService } from '../../../authentication/infrastructure/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryRepositoryImpl {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/categories`;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService
  ) {}

  private getHeaders(): HttpHeaders {
    let token = this.tokenService.getAccessToken();
    if (!token) {
      token = localStorage.getItem(environment.tokenKey);
    }
    if (!token) {
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('CategoryRepository - getAll error:', err);
        return of([]);
      })
    );
  }

  create(name: string): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, { name }, { headers: this.getHeaders() }).pipe(
      map((res) => res),
      catchError((err) => {
        console.error('CategoryRepository - create error:', err);
        throw err;
      })
    );
  }
}
