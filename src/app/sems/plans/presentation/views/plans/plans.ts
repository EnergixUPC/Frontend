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
      titleKey: 'plans.basic.title',
      taglineKey: 'plans.basic.tagline',
      priceKey: 'plans.basic.price',
      periodKey: 'plans.basic.period',
      featureKeys: [
        'plans.basic.features.monitoring',
        'plans.basic.features.alerts',
        'plans.basic.features.reports',
        'plans.basic.features.support'
      ]
    },
    {
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
}
