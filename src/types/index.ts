// types/index.ts

export type StorageType = 'firebase' | 'local'

export interface PeriodData {
  id?: string
  startDate: string
  predictedDate: string
  createdAt: string
}

export interface CreatePeriodData {
  startDate: string
  predictedDate: string
}

export interface ProcessedPeriod {
  id?: string
  startDate: Date
  predictedDate: Date
  ovulationDate: Date
  cycleDays: number
  createdAt: string
}

export interface CalendarAttribute {
  key: string
  dates: Date[]
  highlight: {
    color: string
    fillMode: 'solid' | 'outline'
    contentClass?: string
  }
  popover: {
    label: string
  }
}

export interface LoginResult {
  storageType: StorageType
  user: any // Type Firebase User
}

export interface MigrationResult {
  success: boolean
  count: number
  error?: string
}

export interface StorageSettings {
  storageType: StorageType
  periodsCount: number
  isConnected: boolean
}

// Types pour les événements du calendrier
export interface CalendarDay {
  date: Date
  event?: Event
}

export interface CalendarDayEvent {
  date: Date
  event: Event
}

// Types pour les erreurs Firebase
export type FirebaseErrorCode =
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/invalid-email'
  | 'auth/weak-password'
  | 'auth/too-many-requests'

export interface FirebaseError {
  code: FirebaseErrorCode
  message: string
}
