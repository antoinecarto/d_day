<template>
  <div class="bg-gray-100 py-8">
    <div class="container mx-auto">
      <div class="bg-gray shadow-lg rounded-xl px-6 py-8 space-y-6">
        <h1 class="text-3xl font-bold text-center text-gray-800">D-Day</h1>

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
            class="w-full max-w-md"
          />
        </div>

        <!-- ✅ MARGES APPLIQUÉES ICI -->
        <div class="space-y-6">
          <div v-if="selectedDates.length" class="space-y-2 text-gray-700">
            <p class="font-semibold">Dernière période enregistrée :</p>
            <p>
              <span class="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              Début des règles : {{ selectedDates[0].toLocaleDateString() }}
            </p>
            <p>
              <span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              Ovulation maximale : {{ selectedDates[2].toLocaleDateString() }}
            </p>
            <p>
              <span class="inline-block w-3 h-3 rounded-full bg-pink-400 mr-2"></span>
              Prochaines règles estimées : {{ selectedDates[1].toLocaleDateString() }}
            </p>
          </div>

          <div
            v-if="userHasChangedCycle"
            class="p-4 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm"
          >
            ⚠️ Vous avez changé la durée du cycle. Les futures prédictions sont maintenant basées sur
            <strong>{{ cycleDuration }}</strong> jours.
          </div>

          <div class="text-right">
            <button
              @click="showSettings = !showSettings"
              class="px-4 py-2 bg-white hover:bg-gray-200 rounded text-sm font-medium transition text-gray-900"
            >
              ⚙️ Paramètres
            </button>
          </div>

          <div v-if="showSettings" class="space-y-4">
            <div class="flex items-center gap-4">
              <label class="text-gray-700 font-medium whitespace-nowrap">
                Durée du cycle (jours) :
              </label>
              <input
                type="number"
                v-model.number="cycleDuration"
                min="20"
                max="40"
                class="border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 w-24 text-gray-900"
              />
            </div>

            <p class="text-sm text-gray-700 italic">
              La nouvelle durée s'appliquera aux prochains cycles enregistrés.
            </p>
            <p v-if="averageCycleDuration !== null" class="text-sm text-gray-700">
              Moyenne de la durée du cycle sur {{ allPeriods.length - 1 }} périodes :
              <strong>{{ averageCycleDuration }} jours</strong>
            </p>
            <p v-else class="text-sm text-gray-500 italic">
                Pas assez de données pour calculer une moyenne fiable.
            </p>

            <label class="font-bold block px-4 py-2 text-gray-700 text-sm">
              <p class="font-semibold">Liste des différentes périodes :</p>
            </label>

            <div
              class="overflow-y-scroll border border-gray-900 rounded-md divide-y divide-gray-600 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-600"
              style="max-height: 80px"
            >
              <div
                v-for="(period, index) in allPeriods"
                :key="period.id"
                class="group"
              >
                <div class="flex justify-center items-center px-4 py-3 text-sm hover:bg-gray-50 transition pl-5">
                  <span class="font-medium text-gray-800">📅 {{ formatDate(period.startDate) }}&nbsp;&nbsp;</span>
                  <button
                    @click="deleteById(period.id)"
                    class="text-red-500 text-lg hover:text-red-700 leading-none focus:outline-none pl-5"
                    aria-label="Supprimer cette date"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- ✅ FIN DU BLOC AVEC MARGES -->
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore'

const selectedDates = ref([])
const calendarAttributes = ref([])
const isSaving = ref(false)
const showSettings = ref(false)
const cycleDuration = ref(28)
const previousCycleDuration = ref(28)
const userHasChangedCycle = ref(false)
const onDayRightClick = ({ date, event }) => {
  event.preventDefault() // Évite le menu contextuel du navigateur
  confirmDeletion(date)
}

const deleteById = async (id) => {
  const user = auth.currentUser
  if (!user) return
  const confirmed = window.confirm('Confirmez la suppression de cette période ?')
  if (!confirmed) return
  try {
    const ref = doc(db, 'users', user.uid, 'periods', id)
    await deleteDoc(ref)
    await loadPeriods()
  } catch (error) {
    console.error('Erreur suppression :', error)
  }
}

const allPeriods = ref([]) // liste visible dans tableau

const loadPeriods = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const q = query(periodsCollectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    const periods = snapshot.docs.map((doc) => {
      const data = doc.data()
      const startDate = new Date(data.startDate)
      const predictedDate = new Date(data.predictedDate)
      const ovulationDate = new Date(startDate)
      const cycleDays = Math.floor((predictedDate - startDate) / (1000 * 60 * 60 * 24))
      ovulationDate.setDate(startDate.getDate() + Math.floor(cycleDays / 2))

      return {
        id: doc.id, // utile pour suppression directe
        ...data,
        startDate,
        predictedDate,
        ovulationDate,
        cycleDays,
      }
    })

    // 🧾 Met à jour le tableau récapitulatif
    allPeriods.value = periods

    // 🩸 Met à jour le résumé (section "Dernière période enregistrée")
    if (periods.length > 0) {
      const latest = periods[0]
      selectedDates.value = [latest.startDate, latest.predictedDate, latest.ovulationDate]
    }

    // 📆 Met à jour les attributs V-Calendar
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
    averageCycleDuration.value = calculateAverageCycle(periods)
    calendarAttributes.value = newAttributes
  } catch (error) {
    console.error('Erreur chargement périodes:', error)
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

  const user = auth.currentUser
  if (!user) {
    isSaving.value = false
    return
  }

  const start = new Date(date)
  const prediction = new Date(start)
  prediction.setDate(start.getDate() + cycleDuration.value)
  const ovulation = new Date(start)
  ovulation.setDate(start.getDate() + Math.floor(cycleDuration.value / 2))

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const snapshot = await getDocs(periodsCollectionRef)
    const exists = snapshot.docs.some((doc) => doc.data().startDate === start.toISOString())

    if (!exists) {
      await addDoc(periodsCollectionRef, {
        startDate: start.toISOString(),
        predictedDate: prediction.toISOString(),
        createdAt: new Date().toISOString(),
      })
    }

    await loadPeriods()
  } catch (error) {
    console.error('Erreur sauvegarde période:', error)
  } finally {
    isSaving.value = false
  }
}

// --- GESTION CLIC LONG SOURIS & TACTILE POUR SUPPRESSION ---
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

  const user = auth.currentUser
  if (!user) return

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const snapshot = await getDocs(periodsCollectionRef)

    const docToDelete = snapshot.docs.find(
      (doc) => new Date(doc.data().startDate).toDateString() === date.toDateString(),
    )

    if (docToDelete) {
      await deleteDoc(docToDelete.ref)
      await loadPeriods()
    }
  } catch (error) {
    console.error('Erreur suppression période:', error)
  }
}
// Calcul durée moyenne
const averageCycleDuration = ref(null)

const calculateAverageCycle = (periods) => {
  if (periods.length < 2) return null

  const durations = []
  for (let i = 0; i < periods.length - 1; i++) {
    const current = periods[i].startDate
    const next = periods[i + 1].startDate
    const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24)) // en jours
    durations.push(diff)
  }

  const sum = durations.reduce((a, b) => a + b, 0)
  return Math.round(sum / durations.length)
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
