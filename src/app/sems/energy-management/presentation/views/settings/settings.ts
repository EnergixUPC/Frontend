import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings {
  selectedFrequency = 'Monthly';
  selectedFormat = 'PDF';

  constructor(private translate: TranslateService) {}

  t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  setFrequency(freq: string) {
    this.selectedFrequency = freq;
  }

  setFormat(fmt: string) {
    this.selectedFormat = fmt;
  }
  selectedFrequencies: string[] = [];
  selectedFormats: string[] = [];

  toggleFrequency(freq: string) {
    const idx = this.selectedFrequencies.indexOf(freq);
    if (idx > -1) {
      this.selectedFrequencies.splice(idx, 1);
    } else if (this.selectedFrequencies.length < 2) {
      this.selectedFrequencies.push(freq);
    }
  }
  toggleFormat(fmt: string) {
    const idx = this.selectedFormats.indexOf(fmt);
    if (idx > -1) {
      this.selectedFormats.splice(idx, 1);
    } else if (this.selectedFormats.length < 2) {
      this.selectedFormats.push(fmt);
    }
  }
}

