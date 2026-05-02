// Colombian public holidays for 2025 and 2026
// Source: Ley 51/1983 and official calendar
const HOLIDAYS: string[] = [
  // 2025
  '2025-01-01', // Año Nuevo
  '2025-01-06', // Reyes Magos (traslado)
  '2025-03-24', // San José (traslado)
  '2025-04-17', // Jueves Santo
  '2025-04-18', // Viernes Santo
  '2025-05-01', // Día del Trabajo
  '2025-06-02', // Ascensión del Señor (traslado)
  '2025-06-23', // Corpus Christi (traslado)
  '2025-06-30', // Sagrado Corazón (traslado)
  '2025-07-07', // San Pedro y San Pablo (traslado)
  '2025-07-20', // Independencia
  '2025-08-07', // Batalla de Boyacá
  '2025-08-18', // Asunción de la Virgen (traslado)
  '2025-10-13', // Día de la Raza (traslado)
  '2025-11-03', // Todos los Santos (traslado)
  '2025-11-17', // Independencia de Cartagena (traslado)
  '2025-12-08', // Inmaculada Concepción
  '2025-12-25', // Navidad

  // 2026
  '2026-01-01', // Año Nuevo
  '2026-01-12', // Reyes Magos (traslado)
  '2026-03-23', // San José (traslado)
  '2026-04-02', // Jueves Santo
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajo
  '2026-05-18', // Ascensión del Señor (traslado)
  '2026-06-08', // Corpus Christi (traslado)
  '2026-06-15', // Sagrado Corazón (traslado)
  '2026-06-29', // San Pedro y San Pablo
  '2026-07-20', // Independencia
  '2026-08-07', // Batalla de Boyacá
  '2026-08-17', // Asunción de la Virgen (traslado)
  '2026-10-12', // Día de la Raza
  '2026-11-02', // Todos los Santos
  '2026-11-16', // Independencia de Cartagena (traslado)
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25', // Navidad
]

const HOLIDAY_SET = new Set(HOLIDAYS)

export function isColombianHoliday(date: Date): boolean {
  const iso = date.toISOString().split('T')[0]
  return HOLIDAY_SET.has(iso)
}

export function getHolidayName(date: Date): string | null {
  const iso = date.toISOString().split('T')[0]
  const names: Record<string, string> = {
    '2025-01-01': 'Año Nuevo', '2026-01-01': 'Año Nuevo',
    '2025-01-06': 'Reyes Magos', '2026-01-12': 'Reyes Magos',
    '2025-03-24': 'San José', '2026-03-23': 'San José',
    '2025-04-17': 'Jueves Santo', '2026-04-02': 'Jueves Santo',
    '2025-04-18': 'Viernes Santo', '2026-04-03': 'Viernes Santo',
    '2025-05-01': 'Día del Trabajo', '2026-05-01': 'Día del Trabajo',
    '2025-06-02': 'Ascensión', '2026-05-18': 'Ascensión',
    '2025-06-23': 'Corpus Christi', '2026-06-08': 'Corpus Christi',
    '2025-06-30': 'Sagrado Corazón', '2026-06-15': 'Sagrado Corazón',
    '2025-07-07': 'San Pedro y San Pablo', '2026-06-29': 'San Pedro y San Pablo',
    '2025-07-20': 'Independencia', '2026-07-20': 'Independencia',
    '2025-08-07': 'Batalla de Boyacá', '2026-08-07': 'Batalla de Boyacá',
    '2025-08-18': 'Asunción', '2026-08-17': 'Asunción',
    '2025-10-13': 'Día de la Raza', '2026-10-12': 'Día de la Raza',
    '2025-11-03': 'Todos los Santos', '2026-11-02': 'Todos los Santos',
    '2025-11-17': 'Independencia de Cartagena', '2026-11-16': 'Independencia de Cartagena',
    '2025-12-08': 'Inmaculada Concepción', '2026-12-08': 'Inmaculada Concepción',
    '2025-12-25': 'Navidad', '2026-12-25': 'Navidad',
  }
  return names[iso] ?? null
}
