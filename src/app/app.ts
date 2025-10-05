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
    // Set default language
    this.translate.setDefaultLang('es');
    
    // Load translations manually
    this.http.get<any>('./i18n/es.json').subscribe({
      next: (translations) => {
        this.translate.setTranslation('es', translations);
        this.translate.use('es');
      },
      error: (error) => {
        console.error('Error loading translations:', error);
        this.translate.use('es');
      }
    });
  }
}
