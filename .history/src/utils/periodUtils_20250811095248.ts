// utils/periodUtils.ts
import type { PeriodData, ProcessedPeriod } from '../types'

/**
 * Convertit des données de période brutes en données traitées avec dates converties
 */
export function processPeriodData(periodData: PeriodData): ProcessedPeriod {
  const startDate = new Date(periodData.startDate)
  const predictedDate = new Date(periodData.predictedDate)
  const ovulationDate = new Date(startDate)

  // Calculer les jours du cycle
  const cycleDays = Math.floor(
    (predictedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  // Calculer la date d'ovulation (milieu du cycle)
  ovulationDate.setDate(startDate.getDate() + Math.floor(cycleDays / 2))

  return {
    id: periodData.id,
    startDate,
    predictedDate,
    ovulationDate,
    cycleDays,
    createdAt: periodData.createdAt,
  }
}

/**
 * Convertit un tableau de données de période brutes en données traitées
 */
export function processPeriodDataArray(periodsData: PeriodData[]): ProcessedPeriod[] {
  return periodsData.map(processPeriodData)
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString()
}

/**
 * Vérifie si une période est dans le passé
 */
export function isPeriodInPast(period: ProcessedPeriod, referenceDate?: Date): boolean {
  const reference = referenceDate || new Date()
  return period.startDate < reference
}

/**
 * Génère les attributs de calendrier pour une période
 */
export function generateCalendarAttributes(periods: ProcessedPeriod[], referenceDate?: Date) {
  const reference = referenceDate || periods[0]?.startDate || new Date()

  return periods.flatMap((period, i) => {
    const isPast = isPeriodInPast(period, reference)
    const contentClass = isPast ? 'past-opacity' : ''

    return [
      {
        key: `rules-${i}`,
        dates: [period.startDate],
        highlight: {
          color: 'red',
          fillMode: 'solid' as const,
          contentClass,
        },
        popover: { label: 'Début des règles' },
      },
      {
        key: `prediction-${i}`,
        dates: [period.predictedDate],
        highlight: {
          color: 'pink',
          fillMode: 'outline' as const,
          contentClass,
        },
        popover: { label: 'Prochaines règles estimées' },
      },
      {
        key: `ovulation-${i}`,
        dates: [period.ovulationDate],
        highlight: {
          color: 'green',
          fillMode: 'solid' as const,
          contentClass,
        },
        popover: { label: 'Ovulation maximale' },
      },
    ]
  })
}
