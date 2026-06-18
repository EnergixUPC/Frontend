import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NewsService } from '../../../../../shared/infrastructure/services/news.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './news.html',
  styleUrl: './news.css'
})
export class News implements OnInit {
  newsItems: any[] = [];
  isLoading = true;

  constructor(
    private newsService: NewsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.newsService.getNewsAndTips().subscribe({
      next: (data: any) => {
        this.newsItems = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load news', err);
        // Fallback or empty state
        this.isLoading = false;
      }
    });
  }
}
