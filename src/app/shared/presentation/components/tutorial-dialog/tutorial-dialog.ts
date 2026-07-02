import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface TutorialDialogData {
  /** Índice del paso con el que se debe abrir el tutorial (0-based). */
  startIndex?: number;
}

/**
 * US24: guía interactiva paso a paso que explica cómo leer los gráficos del dashboard
 * (kWh, consumo histórico) y las funciones principales de la plataforma.
 * Se muestra automáticamente en el primer acceso al dashboard (ver Home) y puede
 * reabrirse desde "Ver tutorial" en el centro de ayuda (Configuración > Soporte).
 */
@Component({
  selector: 'app-tutorial-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './tutorial-dialog.html',
  styleUrl: './tutorial-dialog.css'
})
export class TutorialDialog {
  readonly totalSteps = 4;
  currentStep: number;

  constructor(
    private dialogRef: MatDialogRef<TutorialDialog>,
    @Inject(MAT_DIALOG_DATA) data: TutorialDialogData
  ) {
    this.currentStep = data?.startIndex ?? 0;
  }

  get isFirst(): boolean {
    return this.currentStep === 0;
  }

  get isLast(): boolean {
    return this.currentStep === this.totalSteps - 1;
  }

  next(): void {
    if (!this.isLast) this.currentStep++;
  }

  previous(): void {
    if (!this.isFirst) this.currentStep--;
  }

  goTo(step: number): void {
    this.currentStep = step;
  }

  finish(): void {
    this.dialogRef.close();
  }
}
