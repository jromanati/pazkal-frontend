// Datos mock para el sistema PAZKAL

export interface Empresa {
  id: string;
  nombre: string;
  rut: string;
  razonSocial: string;
  aocCeo: string;
  numeroAoc?: string;
  especificacion?: string;
  nombreGerente?: string;
  correoGerente?: string;
  telefonoGerente?: string;
  inspectorDgac?: string;
  correoDgac?: string;
}

export interface Operador {
  id: string;
  nombre: string;
  rut: string;
  correo: string;
  telefono?: string;
  fechaNacimiento?: string;
  numeroCredencial?: string;
  empresaId: string;
  empresaNombre: string;
  iniciales: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  avatar?: string;
}

export interface DashboardStats {
  horasTotalesMes: number;
  horasPracticasMes: number;
  cantidadVuelosMes: number;
  porcentajeCambioHoras: number;
  porcentajeCambioPracticas: number;
  vuelosTotalesAnio: number;
  porcentajeCambioAnual: number;
}

export interface OperadorActivo {
  id: string;
  nombre: string;
  codigo: string;
  estado: 'operando' | 'mantenimiento' | 'inactivo';
}

// Empresas mock
export const empresasMock: Empresa[] = [
  {
    id: '1',
    nombre: 'Aerolíneas Pacífico',
    rut: '76.452.120-K',
    razonSocial: 'Sociedad de Transportes Pacífico S.A.',
    aocCeo: 'AOC-2024-01',
    numeroAoc: '1234',
    especificacion: 'Transporte aéreo comercial',
    nombreGerente: 'Carlos Mendoza',
    correoGerente: 'cmendoza@pacifico.cl',
    telefonoGerente: '+56 9 8765 4321',
    inspectorDgac: 'Roberto Fernández',
    correoDgac: 'rfernandez@dgac.gob.cl'
  },
  {
    id: '2',
    nombre: 'Carga Austral',
    rut: '99.123.882-3',
    razonSocial: 'Carga Austral Limitada',
    aocCeo: 'CEO-9923-B',
    numeroAoc: '9923',
    especificacion: 'Transporte de carga',
    nombreGerente: 'María González',
    correoGerente: 'mgonzalez@carga-austral.com',
    telefonoGerente: '+56 9 1234 5678',
    inspectorDgac: 'Ana Torres',
    correoDgac: 'atorres@dgac.gob.cl'
  },
  {
    id: '3',
    nombre: 'Vuelos Express',
    rut: '88.541.002-1',
    razonSocial: 'Vuelos Express y Servicios SpA',
    aocCeo: 'AOC-2023-44',
    numeroAoc: '4421',
    especificacion: 'Vuelos charter',
    nombreGerente: 'Pedro Soto',
    correoGerente: 'psoto@vuelosexpress.cl',
    telefonoGerente: '+56 9 5555 1234',
    inspectorDgac: 'Juan Ramírez',
    correoDgac: 'jramirez@dgac.gob.cl'
  },
  {
    id: '4',
    nombre: 'Andes Aero',
    rut: '77.300.912-4',
    razonSocial: 'Andes Aero Logistic S.A.',
    aocCeo: 'AOC-2024-12',
    numeroAoc: '1245',
    especificacion: 'Logística aérea',
    nombreGerente: 'Luis Vargas',
    correoGerente: 'lvargas@andesaero.cl',
    telefonoGerente: '+56 9 7777 8888',
    inspectorDgac: 'Carolina Silva',
    correoDgac: 'csilva@dgac.gob.cl'
  }
];

// Operadores mock
export const operadoresMock: Operador[] = [
  {
    id: '1',
    nombre: 'Juan Pérez González',
    rut: '15.432.890-K',
    correo: 'j.perez@pacifico.cl',
    telefono: '+56 9 8765 4321',
    fechaNacimiento: '1985-03-15',
    numeroCredencial: '12345',
    empresaId: '1',
    empresaNombre: 'Aerolíneas Pacífico S.A.',
    iniciales: 'JP'
  },
  {
    id: '2',
    nombre: 'María Silva Soto',
    rut: '12.765.443-4',
    correo: 'm.silva@carga-austral.com',
    telefono: '+56 9 1234 5678',
    fechaNacimiento: '1990-07-22',
    numeroCredencial: '23456',
    empresaId: '2',
    empresaNombre: 'Carga Austral Ltda.',
    iniciales: 'MS'
  },
  {
    id: '3',
    nombre: 'Roberto Tapia',
    rut: '18.234.112-9',
    correo: 'rtapia@vuelosexpress.cl',
    telefono: '+56 9 5555 4444',
    fechaNacimiento: '1988-11-08',
    numeroCredencial: '34567',
    empresaId: '3',
    empresaNombre: 'Vuelos Express',
    iniciales: 'RT'
  },
  {
    id: '4',
    nombre: 'Andrea Contreras',
    rut: '14.998.765-2',
    correo: 'a.contreras@pacifico.cl',
    telefono: '+56 9 6666 7777',
    fechaNacimiento: '1992-05-30',
    numeroCredencial: '45678',
    empresaId: '1',
    empresaNombre: 'Aerolíneas Pacífico S.A.',
    iniciales: 'AC'
  }
];

// Usuario actual mock
export const usuarioActualMock: Usuario = {
  id: '1',
  nombre: 'Admin Pazkal',
  correo: 'admin@pazkal.cl',
  rol: 'Soporte Premium',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7mYH7CylZEgzYx8N6RUqruxaYq9S4FL1ZsqgUMEGdxOit60Z7Z24BTHqrVFDlCkJ_mH35qnOveI_c-JDbXi9gLkC7uK3DYlPwCTwD9a7S_Xkv9YMNNp9p74bYgcHvl1B6sWNa_-CmLo1ptLRyFZHPdM_8KZRXzbSPxN1vxOPr45boB-unYWkdwC2_sb8uyN88AvCAN1hyRDTWbDhW4bgeYyckg3jsdxlwnr0L_FiisVeMS1N__P_gabiDgdqqsWu1eGgD0eG0Lw'
};

// Dashboard stats mock - base
export const dashboardStatsMock: DashboardStats = {
  horasTotalesMes: 1284,
  horasPracticasMes: 842,
  cantidadVuelosMes: 312,
  porcentajeCambioHoras: 12.5,
  porcentajeCambioPracticas: 8.2,
  vuelosTotalesAnio: 15420,
  porcentajeCambioAnual: 8.2
};

// Stats por empresa y mes para simulación de filtros dinámicos
export interface DashboardStatsByFilter {
  empresaId: string;
  mes: string;
  stats: DashboardStats;
}

export const dashboardStatsByFilterMock: DashboardStatsByFilter[] = [
  // Aerolíneas Pacífico - diferentes meses
  { empresaId: '1', mes: '1', stats: { horasTotalesMes: 320, horasPracticasMes: 180, cantidadVuelosMes: 75, porcentajeCambioHoras: 8.2, porcentajeCambioPracticas: 5.1, vuelosTotalesAnio: 3200, porcentajeCambioAnual: 6.5 }},
  { empresaId: '1', mes: '2', stats: { horasTotalesMes: 345, horasPracticasMes: 195, cantidadVuelosMes: 82, porcentajeCambioHoras: 7.8, porcentajeCambioPracticas: 8.3, vuelosTotalesAnio: 3200, porcentajeCambioAnual: 6.5 }},
  { empresaId: '1', mes: '3', stats: { horasTotalesMes: 380, horasPracticasMes: 210, cantidadVuelosMes: 91, porcentajeCambioHoras: 10.1, porcentajeCambioPracticas: 7.7, vuelosTotalesAnio: 3200, porcentajeCambioAnual: 6.5 }},
  { empresaId: '1', mes: '4', stats: { horasTotalesMes: 355, horasPracticasMes: 200, cantidadVuelosMes: 85, porcentajeCambioHoras: -6.6, porcentajeCambioPracticas: -4.8, vuelosTotalesAnio: 3200, porcentajeCambioAnual: 6.5 }},
  { empresaId: '1', mes: '5', stats: { horasTotalesMes: 410, horasPracticasMes: 230, cantidadVuelosMes: 98, porcentajeCambioHoras: 15.5, porcentajeCambioPracticas: 15.0, vuelosTotalesAnio: 3200, porcentajeCambioAnual: 6.5 }},
  { empresaId: '1', mes: '6', stats: { horasTotalesMes: 395, horasPracticasMes: 220, cantidadVuelosMes: 94, porcentajeCambioHoras: -3.7, porcentajeCambioPracticas: -4.3, vuelosTotalesAnio: 3200, porcentajeCambioAnual: 6.5 }},
  { empresaId: '1', mes: '7', stats: { horasTotalesMes: 425, horasPracticasMes: 245, cantidadVuelosMes: 102, porcentajeCambioHoras: 7.6, porcentajeCambioPracticas: 11.4, vuelosTotalesAnio: 3200, porcentajeCambioAnual: 6.5 }},
  // Carga Austral - diferentes meses
  { empresaId: '2', mes: '1', stats: { horasTotalesMes: 180, horasPracticasMes: 95, cantidadVuelosMes: 42, porcentajeCambioHoras: 5.5, porcentajeCambioPracticas: 3.2, vuelosTotalesAnio: 1850, porcentajeCambioAnual: 4.2 }},
  { empresaId: '2', mes: '2', stats: { horasTotalesMes: 195, horasPracticasMes: 105, cantidadVuelosMes: 46, porcentajeCambioHoras: 8.3, porcentajeCambioPracticas: 10.5, vuelosTotalesAnio: 1850, porcentajeCambioAnual: 4.2 }},
  { empresaId: '2', mes: '3', stats: { horasTotalesMes: 210, horasPracticasMes: 115, cantidadVuelosMes: 50, porcentajeCambioHoras: 7.7, porcentajeCambioPracticas: 9.5, vuelosTotalesAnio: 1850, porcentajeCambioAnual: 4.2 }},
  { empresaId: '2', mes: '4', stats: { horasTotalesMes: 185, horasPracticasMes: 100, cantidadVuelosMes: 44, porcentajeCambioHoras: -11.9, porcentajeCambioPracticas: -13.0, vuelosTotalesAnio: 1850, porcentajeCambioAnual: 4.2 }},
  { empresaId: '2', mes: '5', stats: { horasTotalesMes: 220, horasPracticasMes: 125, cantidadVuelosMes: 52, porcentajeCambioHoras: 18.9, porcentajeCambioPracticas: 25.0, vuelosTotalesAnio: 1850, porcentajeCambioAnual: 4.2 }},
  { empresaId: '2', mes: '6', stats: { horasTotalesMes: 205, horasPracticasMes: 115, cantidadVuelosMes: 48, porcentajeCambioHoras: -6.8, porcentajeCambioPracticas: -8.0, vuelosTotalesAnio: 1850, porcentajeCambioAnual: 4.2 }},
  { empresaId: '2', mes: '7', stats: { horasTotalesMes: 235, horasPracticasMes: 130, cantidadVuelosMes: 55, porcentajeCambioHoras: 14.6, porcentajeCambioPracticas: 13.0, vuelosTotalesAnio: 1850, porcentajeCambioAnual: 4.2 }},
  // Vuelos Express - diferentes meses
  { empresaId: '3', mes: '1', stats: { horasTotalesMes: 145, horasPracticasMes: 80, cantidadVuelosMes: 35, porcentajeCambioHoras: 12.1, porcentajeCambioPracticas: 10.5, vuelosTotalesAnio: 1520, porcentajeCambioAnual: 9.8 }},
  { empresaId: '3', mes: '2', stats: { horasTotalesMes: 160, horasPracticasMes: 90, cantidadVuelosMes: 38, porcentajeCambioHoras: 10.3, porcentajeCambioPracticas: 12.5, vuelosTotalesAnio: 1520, porcentajeCambioAnual: 9.8 }},
  { empresaId: '3', mes: '3', stats: { horasTotalesMes: 175, horasPracticasMes: 98, cantidadVuelosMes: 42, porcentajeCambioHoras: 9.4, porcentajeCambioPracticas: 8.9, vuelosTotalesAnio: 1520, porcentajeCambioAnual: 9.8 }},
  { empresaId: '3', mes: '4', stats: { horasTotalesMes: 155, horasPracticasMes: 85, cantidadVuelosMes: 37, porcentajeCambioHoras: -11.4, porcentajeCambioPracticas: -13.3, vuelosTotalesAnio: 1520, porcentajeCambioAnual: 9.8 }},
  { empresaId: '3', mes: '5', stats: { horasTotalesMes: 190, horasPracticasMes: 105, cantidadVuelosMes: 45, porcentajeCambioHoras: 22.6, porcentajeCambioPracticas: 23.5, vuelosTotalesAnio: 1520, porcentajeCambioAnual: 9.8 }},
  { empresaId: '3', mes: '6', stats: { horasTotalesMes: 178, horasPracticasMes: 98, cantidadVuelosMes: 42, porcentajeCambioHoras: -6.3, porcentajeCambioPracticas: -6.7, vuelosTotalesAnio: 1520, porcentajeCambioAnual: 9.8 }},
  { empresaId: '3', mes: '7', stats: { horasTotalesMes: 198, horasPracticasMes: 110, cantidadVuelosMes: 47, porcentajeCambioHoras: 11.2, porcentajeCambioPracticas: 12.2, vuelosTotalesAnio: 1520, porcentajeCambioAnual: 9.8 }},
  // Andes Aero - diferentes meses
  { empresaId: '4', mes: '1', stats: { horasTotalesMes: 280, horasPracticasMes: 155, cantidadVuelosMes: 65, porcentajeCambioHoras: 6.5, porcentajeCambioPracticas: 4.8, vuelosTotalesAnio: 2950, porcentajeCambioAnual: 7.2 }},
  { empresaId: '4', mes: '2', stats: { horasTotalesMes: 295, horasPracticasMes: 165, cantidadVuelosMes: 70, porcentajeCambioHoras: 5.4, porcentajeCambioPracticas: 6.5, vuelosTotalesAnio: 2950, porcentajeCambioAnual: 7.2 }},
  { empresaId: '4', mes: '3', stats: { horasTotalesMes: 315, horasPracticasMes: 175, cantidadVuelosMes: 75, porcentajeCambioHoras: 6.8, porcentajeCambioPracticas: 6.1, vuelosTotalesAnio: 2950, porcentajeCambioAnual: 7.2 }},
  { empresaId: '4', mes: '4', stats: { horasTotalesMes: 290, horasPracticasMes: 160, cantidadVuelosMes: 68, porcentajeCambioHoras: -7.9, porcentajeCambioPracticas: -8.6, vuelosTotalesAnio: 2950, porcentajeCambioAnual: 7.2 }},
  { empresaId: '4', mes: '5', stats: { horasTotalesMes: 340, horasPracticasMes: 190, cantidadVuelosMes: 80, porcentajeCambioHoras: 17.2, porcentajeCambioPracticas: 18.8, vuelosTotalesAnio: 2950, porcentajeCambioAnual: 7.2 }},
  { empresaId: '4', mes: '6', stats: { horasTotalesMes: 325, horasPracticasMes: 180, cantidadVuelosMes: 77, porcentajeCambioHoras: -4.4, porcentajeCambioPracticas: -5.3, vuelosTotalesAnio: 2950, porcentajeCambioAnual: 7.2 }},
  { empresaId: '4', mes: '7', stats: { horasTotalesMes: 355, horasPracticasMes: 200, cantidadVuelosMes: 85, porcentajeCambioHoras: 9.2, porcentajeCambioPracticas: 11.1, vuelosTotalesAnio: 2950, porcentajeCambioAnual: 7.2 }},
];

// Función helper para obtener stats por filtros
export function getDashboardStatsByFilter(empresaId?: string, mes?: string): DashboardStats {
  if (!empresaId && !mes) return dashboardStatsMock;
  
  const filtered = dashboardStatsByFilterMock.find(
    item => item.empresaId === empresaId && item.mes === mes
  );
  
  if (filtered) return filtered.stats;
  
  // Si solo hay empresa seleccionada, sumar todos los meses de esa empresa
  if (empresaId && !mes) {
    const empresaStats = dashboardStatsByFilterMock.filter(item => item.empresaId === empresaId);
    if (empresaStats.length > 0) {
      return {
        horasTotalesMes: Math.round(empresaStats.reduce((acc, item) => acc + item.stats.horasTotalesMes, 0) / empresaStats.length),
        horasPracticasMes: Math.round(empresaStats.reduce((acc, item) => acc + item.stats.horasPracticasMes, 0) / empresaStats.length),
        cantidadVuelosMes: Math.round(empresaStats.reduce((acc, item) => acc + item.stats.cantidadVuelosMes, 0) / empresaStats.length),
        porcentajeCambioHoras: empresaStats[0].stats.porcentajeCambioHoras,
        porcentajeCambioPracticas: empresaStats[0].stats.porcentajeCambioPracticas,
        vuelosTotalesAnio: empresaStats[0].stats.vuelosTotalesAnio,
        porcentajeCambioAnual: empresaStats[0].stats.porcentajeCambioAnual
      };
    }
  }
  
  // Si solo hay mes seleccionado, sumar todas las empresas de ese mes
  if (!empresaId && mes) {
    const mesStats = dashboardStatsByFilterMock.filter(item => item.mes === mes);
    if (mesStats.length > 0) {
      return {
        horasTotalesMes: mesStats.reduce((acc, item) => acc + item.stats.horasTotalesMes, 0),
        horasPracticasMes: mesStats.reduce((acc, item) => acc + item.stats.horasPracticasMes, 0),
        cantidadVuelosMes: mesStats.reduce((acc, item) => acc + item.stats.cantidadVuelosMes, 0),
        porcentajeCambioHoras: parseFloat((mesStats.reduce((acc, item) => acc + item.stats.porcentajeCambioHoras, 0) / mesStats.length).toFixed(1)),
        porcentajeCambioPracticas: parseFloat((mesStats.reduce((acc, item) => acc + item.stats.porcentajeCambioPracticas, 0) / mesStats.length).toFixed(1)),
        vuelosTotalesAnio: mesStats.reduce((acc, item) => acc + item.stats.vuelosTotalesAnio, 0),
        porcentajeCambioAnual: parseFloat((mesStats.reduce((acc, item) => acc + item.stats.porcentajeCambioAnual, 0) / mesStats.length).toFixed(1))
      };
    }
  }
  
  return dashboardStatsMock;
}

// Operadores activos mock
export const operadoresActivosMock: OperadorActivo[] = [
  {
    id: 'AP-9023',
    nombre: 'Aerolíneas Pacífico S.A.',
    codigo: 'AP-9023',
    estado: 'operando'
  },
  {
    id: 'CA-4412',
    nombre: 'Carga Austral Ltda.',
    codigo: 'CA-4412',
    estado: 'mantenimiento'
  }
];

// Meses para selects
export const mesesMock = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

// Tipos de calificación mock
export const tiposCalificacionMock = [
  { value: '1', label: 'Habilitación de Tipo (TR)' },
  { value: '2', label: 'Vuelo por Instrumentos (IFR)' },
  { value: '3', label: 'Instructor (FI)' },
  { value: '4', label: 'Multimotores (ME)' }
];

// Órdenes de vuelo
export interface OrdenVuelo {
  id: string;
  codigo: string;
  pilotoId: string;
  pilotoNombre: string;
  pilotoIniciales: string;
  observador?: string;
  rpa?: string;
  tipoVuelo?: string;
  fecha: string;
  trabajoAereo?: string;
  lugar: string;
  trabajo: string;
  utcActividad?: string;
  notam?: string;
  areaGeografica?: string;
  areasPeligrosas?: string;
  gerenteResponsable?: string;
  estado: 'pendiente' | 'en_vuelo' | 'completado' | 'cancelado';
}

export const ordenesVueloMock: OrdenVuelo[] = [
  {
    id: '1',
    codigo: '#OV-2024-001',
    pilotoId: '1',
    pilotoNombre: 'Ricardo Palma',
    pilotoIniciales: 'RP',
    observador: 'Carlos López',
    rpa: 'RPA-001',
    tipoVuelo: 'Transporte',
    fecha: '2024-10-12',
    trabajoAereo: 'Transporte de carga',
    lugar: 'Base Antártica',
    trabajo: 'Transporte Logístico',
    utcActividad: '08:00 - 14:00 UTC',
    notam: 'NOTAM-2024-123',
    areaGeografica: '-62.2142, -58.9623',
    areasPeligrosas: 'Zona de hielo flotante',
    gerenteResponsable: 'Roberto Fernández',
    estado: 'completado'
  },
  {
    id: '2',
    codigo: '#OV-2024-002',
    pilotoId: '2',
    pilotoNombre: 'Andrea Morales',
    pilotoIniciales: 'AM',
    observador: 'Felipe Ruiz',
    rpa: 'RPA-002',
    tipoVuelo: 'Prospección',
    fecha: '2024-10-14',
    trabajoAereo: 'Levantamiento topográfico',
    lugar: 'Cordillera Central',
    trabajo: 'Prospección Minera',
    utcActividad: '10:00 - 16:00 UTC',
    notam: 'NOTAM-2024-124',
    areaGeografica: '-33.4569, -70.6483',
    areasPeligrosas: 'Zona de alta montaña',
    gerenteResponsable: 'María González',
    estado: 'en_vuelo'
  },
  {
    id: '3',
    codigo: '#OV-2024-003',
    pilotoId: '3',
    pilotoNombre: 'Juan Soto',
    pilotoIniciales: 'JS',
    observador: 'Ana Torres',
    rpa: 'RPA-003',
    tipoVuelo: 'Instrucción',
    fecha: '2024-10-15',
    trabajoAereo: 'Entrenamiento de vuelo',
    lugar: 'Aeródromo Peldehue',
    trabajo: 'Instrucción',
    utcActividad: '14:00 - 18:00 UTC',
    notam: '',
    areaGeografica: '-33.1234, -70.5678',
    areasPeligrosas: 'Ninguna',
    gerenteResponsable: 'Pedro Soto',
    estado: 'pendiente'
  },
  {
    id: '4',
    codigo: '#OV-2024-004',
    pilotoId: '4',
    pilotoNombre: 'Carlos Lagos',
    pilotoIniciales: 'CL',
    observador: 'Luis Vargas',
    rpa: 'RPA-004',
    tipoVuelo: 'Rescate',
    fecha: '2024-10-16',
    trabajoAereo: 'Operación de rescate',
    lugar: 'Valle Nevado',
    trabajo: 'Rescate y Evacuación',
    utcActividad: '09:00 - 15:00 UTC',
    notam: 'NOTAM-2024-125',
    areaGeografica: '-33.3567, -70.2567',
    areasPeligrosas: 'Zona de avalanchas',
    gerenteResponsable: 'Carolina Silva',
    estado: 'pendiente'
  }
];

// Tipos de trabajo aéreo
export const tiposTrabajoAereoMock = [
  { value: 'transporte', label: 'Transporte Logístico' },
  { value: 'prospeccion', label: 'Prospección Minera' },
  { value: 'instruccion', label: 'Instrucción' },
  { value: 'rescate', label: 'Rescate y Evacuación' },
  { value: 'fotogrametria', label: 'Fotogrametría' },
  { value: 'inspeccion', label: 'Inspección Técnica' }
];

// Bitácoras de vuelo
export interface BitacoraVuelo {
  id: string;
  codigo: string;
  ordenNumero: string;
  fecha: string;
  lugar: string;
  operadorId: string;
  operadorNombre: string;
  operadorIniciales: string;
  copiloto?: string;
  rpa1Modelo?: string;
  rpa1Registro?: string;
  rpa2Modelo?: string;
  rpa2Registro?: string;
  baterias: {
    bateria: string;
    inicio: number;
    termino: number;
  }[];
  utcSalida?: string;
  utcLlegada?: string;
  gtmSalida?: string;
  gtmLlegada?: string;
  tiempoVuelo: number;
  trabajoAereo?: string;
  actividadRealizada?: string;
  comentarios?: string;
}

export const bitacorasVueloMock: BitacoraVuelo[] = [
  {
    id: '1',
    codigo: '#BIT-2024-001',
    ordenNumero: 'OV-5520',
    fecha: '2023-10-24',
    lugar: 'Santiago / Aeródromo Tobalaba',
    operadorId: '1',
    operadorNombre: 'Carlos Méndez',
    operadorIniciales: 'CM',
    copiloto: 'Felipe Ruiz',
    rpa1Modelo: 'DJI Matrice 300',
    rpa1Registro: 'DGAC-1234',
    rpa2Modelo: '',
    rpa2Registro: '',
    baterias: [
      { bateria: 'BATERÍA 1', inicio: 100, termino: 45 },
      { bateria: 'BATERÍA 2', inicio: 100, termino: 52 },
      { bateria: 'BATERÍA 3', inicio: 98, termino: 40 }
    ],
    utcSalida: '12:00',
    utcLlegada: '12:45',
    gtmSalida: '08:00',
    gtmLlegada: '08:45',
    tiempoVuelo: 45,
    trabajoAereo: 'Inspección de líneas eléctricas',
    actividadRealizada: 'Inspección visual de torres de alta tensión en sector norte. Condiciones climáticas óptimas, viento sur 8 nudos.',
    comentarios: 'Sin novedades técnicas. RPA operó correctamente.'
  },
  {
    id: '2',
    codigo: '#BIT-2024-002',
    ordenNumero: 'OV-5521',
    fecha: '2023-10-24',
    lugar: 'Valparaíso / Puerto',
    operadorId: '2',
    operadorNombre: 'Sofía Valenzuela',
    operadorIniciales: 'SV',
    copiloto: 'Ana Torres',
    rpa1Modelo: 'E-Fixed Wing 04',
    rpa1Registro: 'DGAC-5678',
    rpa2Modelo: '',
    rpa2Registro: '',
    baterias: [
      { bateria: 'BATERÍA 1', inicio: 100, termino: 20 },
      { bateria: 'BATERÍA 2', inicio: 100, termino: 25 },
      { bateria: 'BATERÍA 3', inicio: 100, termino: 30 }
    ],
    utcSalida: '14:00',
    utcLlegada: '16:00',
    gtmSalida: '10:00',
    gtmLlegada: '12:00',
    tiempoVuelo: 120,
    trabajoAereo: 'Levantamiento fotogramétrico',
    actividadRealizada: 'Mapeo aéreo del puerto para actualización cartográfica. Cobertura completa del área asignada.',
    comentarios: 'Se detectó leve vibración en motor 2 al final del vuelo. Recomendar revisión preventiva.'
  },
  {
    id: '3',
    codigo: '#BIT-2024-003',
    ordenNumero: 'OV-5525',
    fecha: '2023-10-25',
    lugar: 'Concepción / Aeródromo Carriel Sur',
    operadorId: '3',
    operadorNombre: 'Roberto Lagos',
    operadorIniciales: 'RL',
    copiloto: 'Luis Vargas',
    rpa1Modelo: 'DJI Matrice 300',
    rpa1Registro: 'DGAC-1234',
    rpa2Modelo: 'Mavic 3 Enterprise',
    rpa2Registro: 'DGAC-9999',
    baterias: [
      { bateria: 'BATERÍA 1', inicio: 95, termino: 60 },
      { bateria: 'BATERÍA 2', inicio: 100, termino: 65 },
      { bateria: 'BATERÍA 3', inicio: 100, termino: 70 }
    ],
    utcSalida: '15:30',
    utcLlegada: '16:00',
    gtmSalida: '11:30',
    gtmLlegada: '12:00',
    tiempoVuelo: 30,
    trabajoAereo: 'Entrenamiento de vuelo',
    actividadRealizada: 'Vuelo de instrucción para nuevo operador. Prácticas de despegue, aterrizaje y maniobras básicas.',
    comentarios: 'Alumno progresa satisfactoriamente. Próxima sesión enfocada en vuelo autónomo.'
  },
  {
    id: '4',
    codigo: '#BIT-2024-004',
    ordenNumero: 'OV-5530',
    fecha: '2023-10-26',
    lugar: 'Temuco / Aeródromo Maquehue',
    operadorId: '4',
    operadorNombre: 'Andrea Contreras',
    operadorIniciales: 'AC',
    copiloto: '',
    rpa1Modelo: 'DJI Inspire 2',
    rpa1Registro: 'DGAC-4567',
    rpa2Modelo: '',
    rpa2Registro: '',
    baterias: [
      { bateria: 'BATERÍA 1', inicio: 100, termino: 35 },
      { bateria: 'BATERÍA 2', inicio: 100, termino: 40 },
      { bateria: 'BATERÍA 3', inicio: 0, termino: 0 }
    ],
    utcSalida: '13:00',
    utcLlegada: '14:15',
    gtmSalida: '09:00',
    gtmLlegada: '10:15',
    tiempoVuelo: 75,
    trabajoAereo: 'Filmación aérea',
    actividadRealizada: 'Grabación de video promocional para cliente. Tomas panorámicas y seguimiento de vehículos.',
    comentarios: 'Excelente calidad de imagen. Cliente satisfecho con el resultado.'
  }
];

// RPAs disponibles
export const rpasDisponiblesMock = [
  { value: 'dji-m300', label: 'DJI Matrice 300', registro: 'DGAC-1234' },
  { value: 'dji-m30', label: 'DJI Matrice 30', registro: 'DGAC-2345' },
  { value: 'mavic-3', label: 'Mavic 3 Enterprise', registro: 'DGAC-9999' },
  { value: 'inspire-2', label: 'DJI Inspire 2', registro: 'DGAC-4567' },
  { value: 'efixed-04', label: 'E-Fixed Wing 04', registro: 'DGAC-5678' }
];

// Usuarios del sistema
export interface Usuario {
  id: string;
  nombre: string;
  iniciales: string;
  rut: string;
  email: string;
  telefono?: string;
  empresa: string;
  tipoUsuario: 'administrador' | 'operador' | 'gerencia' | 'visualizador';
  ultimaSesion: string;
  colorAvatar: string;
}

export const usuariosMock: Usuario[] = [
  {
    id: '1',
    nombre: 'Carlos Méndez',
    iniciales: 'CM',
    rut: '15.432.980-K',
    email: 'c.mendez@aeroservice.com',
    telefono: '+56 9 1234 5678',
    empresa: 'AeroService S.A.',
    tipoUsuario: 'operador',
    ultimaSesion: 'Hoy 10:45',
    colorAvatar: 'blue'
  },
  {
    id: '2',
    nombre: 'Andrea Valdés',
    iniciales: 'AV',
    rut: '12.876.543-2',
    email: 'a.valdes@pazkal.io',
    telefono: '+56 9 8765 4321',
    empresa: 'PAZKAL Corp',
    tipoUsuario: 'administrador',
    ultimaSesion: 'Ayer 18:20',
    colorAvatar: 'slate'
  },
  {
    id: '3',
    nombre: 'Ricardo Lagos',
    iniciales: 'RL',
    rut: '10.321.455-1',
    email: 'rlagos@skyview.cl',
    telefono: '+56 9 5555 1234',
    empresa: 'SkyView Ltda.',
    tipoUsuario: 'visualizador',
    ultimaSesion: '12 Oct 2023',
    colorAvatar: 'green'
  },
  {
    id: '4',
    nombre: 'Mario Salas',
    iniciales: 'MS',
    rut: '17.221.009-5',
    email: 'm.salas@agrotech.com',
    telefono: '+56 9 9999 8888',
    empresa: 'AgroTech Chile',
    tipoUsuario: 'operador',
    ultimaSesion: '10 Oct 2023',
    colorAvatar: 'amber'
  },
  {
    id: '5',
    nombre: 'Patricia Fernández',
    iniciales: 'PF',
    rut: '14.567.890-3',
    email: 'p.fernandez@pazkal.io',
    telefono: '+56 9 7777 6666',
    empresa: 'PAZKAL Corp',
    tipoUsuario: 'gerencia',
    ultimaSesion: 'Hoy 09:30',
    colorAvatar: 'purple'
  }
];

// Tipos de usuario
export const tiposUsuarioMock = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'operador', label: 'Operador RPA' },
  { value: 'gerencia', label: 'Gerencia' },
  { value: 'visualizador', label: 'Visualizador' }
];
