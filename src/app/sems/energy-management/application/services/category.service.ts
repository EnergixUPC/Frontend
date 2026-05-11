import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../domain/model/category.entity';
import { CategoryRepositoryImpl } from '../../infrastructure/repositories/category-repository.impl';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepositoryImpl) {}

  getCategories(): Observable<Category[]> {
    return this.categoryRepository.getAll();
  }

  createCategory(name: string): Observable<Category> {
    return this.categoryRepository.create(name);
  }
}
