<template>
  <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">🗄️ Type de stockage des données</h3>

    <!-- Sélection du type de stockage -->
    <div class="space-y-4 mb-6">
      <div class="flex items-center space-x-3">
        <input
          id="firebase-storage"
          type="radio"
          value="firebase"
          v-model="selectedStorageType"
          class="text-blue-600 focus:ring-blue-500"
          :disabled="isProcessing"
        />
        <label for="firebase-storage" class="flex-1 cursor-pointer">
          <div class="font-medium text-gray-800">☁️ Stockage en ligne (Firebase)</div>
          <div class="text-sm text-gray-600">Vos données sont sauvegardées dans le cloud.</div>
        </label>
      </div>

      <div class="flex items-center space-x-3">
        <input
          id="local-storage"
          type="radio"
          value="local"
          v-model="selectedStorageType"
          class="text-blue-600 focus:ring-blue-500"
          :disabled="isProcessing"
        />
        <label for="local-storage" class="flex-1 cursor-pointer">
          <div class="font-medium text-gray-800">💾 Stockage local</div>
          <div class="text-sm text-gray-600">Vos données restent uniquement sur cet appareil.</div>
        </label>
      </div>
    </div>

    <!-- Statut actuel -->
    <div class="mb-6 p-3 bg-gray-50 rounded text-sm">
      <strong>Statut actuel :</strong>
      <span v-if="currentStorageType === 'firebase'" class="text-blue-600">
        ☁️ Stockage en ligne activé
        <span v-if="!storageService.isUserConnected()" class="text-orange-600">
          (non connecté)
        </span>
      </span>
      <span v-else class="text-green-600">💾 Stockage local activé</span>

      <div class="mt-1 text-xs text-gray-500">{{ periodsCount }} période(s) enregistrée(s)</div>
    </div>

    <!-- Popup de connexion Firebase -->
    <div
      v-if="showLoginModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px)"
      @click.self="cancelLogin"
    >
      <div
        class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        style="animation: slideIn 0.2s ease-out"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h4 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
            🔐 Connexion Firebase
          </h4>
          <button
            @click="cancelLogin"
            class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            :disabled="isLoggingIn"
          >
            ×
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
          <p class="text-gray-600">Vous devez vous connecter pour utiliser le stockage en ligne.</p>

          <div class="space-y-4">
            <div>
              <label for="login-email" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                v-model="loginEmail"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="votre@email.com"
                :disabled="isLoggingIn"
              />
            </div>

            <div>
              <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                v-model="loginPassword"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                :disabled="isLoggingIn"
                @keyup.enter="signIn"
              />
            </div>

            <!-- Messages d'erreur -->
            <div
              v-if="loginError"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              <div class="flex items-center gap-2">
                <span>⚠️</span>
                <span>{{ loginError }}</span>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="flex gap-3">
              <button
                @click="signIn"
                :disabled="isLoggingIn || !loginEmail || !loginPassword"
                class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <span v-if="!isLoggingIn">Se connecter</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connexion...
                </span>
              </button>

              <button
                @click="signUp"
                :disabled="isLoggingIn || !loginEmail || !loginPassword"
                class="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <span v-if="!isLoggingIn">S'inscrire</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Inscription...
                </span>
              </button>
            </div>

            <button
              @click="cancelLogin"
              :disabled="isLoggingIn"
              class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>

          <div class="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <p><strong>Première fois ?</strong> Cliquez sur "S'inscrire" pour créer un compte.</p>
            <p><strong>Mot de passe oublié ?</strong> Contactez le support.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup de confirmation pour migration vers Firebase -->
    <div
      v-if="showMigrationModal"
      class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
      @click.self="cancelMigration"
    >
      <div
        class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto overflow-y-auto max-h-[90vh] animate-slideIn"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h4 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
            🔄 Migration vers Firebase
          </h4>
          <button
            @click="cancelMigration"
            class="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            :disabled="isProcessing"
          >
            ×
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-blue-900 font-medium mb-2">📊 Données existantes détectées</p>
            <p class="text-blue-800 text-sm">
              Vous avez <strong>{{ periodsCount }} période(s)</strong> enregistrée(s) localement.
            </p>
          </div>

          <p class="text-gray-800">Que souhaitez-vous faire avec ces données ?</p>

          <div class="space-y-3">
            <!-- Option 1: Transférer les données -->
            <button
              @click="confirmMigrationWithData"
              :disabled="isProcessing"
              class="w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-lg transition-colors text-left group"
            >
              <div class="flex items-center gap-3">
                <div class="text-2xl group-hover:scale-110 transition-transform">📤</div>
                <div class="flex-1">
                  <div class="font-medium text-blue-900">Transférer vers Firebase</div>
                  <div class="text-sm text-blue-700 mt-1">
                    Copier toutes les données locales vers le cloud
                  </div>
                </div>
              </div>
            </button>

            <!-- Option 2: Commencer à zéro -->
            <button
              @click="confirmMigrationWithoutData"
              :disabled="isProcessing"
              class="w-full p-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 hover:border-yellow-300 rounded-lg transition-colors text-left group"
            >
              <div class="flex items-center gap-3">
                <div class="text-2xl group-hover:scale-110 transition-transform">🆕</div>
                <div class="flex-1">
                  <div class="font-medium text-yellow-900">Commencer à zéro</div>
                  <div class="text-sm text-yellow-700 mt-1">
                    Ignorer les données locales et démarrer une nouvelle base
                  </div>
                </div>
              </div>
            </button>
          </div>

          <!-- Annuler -->
          <div class="pt-4 border-t border-gray-200">
            <button
              @click="cancelMigration"
              :disabled="isProcessing"
              class="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Boutons d'action -->
    <div class="space-y-3">
      <!-- Appliquer les changements -->
      <button
        v-if="selectedStorageType !== currentStorageType"
        @click="applyStorageChange"
        :disabled="isProcessing"
        class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
      >
        <span v-if="!isProcessing">
          Passer au stockage {{ selectedStorageType === 'local' ? 'local' : 'en ligne' }}
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Migration en cours...
        </span>
      </button>

      <!-- Actions pour stockage local uniquement -->
      <div v-if="currentStorageType === 'local'" class="space-y-4 pt-6 border-t border-gray-200">
        <h4 class="text-base font-semibold text-gray-700 flex items-center gap-2">
          🛠️ Actions sur les données locales
        </h4>

        <div class="grid grid-cols-2 gap-3">
          <!-- Export -->
          <button
            @click="exportData"
            class="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium transition-colors"
          >
            📤 Exporter
          </button>

          <!-- Import -->
          <button
            @click="triggerImport"
            class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium transition-colors"
          >
            📥 Importer
          </button>
        </div>

        <!-- Input réellement invisible -->
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="importData"
          style="display: none"
        />
      </div>
    </div>

    <!-- Messages d'état -->
    <div v-if="statusMessage" class="mt-4 p-4 rounded-lg text-sm border" :class="statusClass">
      <div class="flex items-start gap-2">
        <span v-if="statusMessage.includes('✅')" class="text-lg">✅</span>
        <span v-else-if="statusMessage.includes('❌')" class="text-lg">❌</span>
        <span v-else class="text-lg">ℹ️</span>
        <span class="flex-1">{{ statusMessage }}</span>
      </div>
    </div>

    <!-- Section utilisateur connecté Firebase -->
    <div v-if="currentStorageType === 'firebase'" class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-base font-semibold text-gray-700 mb-3">👤 Compte Firebase</h4>

      <div
        v-if="storageService.isUserConnected()"
        class="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-2xl">✅</div>
            <div>
              <div class="font-medium text-green-800">Connecté</div>
              <div class="text-sm text-green-600">{{ storageService.getCurrentUserEmail() }}</div>
            </div>
          </div>
          <button
            @click="signOut"
            class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div v-else class="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-2xl">⚠️</div>
            <div>
              <div class="font-medium text-orange-800">Non connecté</div>
              <div class="text-sm text-orange-600">Connexion requise pour la synchronisation</div>
            </div>
          </div>
          <button
            @click="openLoginModal"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Amélioration du focus pour l'accessibilité */
input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Spinner personnalisé */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { auth } from '@/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import storageService, { type StorageType } from '../stores/storageService'

// Définition des émissions
const emit = defineEmits<{
  'storage-changed': [storageType: StorageType]
}>()

// État réactif principal
const currentStorageType = ref<StorageType>(storageService.getStoragePreference())
const selectedStorageType = ref<StorageType>(currentStorageType.value)
const isProcessing = ref<boolean>(false)
const periodsCount = ref<number>(0)
const statusMessage = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)
const showMigrationModal = ref<boolean>(false)

// État réactif pour la connexion
const showLoginModal = ref<boolean>(false)
const loginEmail = ref<string>('')
const loginPassword = ref<string>('')
const loginError = ref<string>('')
const isLoggingIn = ref<boolean>(false)
const currentUser = ref<any>(null)

// Classes CSS pour les messages
const statusClass = computed<string>(() => {
  if (statusMessage.value.includes('❌') || statusMessage.value.includes('Erreur')) {
    return 'bg-red-50 border-red-200 text-red-800'
  }
  if (statusMessage.value.includes('✅')) {
    return 'bg-green-50 border-green-200 text-green-800'
  }
  return 'bg-blue-50 border-blue-200 text-blue-800'
})

// ✅ FONCTION: Ouvrir la modal de connexion
const openLoginModal = (): void => {
  showLoginModal.value = true
  loginError.value = ''
  loginEmail.value = ''
  loginPassword.value = ''
}

// ✅ FONCTION: Fermer la modal de connexion
const cancelLogin = (): void => {
  showLoginModal.value = false
  loginError.value = ''
  loginEmail.value = ''
  loginPassword.value = ''
  // Remettre le stockage sur local si l'utilisateur annule
  if (!storageService.isUserConnected()) {
    selectedStorageType.value = 'local'
  }
}

// ✅ FONCTION: Se connecter
const signIn = async (): Promise<void> => {
  if (!loginEmail.value || !loginPassword.value) {
    loginError.value = 'Veuillez remplir tous les champs'
    return
  }

  isLoggingIn.value = true
  loginError.value = ''

  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    showLoginModal.value = false
    statusMessage.value = '✅ Connexion réussie !'

    // Procéder avec la migration maintenant que l'utilisateur est connecté
    if (selectedStorageType.value === 'firebase') {
      await applyStorageChange()
    }
  } catch (error: any) {
    console.error('Erreur connexion:', error)
    loginError.value = getErrorMessage(error.code)
  } finally {
    isLoggingIn.value = false
  }
}

// ✅ FONCTION: S'inscrire
const signUp = async (): Promise<void> => {
  if (!loginEmail.value || !loginPassword.value) {
    loginError.value = 'Veuillez remplir tous les champs'
    return
  }

  if (loginPassword.value.length < 6) {
    loginError.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  isLoggingIn.value = true
  loginError.value = ''

  try {
    await createUserWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    showLoginModal.value = false
    statusMessage.value = '✅ Inscription réussie !'

    // Procéder avec la migration maintenant que l'utilisateur est connecté
    if (selectedStorageType.value === 'firebase') {
      await applyStorageChange()
    }
  } catch (error: any) {
    console.error('Erreur inscription:', error)
    loginError.value = getErrorMessage(error.code)
  } finally {
    isLoggingIn.value = false
  }
}

// ✅ FONCTION: Se déconnecter
const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
    statusMessage.value = '✅ Déconnexion réussie'

    // Basculer automatiquement vers le stockage local
    selectedStorageType.value = 'local'
    await performMigration(false)
  } catch (error) {
    console.error('Erreur déconnexion:', error)
    statusMessage.value = '❌ Erreur lors de la déconnexion'
  }
}

// ✅ FONCTION: Messages d'erreur Firebase
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cet email'
    case 'auth/wrong-password':
      return 'Mot de passe incorrect'
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email'
    case 'auth/invalid-email':
      return 'Email invalide'
    case 'auth/weak-password':
      return 'Mot de passe trop faible'
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard'
    default:
      return 'Erreur de connexion. Vérifiez vos informations'
  }
}

// Changer le type de stockage
const applyStorageChange = async (): Promise<void> => {
  if (selectedStorageType.value === currentStorageType.value) {
    return
  }

  // Si on passe à Firebase et qu'on n'est pas connecté
  if (selectedStorageType.value === 'firebase' && !storageService.isUserConnected()) {
    openLoginModal()
    return
  }

  // Si on passe de local à Firebase ET qu'on a des données locales
  if (
    currentStorageType.value === 'local' &&
    selectedStorageType.value === 'firebase' &&
    periodsCount.value > 0
  ) {
    showMigrationModal.value = true
    return
  }

  // Migration directe pour les autres cas
  await performMigration(selectedStorageType.value === 'firebase')
}

// Confirmer migration avec transfert des données
const confirmMigrationWithData = async (): Promise<void> => {
  showMigrationModal.value = false
  await performMigration(true, true)
}

// Confirmer migration sans transfert des données
const confirmMigrationWithoutData = async (): Promise<void> => {
  showMigrationModal.value = false
  await performMigration(true, false)
}

// Annuler la migration
const cancelMigration = (): void => {
  showMigrationModal.value = false
  selectedStorageType.value = currentStorageType.value // Revenir à l'état précédent
}

// Effectuer la migration
const performMigration = async (
  toFirebase: boolean,
  transferData: boolean = true,
): Promise<void> => {
  isProcessing.value = true
  statusMessage.value = ''

  try {
    let migratedCount = 0

    if (toFirebase) {
      if (transferData) {
        // Transférer les données locales vers Firebase
        migratedCount = await storageService.migrateToFirebaseWithData()
        statusMessage.value = `✅ Migration réussie ! ${migratedCount} période(s) transférée(s) vers Firebase.`
      } else {
        // Juste changer le type de stockage sans transférer
        await storageService.switchToFirebase()
        statusMessage.value = `✅ Stockage Firebase activé. Nouvelle base de données créée.`
      }
    } else {
      migratedCount = await storageService.migrateToLocal()
      statusMessage.value = `✅ Migration réussie ! ${migratedCount} période(s) transférée(s) vers le stockage local.`
    }

    currentStorageType.value = selectedStorageType.value
    await loadPeriodsCount()
    emit('storage-changed', currentStorageType.value)
  } catch (error) {
    console.error('Erreur migration:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    statusMessage.value = `❌ Erreur lors de la migration : ${errorMessage}`
    selectedStorageType.value = currentStorageType.value // Revenir à l'état précédent
  } finally {
    isProcessing.value = false

    // Effacer le message après 5 secondes
    setTimeout(() => {
      statusMessage.value = ''
    }, 5000)
  }
}

// Export des données locales
const exportData = (): void => {
  try {
    storageService.exportLocalData()
    statusMessage.value = '✅ Données exportées avec succès !'
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    statusMessage.value = `❌ Erreur lors de l'export : ${errorMessage}`
  }
}

// Déclencher l'import
const triggerImport = (): void => {
  fileInput.value?.click()
}

// Import des données
const importData = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const importedCount = await storageService.importLocalData(file)
    statusMessage.value = `✅ Import réussi ! ${importedCount} période(s) importée(s).`
    await loadPeriodsCount()
    emit('storage-changed', currentStorageType.value)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    statusMessage.value = `❌ Erreur lors de l'import : ${errorMessage}`
  }

  // Réinitialiser l'input file
  target.value = ''
}

// Charger le nombre de périodes
const loadPeriodsCount = async (): Promise<void> => {
  try {
    const periods = await storageService.loadPeriods()
    periodsCount.value = periods.length
  } catch (error) {
    console.error('Erreur chargement périodes:', error)
    periodsCount.value = 0
  }
}

// Exposer storageService pour le template
defineExpose({ storageService })

// Écouter les changements d'authentification
onMounted(() => {
  loadPeriodsCount()

  // Écouter les changements d'authentification Firebase
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    console.log('Auth state changed:', user?.email || 'disconnected')
  })
})
</script>
