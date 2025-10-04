import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ConsumptionByCategory } from '../../../domain/model/entities/consumption-by-category.entity';

@Component({
  selector: 'app-category-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TranslateModule
  ],
  templateUrl: './category-chart.html',
  styleUrl: './category-chart.css'
})
export class CategoryChart implements OnChanges {
  @Input() consumptionByCategory?: ConsumptionByCategory;

  constructor(private translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consumptionByCategory'] && this.consumptionByCategory) {
      // Data is ready to display
    }
  }

  getColor(index: number): string {
    const colors = ['#1976d2', '#1e88e5', '#42a5f5', '#64b5f6', '#90caf9'];
    return colors[index % colors.length];
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }
}
