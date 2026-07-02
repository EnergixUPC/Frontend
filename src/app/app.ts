import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend-sems');

  constructor(
    private translate: TranslateService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Translations must be registered here (in the root shell, present on every
    // route) rather than only in lang-switcher, otherwise standalone routes that
    // don't render lang-switcher (e.g. the public /demo route) never load them.
    this.translate.setDefaultLang('es');

    this.http.get<any>('./i18n/en.json').subscribe({
      next: (translations) => this.translate.setTranslation('en', translations),
      error: (error) => console.error('Error loading English translations:', error)
    });

    this.http.get<any>('./i18n/es.json').subscribe({
      next: (translations) => this.translate.setTranslation('es', translations),
      error: (error) => console.error('Error loading Spanish translations:', error)
    });

    const savedLanguage = typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem('preferred-language')
      : null;
    this.translate.use(savedLanguage === 'en' ? 'en' : 'es');
  }
}
