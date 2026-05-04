import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

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
export class Plans {
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

  constructor(private router: Router) {}

  onSubscribe(plan: PlanCard): void {
    if (plan.type === 'premium' || plan.type === 'annual') {
      this.router.navigate(['/plans/payments'], { queryParams: { plan: plan.type } });
    }
  }
}
