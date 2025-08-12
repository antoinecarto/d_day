<template>
  <div class="min-h-screen bg-gradient-to-b from-pink-50 to-gray-100 py-8 px-4">
    <div class="max-w-screen-md mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-8">
      <!-- Titre principal -->
      <h1 class="text-4xl font-extrabold text-center text-pink-600 tracking-tight">D-Day</h1>

      <!-- Calendrier -->
      <div class="flex justify-center">
        <v-calendar
          is-expanded
          :attributes="calendarAttributes"
          @dayclick="onDayClick"
          @daymousedown="(day) => handleLongPress(day, 'mouse')"
          @daymouseup="cancelLongPress"
          @daytouchstart="(day) => handleLongPress(day, 'touch')"
          @daytouchend="cancelLongPress"
          @daycontextmenu="onDayRightClick"
          :disabled="isSaving"
          class="w-full max-w-md rounded-lg shadow-sm"
        />
      </div>

      <!-- Dernière période enregistrée -->
      <section
        v-if="selectedDates.length"
        class="bg-white border border-pink-200 rounded-lg p-4 shadow-sm space-y-2"
      >
        <h2 class="text-pink-600 font-bold text-lg flex items-center gap-2">
          🩸 Dernière période enregistrée
        </h2>
        <p>
          <span class="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
          Début des règles : <strong>{{ selectedDates[0].toLocaleDateString() }}</strong>
        </p>
        <p>
          <span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
          Ovulation maximale : <strong>{{ selectedDates[2].toLocaleDateString() }}</strong>
        </p>
        <p>
          <span class="inline-block w-3 h-3 rounded-full bg-pink-400 mr-2"></span>
          Prochaines règles estimées : <strong>{{ selectedDates[1].toLocaleDateString() }}</strong>
        </p>
      </section>

      <!-- Avertissement cycle modifié -->
      <section
        v-if="userHasChangedCycle"
        class="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md text-yellow-800 text-sm"
      >
        ⚠️ Vous avez changé la durée du cycle. Les futures prédictions sont maintenant basées sur
        <strong>{{ cycleDuration }}</strong> jours.
      </section>

      <!-- Indicateur de stockage -->
      <section
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 p-4 rounded-lg shadow-sm"
      >
        <div class="text-sm text-gray-700 font-medium">
          <span v-if="currentStorageType === 'firebase'"
            >☁️ <span class="text-blue-600">Stockage en ligne</span></span
          >
          <span v-else>💾 <span class="text-purple-600">Stockage local</span></span>
        </div>
        <button
          @click="showSettings = !showSettings"
          class="px-4 py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full text-sm font-semibold shadow hover:opacity-90 transition"
        >
          ⚙️ Paramètres
        </button>
      </section>

      <!-- Paramètres -->
      <section v-if="showSettings" class="space-y-6">
        <!-- Durée du cycle -->
        <div class="bg-white rounded-lg shadow-md p-4">
          <label class="block mb-2 text-sm font-semibold text-gray-700">
            🗓️ Durée du cycle (jours) :
          </label>
          <input
            type="number"
            v-model.number="cycleDuration"
            min="20"
            max="40"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          />
          <p class="text-xs text-gray-500 mt-2 italic">
            La nouvelle durée s'appliquera aux prochains cycles enregistrés.
          </p>
        </div>

        <!-- Liste des périodes -->
        <div class="bg-white rounded-lg shadow-md p-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">📅 Périodes enregistrées</h3>
          <div
            class="overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100"
            style="max-height: 150px"
          >
            <div
              v-for="period in allPeriods"
              :key="period.id"
              class="flex justify-between items-center px-4 py-3 text-sm hover:bg-gray-50 transition"
            >
              <span class="font-medium text-gray-800">{{ formatDate(period.startDate) }}</span>
              <button
                @click="deleteById(period.id)"
                class="text-red-500 hover:text-red-700 text-lg focus:outline-none"
                aria-label="Supprimer cette date"
              >
                ❌
              </button>
            </div>
          </div>
        </div>

        <!-- Paramètres de stockage -->
        <div class="bg-pink-50 border-2 border-pink-400 rounded-xl p-4 shadow-md">
          <h3 class="text-pink-700 font-bold text-base mb-3">🎛️ Paramètres de stockage</h3>
          <StorageSettings @storage-changed="onStorageChanged" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import storageService from '@/stores/storageService'
import StorageSettings from '@/components/StorageSettings.vue'

const selectedDates = ref([])
const calendarAttributes = ref([])
const isSaving = ref(false)
const showSettings = ref(false)
const showStorageSettings = ref(false)
const cycleDuration = ref(28)
const previousCycleDuration = ref(28)
const userHasChangedCycle = ref(false)
const allPeriods = ref([])
const currentStorageType = ref(storageService.getStoragePreference())

const onDayRightClick = ({ date, event }) => {
  event.preventDefault()
  confirmDeletion(date)
}

const deleteById = async (id) => {
  const confirmed = window.confirm('Confirmez la suppression de cette période ?')
  if (!confirmed) return

  try {
    await storageService.deletePeriod(id)
    await loadPeriods()
  } catch (error) {
    console.error('Erreur suppression :', error)
    alert('Erreur lors de la suppression de la période')
  }
}

const loadPeriods = async () => {
  try {
    const periodsData = await storageService.loadPeriods()

    const periods = periodsData.map((data) => {
      const startDate = new Date(data.startDate)
      const predictedDate = new Date(data.predictedDate)
      const ovulationDate = new Date(startDate)
      const cycleDays = Math.floor((predictedDate - startDate) / (1000 * 60 * 60 * 24))
      ovulationDate.setDate(startDate.getDate() + Math.floor(cycleDays / 2))

      return {
        id: data.id,
        startDate,
        predictedDate,
        ovulationDate,
        cycleDays,
        createdAt: data.createdAt,
      }
    })

    // Met à jour le tableau récapitulatif
    allPeriods.value = periods

    // Met à jour le résumé
    if (periods.length > 0) {
      const latest = periods[0]
      selectedDates.value = [latest.startDate, latest.predictedDate, latest.ovulationDate]
    }

    // Met à jour les attributs V-Calendar
    const referenceDate = selectedDates.value[0] || new Date()
    const newAttributes = periods.flatMap((period, i) => {
      const isPast = period.startDate < referenceDate

      return [
        {
          key: `rules-${i}`,
          dates: [period.startDate],
          highlight: {
            color: 'red',
            fillMode: 'solid',
            contentClass: isPast ? 'past-opacity' : '',
          },
          popover: { label: 'Début des règles' },
        },
        {
          key: `prediction-${i}`,
          dates: [period.predictedDate],
          highlight: {
            color: 'pink',
            fillMode: 'outline',
            contentClass: isPast ? 'past-opacity' : '',
          },
          popover: { label: 'Prochaines règles estimées' },
        },
        {
          key: `ovulation-${i}`,
          dates: [period.ovulationDate],
          highlight: {
            color: 'green',
            fillMode: 'solid',
            contentClass: isPast ? 'past-opacity' : '',
          },
          popover: { label: 'Ovulation maximale' },
        },
      ]
    })

    calendarAttributes.value = newAttributes
  } catch (error) {
    console.error('Erreur chargement périodes:', error)
    alert('Erreur lors du chargement des données')
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

const onDayClick = async ({ date }) => {
  if (wasLongPressed.value) {
    wasLongPressed.value = false
    return
  }

  if (isSaving.value) return
  isSaving.value = true

  const start = new Date(date)
  const prediction = new Date(start)
  prediction.setDate(start.getDate() + cycleDuration.value)

  try {
    const periodData = {
      startDate: start.toISOString(),
      predictedDate: prediction.toISOString(),
    }

    await storageService.savePeriod(periodData)
    await loadPeriods()
  } catch (error) {
    console.error('Erreur sauvegarde période:', error)
    alert('Erreur lors de la sauvegarde')
  } finally {
    isSaving.value = false
  }
}

// Gestion clic long pour suppression
let longPressTimer = null
let longPressDate = null
const wasLongPressed = ref(false)

const handleLongPress = (day, type) => {
  if (!day?.date) return

  wasLongPressed.value = false
  longPressDate = new Date(day.date)
  longPressTimer = setTimeout(() => {
    wasLongPressed.value = true
    confirmDeletion(longPressDate)
    longPressDate = null
  }, 800)
}

const cancelLongPress = () => {
  clearTimeout(longPressTimer)
  longPressDate = null
}

const confirmDeletion = async (date) => {
  const confirmed = window.confirm(
    `Confirmez-vous la suppression de la période débutant le ${date.toLocaleDateString()} ?`,
  )
  if (!confirmed) return

  try {
    // Trouver la période correspondante
    const periodToDelete = allPeriods.value.find(
      (period) => period.startDate.toDateString() === date.toDateString(),
    )

    if (periodToDelete) {
      await storageService.deletePeriod(periodToDelete.id)
      await loadPeriods()
    }
  } catch (error) {
    console.error('Erreur suppression période:', error)
    alert('Erreur lors de la suppression')
  }
}

// Gérer le changement de type de stockage
const onStorageChanged = (newStorageType) => {
  currentStorageType.value = newStorageType
  loadPeriods() // Recharger les données
}

watch(cycleDuration, (newVal, oldVal) => {
  if (selectedDates.value.length && newVal !== oldVal) {
    userHasChangedCycle.value = true
    previousCycleDuration.value = oldVal
  }
})

onMounted(() => {
  loadPeriods()
})
</script>

<style>
.dot {
  height: 12px;
  width: 12px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 6px;
}
.red {
  background-color: red;
}
.pink {
  background-color: pink;
}
.green {
  background-color: green;
}
.past-opacity {
  opacity: 0.3 !important;
}
</style>
