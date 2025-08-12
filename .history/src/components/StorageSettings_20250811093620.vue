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
          <div class="text-sm text-gray-600">
            Vos données sont sauvegardées dans le cloud et synchronisées sur tous vos appareils.
            Nécessite une connexion internet.
          </div>
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
          <div class="text-sm text-gray-600">
            Vos données restent uniquement sur cet appareil. Plus rapide mais pas synchronisées.
          </div>
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

    <!-- Boutons d'action -->
    <div class="space-y-3">
      <!-- Appliquer les changements -->
      <button
        v-if="selectedStorageType !== currentStorageType"
        @click="applyStorageChange"
        :disabled="
          isProcessing || (selectedStorageType === 'firebase' && !storageService.isUserConnected())
        "
        class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
      >
        <span v-if="!isProcessing">
          Passer au stockage {{ selectedStorageType === 'local' ? 'local' : 'en ligne' }}
        </span>
        <span v-else>Migration en cours...</span>
      </button>

      <!-- Actions pour stockage local uniquement -->
      <div v-if="currentStorageType === 'local'" class="space-y-2 pt-4 border-t">
        <h4 class="font-medium text-gray-700">Actions sur les données locales :</h4>

        <div class="flex space-x-2">
          <button
            @click="exportData"
            class="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            📤 Exporter
          </button>

          <button
            @click="triggerImport"
            class="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            📥 Importer
          </button>
        </div>

        <input ref="fileInput" type="file" accept=".json" @change="importData" class="hidden" />
      </div>
    </div>

    <!-- Messages d'état -->
    <div v-if="statusMessage" class="mt-4 p-3 rounded text-sm" :class="statusClass">
      {{ statusMessage }}
    </div>

    <!-- Avertissement pour Firebase sans connexion -->
    <div
      v-if="selectedStorageType === 'firebase' && !storageService.isUserConnected()"
      class="mt-4 p-3 bg-orange-100 border border-orange-300 rounded text-orange-800 text-sm"
    >
      ⚠️ Vous devez être connecté pour utiliser le stockage en ligne.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import storageService from '../services/storageService'

const emit = defineEmits(['storage-changed'])

// État réactif
const currentStorageType = ref(storageService.getStoragePreference())
const selectedStorageType = ref(currentStorageType.value)
const isProcessing = ref(false)
const periodsCount = ref(0)
const statusMessage = ref('')
const fileInput = ref(null)

// Classes CSS pour les messages
const statusClass = computed(() => {
  if (statusMessage.value.includes('Erreur') || statusMessage.value.includes('Échec')) {
    return 'bg-red-100 border border-red-300 text-red-800'
  }
  return 'bg-green-100 border border-green-300 text-green-800'
})

// Changer le type de stockage
const applyStorageChange = async () => {
  if (selectedStorageType.value === currentStorageType.value) return

  isProcessing.value = true
  statusMessage.value = ''

  try {
    let migratedCount = 0

    if (selectedStorageType.value === 'local') {
      migratedCount = await storageService.migrateToLocal()
      statusMessage.value = `✅ Migration réussie ! ${migratedCount} période(s) transférée(s) vers le stockage local.`
    } else {
      migratedCount = await storageService.migrateToFirebase()
      statusMessage.value = `✅ Migration réussie ! ${migratedCount} période(s) transférée(s) vers Firebase.`
    }

    currentStorageType.value = selectedStorageType.value
    await loadPeriodsCount()
    emit('storage-changed', currentStorageType.value)
  } catch (error) {
    console.error('Erreur migration:', error)
    statusMessage.value = `❌ Erreur lors de la migration : ${error.message}`
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
const exportData = () => {
  try {
    storageService.exportLocalData()
    statusMessage.value = '✅ Données exportées avec succès !'
  } catch (error) {
    statusMessage.value = `❌ Erreur lors de l'export : ${error.message}`
  }
}

// Déclencher l'import
const triggerImport = () => {
  fileInput.value.click()
}

// Import des données
const importData = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const importedCount = await storageService.importLocalData(file)
    statusMessage.value = `✅ Import réussi ! ${importedCount} période(s) importée(s).`
    await loadPeriodsCount()
    emit('storage-changed', currentStorageType.value)
  } catch (error) {
    statusMessage.value = `❌ Erreur lors de l'import : ${error.message}`
  }

  // Réinitialiser l'input file
  event.target.value = ''
}

// Charger le nombre de périodes
const loadPeriodsCount = async () => {
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

onMounted(() => {
  loadPeriodsCount()
})
</script>
