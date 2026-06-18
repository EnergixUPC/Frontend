import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class HelpCenterService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/help-center/articles`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getArticles(query?: string): Observable<any[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('query', query);
    }
    return this.http.get<any[]>(this.apiUrl, { params, headers: this.getHeaders() });
  }

  createArticle(article: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, article, { headers: this.getHeaders() });
  }
}
