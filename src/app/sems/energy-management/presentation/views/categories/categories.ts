import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category } from '../../../domain/model/category.entity';
import { CategoryService } from '../../../application/services/category.service';
import { AuthControllerService } from '../../../../authentication/application/services/auth-controller.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit, OnDestroy {
  categories: Category[] = [];
  loading = true;
  saving = false;
  error: string | null = null;
  saveError: string | null = null;
  saveSuccess = false;

  categoryForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly categoryService: CategoryService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly authController: AuthControllerService
  ) {}

  ngOnInit(): void {
    if (!this.authController.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]]
    });
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.loading = true;
    this.error = null;
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cats) => {
          this.categories = cats;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = this.translateService.instant('dashboard.devices.categoryError');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onAddCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.saveError = null;
    this.saveSuccess = false;
    const name = this.categoryForm.value.name.trim();

    this.categoryService.createCategory(name)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.saveSuccess = true;
          this.categoryForm.reset();
          this.loadCategories();
        },
        error: () => {
          this.saving = false;
          this.saveError = this.translateService.instant('dashboard.devices.categoryError');
          this.cdr.detectChanges();
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/devices']);
  }
}
