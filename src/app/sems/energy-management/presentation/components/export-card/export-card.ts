import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReportService } from '../../../application/services/report.service';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportFormat {
  value: string;
  label: string;
}

interface ExportPeriod {
  value: string;
  labelKey: string;
  checked: boolean;
}

@Component({
  selector: 'app-export-card',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './export-card.html',
  styleUrl: './export-card.css'
})
export class ExportCard implements OnInit {
  selectedFormat: string = 'PDF';
  email: string = '';
  isDownloading: boolean = false;
  isSending: boolean = false;

  exportFormats: ExportFormat[] = [
    { value: 'PDF', label: 'PDF' },
    { value: 'EXCEL', label: 'Excel' },
    { value: 'CSV', label: 'CSV' }
  ];

  exportPeriods: ExportPeriod[] = [
    { value: 'all', labelKey: 'reports.export.periods.allData', checked: false },
    { value: 'lastMonth', labelKey: 'reports.export.periods.lastMonth', checked: true },
    { value: 'lastWeek', labelKey: 'reports.export.periods.lastWeek', checked: false }
  ];

  constructor(
    private translate: TranslateService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  onFormatChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedFormat = target.value;
  }

  onPeriodChange(period: ExportPeriod): void {
    // Uncheck all periods first
    this.exportPeriods.forEach(p => p.checked = false);
    // Check the selected period
    period.checked = true;
  }

  onDownload(): void {
    this.isDownloading = true;
    const selectedPeriod = this.exportPeriods.find(p => p.checked);

    console.log('Downloading report:', {
      format: this.selectedFormat,
      period: selectedPeriod?.value,
      periodLabel: selectedPeriod?.labelKey
    });

    // Get data from both charts
    forkJoin({
      topDevices: this.reportService.getTopDevices(),
      weeklyConsumption: this.reportService.getWeeklyConsumption()
    }).subscribe({
      next: (data) => {
        console.log('=== DATOS COMPLETOS RECIBIDOS ===');
        console.log('Datos obtenidos:', data);
        console.log('Top Devices:', data.topDevices);
        console.log('Weekly Consumption completo:', data.weeklyConsumption);
        console.log('Tipo de weeklyConsumption:', typeof data.weeklyConsumption);
        console.log('Es array weeklyConsumption:', Array.isArray(data.weeklyConsumption));

        // Verificar si tiene dailyConsumptions
        if (data.weeklyConsumption) {
          console.log('Propiedades de weeklyConsumption:', Object.keys(data.weeklyConsumption));
          console.log('dailyConsumptions:', data.weeklyConsumption.dailyConsumptions);
          console.log('Tipo de dailyConsumptions:', typeof data.weeklyConsumption.dailyConsumptions);
          console.log('Es array dailyConsumptions:', Array.isArray(data.weeklyConsumption.dailyConsumptions));
        }

        // Process weekly data using same logic as chart
        let weeklyData: any[] = [];

        if (data.weeklyConsumption && data.weeklyConsumption.dailyConsumptions && Array.isArray(data.weeklyConsumption.dailyConsumptions)) {
          weeklyData = data.weeklyConsumption.dailyConsumptions.map((daily: any) => ({
            day: daily.dayName,
            consumption: daily.consumption,
            label: daily.dayName,
            date: daily.date
          }));
          console.log('Weekly data processed:', weeklyData);
        } else if (Array.isArray(data.weeklyConsumption)) {
          // Caso alternativo: si weeklyConsumption es directamente un array
          weeklyData = data.weeklyConsumption;
          console.log('Using weeklyConsumption as direct array:', weeklyData);
        } else {
          console.warn('Weekly data not found in expected structure');
          console.log('Estructura recibida:', JSON.stringify(data.weeklyConsumption, null, 2));
        }

        // Procesar datos de dispositivos
        let devicesData = data.topDevices || [];

        console.log('=== DATOS FINALES PARA GENERAR ARCHIVO ===');
        console.log('Weekly Data final:', weeklyData);
        console.log('Devices Data final:', devicesData);
        console.log('Selected period:', selectedPeriod);

        switch (this.selectedFormat) {
          case 'PDF':
            this.generatePDF(devicesData, weeklyData, selectedPeriod);
            break;
          case 'EXCEL':
            this.generateExcel(devicesData, weeklyData, selectedPeriod);
            break;
          case 'CSV':
            this.generateCSV(devicesData, weeklyData, selectedPeriod);
            break;
          default:
            console.error('Formato no soportado:', this.selectedFormat);
        }

        this.isDownloading = false;
      },
      error: (error) => {
        console.error('Error obteniendo datos:', error);
        const errorMessage = this.translate.instant('reports.export.alerts.downloadError');
        alert(errorMessage);
        this.isDownloading = false;
      }
    });
  }

  onSendReport(): void {
    if (!this.email.trim()) {
      const message = this.translate.instant('reports.export.alerts.emailRequired');
      alert(message);
      return;
    }

    this.isSending = true;
    const selectedPeriod = this.exportPeriods.find(p => p.checked);

    console.log('Sending report:', {
      format: this.selectedFormat,
      period: selectedPeriod?.value,
      periodLabel: selectedPeriod?.labelKey,
      email: this.email
    });

    // Simulate send process
    setTimeout(() => {
      const periodLabel = this.translate.instant(selectedPeriod?.labelKey || '');
      const message = this.translate.instant('reports.export.alerts.sendSuccess', {
        format: this.selectedFormat,
        period: periodLabel,
        email: this.email
      });
      alert(message);
      this.isSending = false;
    }, 2000);
  }

  private generatePDF(topDevices: any[], weeklyConsumption: any[], selectedPeriod: any): void {
    try {
      const doc = new jsPDF();
      const showDeviceRanking = selectedPeriod?.value === 'all' || selectedPeriod?.value === 'lastMonth';
      const showWeeklyConsumption = selectedPeriod?.value === 'all' || selectedPeriod?.value === 'lastWeek';

      // Document title
      doc.setFontSize(20);
      doc.text('SEMS Energy Report', 20, 20);

      // Period information
      const periodLabel = this.translate.instant(selectedPeriod?.labelKey || '');
      doc.setFontSize(12);
      doc.text(`Period: ${periodLabel}`, 20, 35);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);

      let currentY = 65;

      // Device Ranking section (only if applicable)
      if (showDeviceRanking && topDevices && topDevices.length > 0) {
        doc.setFontSize(16);
        doc.text('Device Ranking', 20, currentY);

        const deviceTableData = topDevices.map((device, index) => [
          index + 1,
          device.deviceName || 'N/A',
          device.totalConsumption ? device.totalConsumption.toFixed(2) + ' kWh' : '0 kWh',
          device.deviceType || 'N/A'
        ]);

        autoTable(doc, {
          head: [['Rank', 'Device Name', 'Consumption', 'Type']],
          body: deviceTableData,
          startY: currentY + 10,
          theme: 'striped'
        });

        currentY = (doc as any).lastAutoTable?.finalY + 20 || currentY + 80;
      }

      // Weekly Consumption section (only if applicable)
      if (showWeeklyConsumption) {
        console.log('=== GENERATING WEEKLY CONSUMPTION SECTION ===');
        console.log('showWeeklyConsumption:', showWeeklyConsumption);
        console.log('weeklyConsumption recibido:', weeklyConsumption);
        console.log('weeklyConsumption length:', weeklyConsumption ? weeklyConsumption.length : 'undefined');

        doc.setFontSize(16);
        doc.text('Weekly Consumption Trend', 20, currentY);

        if (weeklyConsumption && weeklyConsumption.length > 0) {
          console.log('Consumption data available, processing...');

          // Calcular promedio semanal
          const totalConsumption = weeklyConsumption.reduce((sum, item) => {
            console.log('Item para suma:', item, 'consumption:', item.consumption);
            return sum + (item.consumption || 0);
          }, 0);
          const averageConsumption = totalConsumption / weeklyConsumption.length;

          console.log('Total consumption calculado:', totalConsumption);
          console.log('Average consumption calculado:', averageConsumption);

          // Mostrar promedio
          doc.setFontSize(12);
          doc.text(`Weekly Average: ${averageConsumption.toFixed(2)} kWh`, 20, currentY + 20);

          // Preparar datos para la tabla usando la estructura real
          const weeklyTableData = weeklyConsumption.map(item => {
            const day = item.day || item.dayName || item.label || 'Day';
            const consumption = item.consumption || 0;
            console.log('Mapeando item:', { originalItem: item, day: day, consumption: consumption });
            return [day, consumption.toFixed(2) + ' kWh'];
          });

          console.log('Datos finales para la tabla:', weeklyTableData);

          autoTable(doc, {
            head: [['Day', 'Consumption']],
            body: weeklyTableData,
            startY: currentY + 30,
            theme: 'striped'
          });

          // Add summary at the end
          const finalY = (doc as any).lastAutoTable?.finalY || currentY + 100;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total Weekly Consumption: ${totalConsumption.toFixed(2)} kWh`, 20, finalY + 15);
          doc.text(`Average Daily Consumption: ${averageConsumption.toFixed(2)} kWh`, 20, finalY + 25);
        } else {
          console.log('No consumption data available');
          doc.setFontSize(12);
          doc.text('No weekly consumption data available', 20, currentY + 20);
        }
      } else {
        console.log('showWeeklyConsumption is false, skipping section');
      }

      // Descargar el archivo
      const fileName = `sems-report-${selectedPeriod?.value || 'data'}.pdf`;
      doc.save(fileName);

      const successMessage = this.translate.instant('reports.export.alerts.downloadSuccess', {
        format: 'PDF',
        period: periodLabel
      });
      alert(successMessage);

    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = this.translate.instant('reports.export.alerts.downloadError');
      alert(errorMessage);
    }
  }

  private generateExcel(topDevices: any[], weeklyConsumption: any[], selectedPeriod: any): void {
    try {
      const workbook = XLSX.utils.book_new();
      const showDeviceRanking = selectedPeriod?.value === 'all' || selectedPeriod?.value === 'lastMonth';
      const showWeeklyConsumption = selectedPeriod?.value === 'all' || selectedPeriod?.value === 'lastWeek';
      const periodLabel = this.translate.instant(selectedPeriod?.labelKey || '');

      // Hoja 1: Device Ranking (solo si corresponde)
      if (showDeviceRanking && topDevices && topDevices.length > 0) {
        const deviceData = [
          ['SEMS Energy Report - Device Ranking'],
          [`Period: ${periodLabel}`],
          [`Generated on: ${new Date().toLocaleString()}`],
          [],
          ['Rank', 'Device Name', 'Consumption (kWh)', 'Type']
        ];

        topDevices.forEach((device, index) => {
          deviceData.push([
            index + 1,
            device.deviceName || 'N/A',
            device.totalConsumption || 0,
            device.deviceType || 'N/A'
          ]);
        });

        const deviceSheet = XLSX.utils.aoa_to_sheet(deviceData);
        XLSX.utils.book_append_sheet(workbook, deviceSheet, 'Device Ranking');
      }

      // Hoja 2: Weekly Consumption (solo si corresponde)
      if (showWeeklyConsumption) {
        const weeklyData = [
          ['SEMS Energy Report - Weekly Consumption'],
          [`Period: ${periodLabel}`],
          [`Generated on: ${new Date().toLocaleString()}`],
          [],
          ['Day', 'Consumption (kWh)']
        ];

        console.log('Generando Excel para weekly consumption:', weeklyConsumption);

        if (weeklyConsumption && weeklyConsumption.length > 0) {
          // Calcular promedio
          const totalConsumption = weeklyConsumption.reduce((sum, item) => sum + (item.consumption || 0), 0);
          const averageConsumption = totalConsumption / weeklyConsumption.length;

          weeklyConsumption.forEach(item => {
            weeklyData.push([
              item.day || item.dayName || item.label || 'Day',
              item.consumption || 0
            ]);
          });

          // Add summary rows
          weeklyData.push([]);
          weeklyData.push(['SUMMARY']);
          weeklyData.push(['Total Weekly Consumption', totalConsumption.toFixed(2)]);
          weeklyData.push(['Average Daily Consumption', averageConsumption.toFixed(2)]);
          weeklyData.push(['Weekly Average', `${averageConsumption.toFixed(2)} kWh`]);
        } else {
          weeklyData.push(['No weekly consumption data available', '']);
        }

        const weeklySheet = XLSX.utils.aoa_to_sheet(weeklyData);
        XLSX.utils.book_append_sheet(workbook, weeklySheet, 'Weekly Consumption');
      }

      // If no sheets, create empty sheet with message
      if (workbook.SheetNames.length === 0) {
        const emptyData = [
          ['SEMS Energy Report'],
          [`Period: ${periodLabel}`],
          [`Generated on: ${new Date().toLocaleString()}`],
          [],
          ['No data available for the selected period']
        ];
        const emptySheet = XLSX.utils.aoa_to_sheet(emptyData);
        XLSX.utils.book_append_sheet(workbook, emptySheet, 'Report');
      }

      // Descargar el archivo
      const fileName = `sems-report-${selectedPeriod?.value || 'data'}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      const successMessage = this.translate.instant('reports.export.alerts.downloadSuccess', {
        format: 'Excel',
        period: periodLabel
      });
      alert(successMessage);

    } catch (error) {
      console.error('Error generating Excel:', error);
      const errorMessage = this.translate.instant('reports.export.alerts.downloadError');
      alert(errorMessage);
    }
  }

  private generateCSV(topDevices: any[], weeklyConsumption: any[], selectedPeriod: any): void {
    try {
      const periodLabel = this.translate.instant(selectedPeriod?.labelKey || '');
      const showDeviceRanking = selectedPeriod?.value === 'all' || selectedPeriod?.value === 'lastMonth';
      const showWeeklyConsumption = selectedPeriod?.value === 'all' || selectedPeriod?.value === 'lastWeek';

      // Header del CSV
      let csvContent = `SEMS Energy Report\n`;
      csvContent += `Period: ${periodLabel}\n`;
      csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

      // Device Ranking Section (solo si corresponde)
      if (showDeviceRanking && topDevices && topDevices.length > 0) {
        csvContent += `Device Ranking\n`;
        csvContent += `Rank,Device Name,Consumption (kWh),Type\n`;

        topDevices.forEach((device, index) => {
          const consumption = device.totalConsumption || 0;
          const type = (device.deviceType || 'N/A').replace(',', ';'); // Escapar comas
          const name = (device.deviceName || 'N/A').replace(',', ';');
          csvContent += `${index + 1},"${name}",${consumption},"${type}"\n`;
        });

        csvContent += `\n`;
      }

      // Weekly Consumption Section (solo si corresponde)
      if (showWeeklyConsumption) {
        csvContent += `Weekly Consumption Trend\n`;
        csvContent += `Day,Consumption (kWh)\n`;

        console.log('Generando CSV para weekly consumption:', weeklyConsumption);

        if (weeklyConsumption && weeklyConsumption.length > 0) {
          // Calcular promedio
          const totalConsumption = weeklyConsumption.reduce((sum, item) => sum + (item.consumption || 0), 0);
          const averageConsumption = totalConsumption / weeklyConsumption.length;

          weeklyConsumption.forEach(item => {
            const day = (item.day || item.dayName || item.label || 'Day').replace(',', ';');
            const consumption = item.consumption || 0;
            csvContent += `"${day}",${consumption}\n`;
          });

          // Add summary
          csvContent += `\n`;
          csvContent += `SUMMARY\n`;
          csvContent += `Total Weekly Consumption,${totalConsumption.toFixed(2)}\n`;
          csvContent += `Average Daily Consumption,${averageConsumption.toFixed(2)}\n`;
          csvContent += `Weekly Average,${averageConsumption.toFixed(2)} kWh\n`;
        } else {
          csvContent += `No weekly consumption data available\n`;
        }
      }

      // Si no hay datos, agregar mensaje
      if (!showDeviceRanking && !showWeeklyConsumption) {
        csvContent += `No data available for the selected period\n`;
      }

      // Crear y descargar el archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `sems-report-${selectedPeriod?.value || 'data'}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const successMessage = this.translate.instant('reports.export.alerts.downloadSuccess', {
        format: 'CSV',
        period: periodLabel
      });
      alert(successMessage);

    } catch (error) {
      console.error('Error generating CSV:', error);
      const errorMessage = this.translate.instant('reports.export.alerts.downloadError');
      alert(errorMessage);
    }
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email.trim());
  }
}
