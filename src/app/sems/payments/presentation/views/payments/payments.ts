import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

interface PlanCard {
  titleKey: string;
  taglineKey: string;
  priceKey: string;
  periodKey: string;
  featureKeys: string[];
  badgeKey?: string;
  featured?: boolean;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './payments.html',
  styleUrls: ['./payments.css']
})
export class Payments {
  plans: PlanCard[] = [
    {
      titleKey: 'payments.plans.basic.title',
      taglineKey: 'payments.plans.basic.tagline',
      priceKey: 'payments.plans.basic.price',
      periodKey: 'payments.plans.basic.period',
      featureKeys: [
        'payments.plans.basic.features.monitoring',
        'payments.plans.basic.features.alerts',
        'payments.plans.basic.features.reports',
        'payments.plans.basic.features.support'
      ]
    },
    {
      titleKey: 'payments.plans.premium.title',
      taglineKey: 'payments.plans.premium.tagline',
      priceKey: 'payments.plans.premium.price',
      periodKey: 'payments.plans.premium.period',
      badgeKey: 'payments.plans.premium.badge',
      featured: true,
      featureKeys: [
        'payments.plans.premium.features.includesBasic',
        'payments.plans.premium.features.deviceAnalysis',
        'payments.plans.premium.features.savingsTips',
        'payments.plans.premium.features.comparisons',
        'payments.plans.premium.features.prioritySupport'
      ]
    },
    {
      titleKey: 'payments.plans.annual.title',
      taglineKey: 'payments.plans.annual.tagline',
      priceKey: 'payments.plans.annual.price',
      periodKey: 'payments.plans.annual.period',
      featureKeys: [
        'payments.plans.annual.features.includesPremium',
        'payments.plans.annual.features.savings',
        'payments.plans.annual.features.earlyAccess',
        'payments.plans.annual.features.freeInstall'
      ]
    }
  ];
}

