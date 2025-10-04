import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './lang-switcher.html',
  styleUrl: './lang-switcher.css'
})
export class LangSwitcher implements OnInit {
  currentLanguage = 'es';
  
  languages = [
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'en', name: 'English', flag: 'EN' }
  ];

  constructor(
    private translate: TranslateService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Load translation files manually
    this.loadTranslations();
    
    // Set default language to Spanish
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.currentLanguage = 'es';
    
    // Check for saved language preference (only in browser)
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('preferred-language');
      if (savedLanguage && this.languages.some(lang => lang.code === savedLanguage)) {
        this.currentLanguage = savedLanguage;
        this.translate.use(savedLanguage);
      }
    }
  }

  private loadTranslations(): void {
    // Load English translations
    this.http.get<any>('/i18n/en.json').subscribe({
      next: (translations) => {
        this.translate.setTranslation('en', translations);
      },
      error: (error) => {
        console.error('Error loading English translations:', error);
      }
    });

    // Load Spanish translations
    this.http.get<any>('/i18n/es.json').subscribe({
      next: (translations) => {
        this.translate.setTranslation('es', translations);
      },
      error: (error) => {
        console.error('Error loading Spanish translations:', error);
      }
    });
  }

  onLanguageChange(languageCode: string): void {
    this.currentLanguage = languageCode;
    this.translate.use(languageCode);
    
    // Save language preference to localStorage (only in browser)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('preferred-language', languageCode);
    }
  }

  getCurrentLanguageName(): string {
    const currentLang = this.languages.find(lang => lang.code === this.currentLanguage);
    return currentLang ? currentLang.name : 'Español';
  }
}
