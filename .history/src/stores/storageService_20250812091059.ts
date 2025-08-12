// services/storageService.ts
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore'

// Types
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

export interface MigrationResult {
  success: boolean
  count: number
  error?: string
}

class StorageService {
  private _storageType: StorageType

  constructor() {
    this._storageType = this.getStoragePreference()
  }

  // Getter pour storageType
  get storageType(): StorageType {
    return this._storageType
  }

  // Récupère la préférence de stockage depuis localStorage
  getStoragePreference(): StorageType {
    const stored = localStorage.getItem('storageType')
    return (stored as StorageType) || 'firebase'
  }

  // Définit le type de stockage
  setStorageType(type: StorageType): void {
    this._storageType = type
    localStorage.setItem('storageType', type)
  }

  // Interface unifiée pour sauvegarder une période
  async savePeriod(periodData: CreatePeriodData): Promise<string | null> {
    if (this._storageType === 'local') {
      return this.saveToLocal(periodData)
    } else {
      return this.saveToFirebase(periodData)
    }
  }

  // Interface unifiée pour charger les périodes
  async loadPeriods(): Promise<PeriodData[]> {
    if (this._storageType === 'local') {
      return this.loadFromLocal()
    } else {
      return this.loadFromFirebase()
    }
  }

  // Interface unifiée pour supprimer une période
  async deletePeriod(id: string): Promise<void> {
    if (this._storageType === 'local') {
      return this.deleteFromLocal(id)
    } else {
      return this.deleteFromFirebase(id)
    }
  }

  // --- MÉTHODES FIREBASE ---
  private async saveToFirebase(periodData: CreatePeriodData): Promise<string | null> {
    const user = auth.currentUser
    if (!user) throw new Error('Utilisateur non connecté')

    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const snapshot = await getDocs(periodsCollectionRef)
    const exists = snapshot.docs.some((doc) => doc.data().startDate === periodData.startDate)

    if (!exists) {
      const docRef = await addDoc(periodsCollectionRef, {
        ...periodData,
        createdAt: new Date().toISOString(),
      })
      return docRef.id
    }
    return null
  }

  private async loadFromFirebase(): Promise<PeriodData[]> {
    const user = auth.currentUser
    if (!user) return []

    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const q = query(periodsCollectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(
      (doc): PeriodData => ({
        id: doc.id,
        startDate: doc.data().startDate,
        predictedDate: doc.data().predictedDate,
        createdAt: doc.data().createdAt,
      }),
    )
  }

  private async deleteFromFirebase(id: string): Promise<void> {
    const user = auth.currentUser
    if (!user) throw new Error('Utilisateur non connecté')

    const docRef = doc(db, 'users', user.uid, 'periods', id)
    await deleteDoc(docRef)
  }

  // --- MÉTHODES STOCKAGE LOCAL ---
  private async saveToLocal(periodData: CreatePeriodData): Promise<string | null> {
    const periods = this.getLocalPeriods()
    const id = this.generateId()

    const exists = periods.some((p: PeriodData) => p.startDate === periodData.startDate)
    if (!exists) {
      const newPeriod: PeriodData = {
        id,
        ...periodData,
        createdAt: new Date().toISOString(),
      }
      periods.push(newPeriod)
      localStorage.setItem('menstrualPeriods', JSON.stringify(periods))
      return id
    }
    return null
  }

  private async loadFromLocal(): Promise<PeriodData[]> {
    const periods = this.getLocalPeriods()
    return periods.sort(
      (a: PeriodData, b: PeriodData) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  private async deleteFromLocal(id: string): Promise<void> {
    const periods = this.getLocalPeriods()
    const filteredPeriods = periods.filter((p: PeriodData) => p.id !== id)
    localStorage.setItem('menstrualPeriods', JSON.stringify(filteredPeriods))
  }

  // Utilitaires pour le stockage local
  private getLocalPeriods(): PeriodData[] {
    const stored = localStorage.getItem('menstrualPeriods')
    return stored ? JSON.parse(stored) : []
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // --- MIGRATION ENTRE TYPES DE STOCKAGE ---
  async migrateToLocal(): Promise<number> {
    if (this._storageType === 'local') return 0

    try {
      const firebasePeriods = await this.loadFromFirebase()

      // Convertir les périodes Firebase pour le stockage local
      const localPeriods: PeriodData[] = firebasePeriods.map((period: PeriodData) => ({
        ...period,
        id: this.generateId(), // Nouveau ID pour le local
      }))

      localStorage.setItem('menstrualPeriods', JSON.stringify(localPeriods))
      this.setStorageType('local')

      return localPeriods.length
    } catch (error) {
      console.error('Erreur lors de la migration vers local:', error)
      throw error
    }
  }

  async migrateToFirebase(): Promise<number> {
    if (this._storageType === 'firebase') return 0

    const user = auth.currentUser
    if (!user) throw new Error('Utilisateur non connecté')

    try {
      const localPeriods = this.getLocalPeriods()
      let migratedCount = 0

      for (const period of localPeriods) {
        const { id, ...periodData } = period
        const saved = await this.saveToFirebase(periodData)
        if (saved) migratedCount++
      }

      this.setStorageType('firebase')
      return migratedCount
    } catch (error) {
      console.error('Erreur lors de la migration vers Firebase:', error)
      throw error
    }
  }

  // Vérification de la connectivité pour Firebase
  isUserConnected(): boolean {
    return !!auth.currentUser
  }

  // Export/Import des données locales
  exportLocalData(): void {
    const periods = this.getLocalPeriods()
    const dataStr = JSON.stringify(periods, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `menstrual-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Migrer vers Firebase en transférant les données locales
  async migrateToFirebaseWithData(): Promise<number> {
    // 1. Charger les données du localStorage
    // 2. Les sauvegarder dans Firebase
    // 3. Changer le type de stockage
    // 4. Retourner le nombre d'éléments migrés
  }

  // Juste activer Firebase sans transfert
  async switchToFirebase(): Promise<void> {
    // Changer simplement le type de stockage vers Firebase
    // sans transférer les données locales
  }

  async importLocalData(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          if (!e.target?.result) {
            reject(new Error('Impossible de lire le fichier'))
            return
          }

          const importedPeriods: PeriodData[] = JSON.parse(e.target.result as string)
          if (Array.isArray(importedPeriods)) {
            // Validation basique des données
            const validPeriods = importedPeriods.filter(
              (period: any) => period.startDate && period.predictedDate && period.createdAt,
            )

            if (validPeriods.length === 0) {
              reject(new Error('Aucune période valide trouvée dans le fichier'))
              return
            }

            localStorage.setItem('menstrualPeriods', JSON.stringify(validPeriods))
            resolve(validPeriods.length)
          } else {
            reject(new Error('Format de fichier invalide'))
          }
        } catch (error) {
          reject(new Error('Erreur lors du parsing du fichier JSON'))
        }
      }
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
      reader.readAsText(file)
    })
  }
}

export default new StorageService()
