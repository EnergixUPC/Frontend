import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface FAQ {
  question: string;
  answer: string;
}

interface Tutorial {
  title: string;
  description: string;
}

@Component({
  selector: 'app-settings-suports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './settings-suports.html',
  styleUrl: './settings-suports.css'
})
export class SettingsSuports {
  showFaqModal = false;
  showHelpModal = false;
  showTutorialsModal = false;

  // Kept as placeholders so *ngFor can iterate; labels come from i18n
  faqs: FAQ[] = [{}, {}, {}] as FAQ[];

  tutorials: Tutorial[] = [{}, {}, {}, {}] as Tutorial[];

  contactInfo = {
    email: 'soporte@energysems.com',
    phone: '+1 (555) 123-4567',
    whatsapp: '+1555987654',
    socials: {
      facebook: 'https://facebook.com/energysems',
      twitter: 'https://twitter.com/energysems',
      instagram: 'https://instagram.com/energysems',
      linkedin: 'https://linkedin.com/company/energysems'
    }
  };

  helpMessage = '';

  constructor(private snackBar: MatSnackBar, private translate: TranslateService) { }

  t(key: string): string {
    return this.translate.instant(key);
  }

  openFaqModal(): void { this.showFaqModal = true; }
  closeFaqModal(): void { this.showFaqModal = false; }
  openHelpModal(): void { this.showHelpModal = true; }
  closeHelpModal(): void { this.showHelpModal = false; this.helpMessage = ''; }
  openTutorialsModal(): void { this.showTutorialsModal = true; }
  closeTutorialsModal(): void { this.showTutorialsModal = false; }

  sendHelpMessage(): void {
    if (!this.helpMessage.trim()) {
      this.snackBar.open(this.t('settings.support.help.emptyMessage'), this.t('common.close'), { duration: 3000 });
      return;
    }
    this.snackBar.open(this.t('settings.support.help.successMessage'), this.t('common.close'), { duration: 3000 });
    this.closeHelpModal();
  }

  copyToClipboard(text: string, type: string): void {
    navigator.clipboard.writeText(text);
    this.snackBar.open(
      this.translate.instant('settings.support.help.copiedMessage', { type }),
      this.t('common.close'),
      { duration: 2000 }
    );
  }

  openWhatsApp(): void {
    window.open(`https://wa.me/${this.contactInfo.whatsapp}`, '_blank');
  }

  closeAllModals(): void {
    this.closeFaqModal();
    this.closeHelpModal();
    this.closeTutorialsModal();
  }
}
