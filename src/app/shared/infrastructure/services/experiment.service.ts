import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environments';

const VISITOR_ID_KEY = 'sems_experiment_visitor_id';
const VARIANT_CACHE_PREFIX = 'sems_experiment_variant_';

/**
 * Cliente del núcleo de experimentación (Fase 0 del plan de Capítulo 8): asigna/recupera la
 * variante de un experimento para el visitante/usuario actual y registra eventos de conversión.
 * Ver `com.backendsems.experiments` en el Backend.
 */
@Injectable({
  providedIn: 'root'
})
export class ExperimentService {

  constructor(private readonly http: HttpClient) {
  }

  /** UUID persistente por navegador, reutilizado para mantener la misma variante entre visitas. */
  getVisitorId(): string {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  }

  /**
   * Q1: adopta el visitorId propagado por query param (?exp_visitor=...) desde la Landing Page,
   * que vive en otro origen y por lo tanto no comparte localStorage con esta app. Así la variante
   * asignada allí (backend, idempotente por subjectId) se mantiene al llegar a /demo o /register.
   */
  adoptVisitorId(visitorId: string | null | undefined): void {
    if (visitorId) {
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
  }

  /** Pide (o recupera de cache local) la variante asignada al visitante actual para un experimento. */
  getVariant(experimentKey: string): Observable<string | null> {
    const cacheKey = VARIANT_CACHE_PREFIX + experimentKey;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.http.post<{ experimentKey: string; variant: string }>(
      `${environment.apiUrl}/api/v1/experiments/${experimentKey}/assignment`,
      { subjectId: this.getVisitorId(), deploymentEnv: environment.deploymentEnv }
    ).pipe(
      map(response => response.variant),
      tap(variant => localStorage.setItem(cacheKey, variant)),
      catchError(error => {
        console.error(`ExperimentService: failed to get variant for ${experimentKey}`, error);
        return of(null);
      })
    );
  }

  /**
   * Registra un evento de negocio (ej. "signup_completed") asociado al experimento. Fire-and-forget.
   * @param variantOverride Úsalo cuando la variante la decide el backend por otra identidad (ej.
   * el userId autenticado en "personalized-recommendations"), en vez del visitorId anónimo local.
   */
  track(experimentKey: string, eventName: string, metadata?: Record<string, unknown>, variantOverride?: string | null): void {
    const variant = variantOverride ?? localStorage.getItem(VARIANT_CACHE_PREFIX + experimentKey);

    this.http.post(
      `${environment.apiUrl}/api/v1/experiments/${experimentKey}/events`,
      {
        subjectId: this.getVisitorId(),
        eventName,
        variant,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    ).pipe(
      catchError(error => {
        console.error(`ExperimentService: failed to track "${eventName}" for ${experimentKey}`, error);
        return of(null);
      })
    ).subscribe();
  }
}
