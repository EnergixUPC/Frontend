import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Location } from '../../domain/model/location.entity';
import { LocationRepositoryImpl } from '../../infrastructure/repositories/location-repository.impl';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private readonly locationRepository: LocationRepositoryImpl) {}

  getLocations(): Observable<Location[]> {
    return this.locationRepository.getAll();
  }

  createLocation(name: string): Observable<Location> {
    return this.locationRepository.create(name);
  }
}
