export interface DevicePreferenceResponse {
  id: number;
  userId: string;
  preferences: any;
  lastUpdated: string;
}

export interface DevicePreferenceRequest {
  userId?: string;
  preferences: {
    habilitarMonitoreoEnergia: boolean;
    recibirAlertasAltoConsumo: boolean;
    monitorearCalefaccionRefrigeracion: boolean;
    monitorearElectrodomesticosPrincipales: boolean;
    monitorearElectronicos: boolean;
    monitorearDispositivosCocina: boolean;
    incluirIluminacionExterior: boolean;
    rastrearEnergiaEspera: boolean;
    emailsResumenDiario: boolean;
    reportesProgresoSemanal: boolean;
    sugerirAutomatizacionesAhorro: boolean;
    alertasDispositivosDesconectados: boolean;
  };
}

