import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.css'
})
export class StatsCard {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() subtitle: string = '';
  @Input() borderColor: string = '#000';
  @Input() icon?: string;
}
