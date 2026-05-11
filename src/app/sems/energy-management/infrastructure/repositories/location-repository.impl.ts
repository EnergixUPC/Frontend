import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Location } from '../../domain/model/location.entity';
import { environment } from '../../../../../environments/environments';
import { TokenService } from '../../../authentication/infrastructure/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class LocationRepositoryImpl {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/locations`;

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

  getAll(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('LocationRepository - getAll error:', err);
        return of([]);
      })
    );
  }

  create(name: string): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, { name }, { headers: this.getHeaders() }).pipe(
      map((res) => res),
      catchError((err) => {
        console.error('LocationRepository - create error:', err);
        throw err;
      })
    );
  }
}
