<template>
  <div class="min-h-screen bg-gradient-to-b from-pink-50 to-gray-100 py-8 px-4">
    <div class="max-w-screen-md mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-8">
      <!-- Titre principal avec bouton d'aide -->
      <div class="flex items-center justify-center gap-4">
        <h1 class="text-4xl font-extrabold text-pink-600 tracking-tight">D-Day</h1>
        <button
          @click="showHelp = true"
          class="w-8 h-8 bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          title="Aide et informations"
        >
          ?
        </button>
      </div>

      <!-- Modal d'aide -->
      <div
        v-if="showHelp"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click="showHelp = false"
      >
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
          <!-- En-tête du modal -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-pink-600 flex items-center gap-2">
                ❓ Guide d'utilisation D-Day
              </h2>
              <button
                @click="showHelp = false"
                class="text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none"
              >
                ×
              </button>
            </div>
          </div>

          <!-- Contenu du modal -->
          <div class="px-6 py-6 space-y-6">
            <!-- Section 1: Qu'est-ce que D-Day -->
            <section>
              <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🌸 Qu'est-ce que D-Day ?
              </h3>
              <p class="text-gray-600 leading-relaxed">
                D-Day est votre assistant personnel pour suivre votre cycle menstruel. L'application
                vous aide à prévoir vos prochaines règles et votre période d'ovulation en se basant
                sur vos cycles précédents.
              </p>
            </section>

            <!-- Section 2: Comment utiliser -->
            <section>
              <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                📅 Comment utiliser l'application
              </h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <span
                    class="inline-block w-6 h-6 bg-red-500 rounded-full mt-1 flex-shrink-0"
                  ></span>
                  <div>
                    <strong class="text-gray-800">Enregistrer le début de vos règles :</strong>
                    <p class="text-gray-600">
                      Cliquez sur la date du premier jour de vos règles dans le calendrier.
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span
                    class="inline-block w-6 h-6 bg-pink-400 rounded-full mt-1 flex-shrink-0"
                  ></span>
                  <div>
                    <strong class="text-gray-800">Prédictions automatiques :</strong>
                    <p class="text-gray-600">
                      L'application calcule automatiquement vos prochaines règles estimées.
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span
                    class="inline-block w-6 h-6 bg-green-500 rounded-full mt-1 flex-shrink-0"
                  ></span>
                  <div>
                    <strong class="text-gray-800">Période d'ovulation :</strong>
                    <p class="text-gray-600">
                      Visualisez votre période d'ovulation maximale pour une meilleure
                      planification.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 3: Fonctionnalités avancées -->
            <section>
              <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                ⚙️ Fonctionnalités avancées
              </h3>
              <div class="space-y-3 text-gray-600">
                <div class="flex items-start gap-2">
                  <span class="text-pink-500 mt-1">•</span>
                  <span
                    ><strong>Durée du cycle personnalisable :</strong> Ajustez la durée de votre
                    cycle dans les paramètres (20-40 jours)</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-pink-500 mt-1">•</span>
                  <span
                    ><strong>Suppression :</strong> Appui long sur une date ou clic droit pour
                    supprimer une entrée</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-pink-500 mt-1">•</span>
                  <span
                    ><strong>Stockage flexible :</strong> Choisissez entre stockage local ou
                    synchronisation cloud</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-pink-500 mt-1">•</span>
                  <span
                    ><strong>Export/Import :</strong> Sauvegardez et restaurez vos données
                    facilement</span
                  >
                </div>
              </div>
            </section>

            <!-- Section 4: Conseils -->
            <section class="bg-pink-50 p-4 rounded-lg">
              <h3 class="text-xl font-semibold text-pink-800 mb-3 flex items-center gap-2">
                💡 Conseils d'utilisation
              </h3>
              <div class="space-y-2 text-pink-700">
                <p class="flex items-start gap-2">
                  <span class="mt-1">•</span>
                  <span
                    >Enregistrez régulièrement le début de vos règles pour des prédictions plus
                    précises</span
                  >
                </p>
                <p class="flex items-start gap-2">
                  <span class="mt-1">•</span>
                  <span>Les prédictions s'améliorent avec le temps et plus de données</span>
                </p>
                <p class="flex items-start gap-2">
                  <span class="mt-1">•</span>
                  <span>N'hésitez pas à ajuster la durée de votre cycle si elle change</span>
                </p>
                <p class="flex items-start gap-2">
                  <span class="mt-1">•</span>
                  <span>Utilisez le stockage cloud pour ne jamais perdre vos données</span>
                </p>
              </div>
            </section>

            <!-- Section 5: Avertissement médical -->
            <section class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <h3 class="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                ⚠️ Avertissement médical
              </h3>
              <p class="text-yellow-700 text-sm leading-relaxed">
                Cette application est un outil de suivi personnel et ne remplace pas l'avis d'un
                professionnel de santé. Les prédictions sont basées sur des moyennes statistiques et
                peuvent varier selon chaque personne. Consultez un médecin pour toute préoccupation
                médicale.
              </p>
            </section>
          </div>

          <!-- Pied de page du modal -->
          <div class="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <button
              @click="showHelp = false"
              class="w-full px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>

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
          Dernière période enregistrée
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

        <!-- Bouton expansible : Paramètres de stockage -->
        <div class="bg-pink-50 border-2 border-pink-400 rounded-xl shadow-md">
          <button
            @click="showStorageSettings = !showStorageSettings"
            class="w-full text-left px-4 py-3 flex items-center justify-between text-pink-700 font-bold text-base hover:bg-pink-100 transition rounded-t-xl"
          >
            🎛️ Paramètres de stockage
            <span
              class="text-xl transform transition-transform duration-300"
              :class="{ 'rotate-180': showStorageSettings }"
            >
              ⌄
            </span>
          </button>

          <transition name="fade">
            <div v-if="showStorageSettings" class="px-4 py-4 border-t border-pink-300">
              <StorageSettings @storage-changed="onStorageChanged" />
            </div>
          </transition>
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
const showHelp = ref(false) // Nouvelle variable pour le modal d'aide
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

/* Animation pour le modal d'aide */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
