import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { LangSwitcher } from '../../components/lang-switcher/lang-switcher';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    LangSwitcher
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {
  faqs = [
    { q: 'landing.faq.q1', a: 'landing.faq.a1' },
    { q: 'landing.faq.q2', a: 'landing.faq.a2' },
    { q: 'landing.faq.q3', a: 'landing.faq.a3' },
    { q: 'landing.faq.q4', a: 'landing.faq.a4' }
  ];

  plans = [
    {
      name: 'landing.plans.basic.name',
      price: 'landing.plans.basic.price',
      features: ['landing.plans.basic.f1', 'landing.plans.basic.f2', 'landing.plans.basic.f3']
    },
    {
      name: 'landing.plans.premium.name',
      price: 'landing.plans.premium.price',
      isPremium: true,
      features: ['landing.plans.premium.f1', 'landing.plans.premium.f2', 'landing.plans.premium.f3', 'landing.plans.premium.f4']
    }
  ];

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
