import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../authentication/application/services/auth.service';
import { OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

interface PlanCard {
  type: 'basic' | 'premium' | 'annual';
  titleKey: string;
  taglineKey: string;
  priceKey: string;
  periodKey: string;
  featureKeys: string[];
  badgeKey?: string;
  featured?: boolean;
}

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './plans.html',
  styleUrls: ['./plans.css']
})
export class Plans implements OnInit, OnDestroy {
  plans: PlanCard[] = [
    {
      type: 'basic',
      titleKey: 'plans.basic.title',
      taglineKey: 'plans.basic.tagline',
      priceKey: 'plans.basic.price',
      periodKey: 'plans.basic.period',
      featureKeys: [
        'plans.basic.features.monitoring',
        'plans.basic.features.alerts',
        'plans.basic.features.reports',
        'plans.basic.features.deviceManagement'
      ]
    },
    {
      type: 'premium',
      titleKey: 'plans.premium.title',
      taglineKey: 'plans.premium.tagline',
      priceKey: 'plans.premium.price',
      periodKey: 'plans.premium.period',
      badgeKey: 'plans.premium.badge',
      featured: true,
      featureKeys: [
        'plans.premium.features.includesBasic',
        'plans.premium.features.deviceAnalysis',
        'plans.premium.features.savingsTips',
        'plans.premium.features.comparisons',
        'plans.premium.features.prioritySupport'
      ]
    },
    {
      type: 'annual',
      titleKey: 'plans.annual.title',
      taglineKey: 'plans.annual.tagline',
      priceKey: 'plans.annual.price',
      periodKey: 'plans.annual.period',
      featureKeys: [
        'plans.annual.features.includesPremium',
        'plans.annual.features.savings',
        'plans.annual.features.earlyAccess',
        'plans.annual.features.freeInstall'
      ]
    }
  ];

  currentPlan: string = 'basic';
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: any) => {
        if (state.user) {
          this.currentPlan = state.user.plan || 'basic';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubscribe(plan: PlanCard): void {
    if (plan.type !== this.currentPlan) {
      this.router.navigate(['/plans/payments'], { queryParams: { plan: plan.type } });
    }
  }

  onCancelPlan(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.authService.updateUserPlan(currentUser.id, 'basic').subscribe({
        next: () => window.location.reload(),
        error: err => console.error('Error cancelling user plan:', err)
      });
    }
  }
}
