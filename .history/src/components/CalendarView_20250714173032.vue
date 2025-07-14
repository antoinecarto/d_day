<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">D-Day</h1>
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
    />

    <div v-if="selectedDates.length" class="mt-4">
      <p><strong>Dernière période enregistrée :</strong></p>
      <p>
        <span class="dot red"></span>
        Début des règles : {{ selectedDates[0].toLocaleDateString() }}
      </p>
      <p>
        <span class="dot green"></span>
        Ovulation maximale : {{ selectedDates[2].toLocaleDateString() }}
      </p>
      <p>
        <span class="dot pink"></span>
        Prochaines règles estimées : {{ selectedDates[1].toLocaleDateString() }}
      </p>
    </div>

    <div
      v-if="userHasChangedCycle"
      class="mt-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800"
    >
      ⚠️ Vous avez changé la durée du cycle. Les futures prédictions sont maintenant basées sur
      <strong>{{ cycleDuration }}</strong> jours.
    </div>

    <div class="mt-4 text-right">
      <button @click="showSettings = !showSettings">⚙️ Paramètres</button>
    </div>

    <div v-if="showSettings" class="mt-2">
      <label>
        Durée du cycle (jours) :
        <input type="number" v-model.number="cycleDuration" min="20" max="40" />
      </label>
      <p class="text-sm text-gray-500">
        La nouvelle durée s'appliquera aux prochains cycles enregistrés.
      </p>
    </div>
    <table v-if="allPeriods.length" class="mt-4 w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2">Date de début</th>
          <th class="p-2">Date estimée des règles</th>
          <th class="p-2">Ovulation</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(period, index) in allPeriods" :key="index" class="border-t">
          <td class="p-2">{{ formatDate(period.startDate) }}</td>
          <td class="p-2">{{ formatDate(period.predictedDate) }}</td>
          <td class="p-2">{{ formatDate(period.ovulationDate) }}</td>
          <td class="p-2 text-right">
            <button
              @click="confirmDeletion(new Date(period.startDate))"
              class="text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore'

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
const allPeriods = ref([])

const loadPeriods = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const q = query(periodsCollectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    const periods = snapshot.docs.map((doc) => doc.data())

    if (periods.length > 0) {
      const latest = periods[0]
      const startDate = new Date(latest.startDate)
      const predictedDate = new Date(latest.predictedDate)
      const ovulationDate = new Date(startDate)
      ovulationDate.setDate(
        startDate.getDate() + Math.floor((predictedDate - startDate) / (1000 * 60 * 60 * 24) / 2),
      )

      selectedDates.value = [startDate, predictedDate, ovulationDate]
    }

    const referenceDate = selectedDates.value[0] || new Date()

    const newAttributes = periods.flatMap((period, i) => {
      const startDate = new Date(period.startDate)
      const predictedDate = new Date(period.predictedDate)
      const ovulationDate = new Date(startDate)
      const cycleDays = Math.floor((predictedDate - startDate) / (1000 * 60 * 60 * 24))
      ovulationDate.setDate(startDate.getDate() + Math.floor(cycleDays / 2))

      const isPast = startDate < referenceDate

      return [
        {
          key: `rules-${i}`,
          dates: [startDate],
          highlight: {
            color: 'red',
            fillMode: 'solid',
            contentClass: isPast ? 'past-opacity' : '',
          },
          popover: { label: 'Début des règles' },
        },
        {
          key: `prediction-${i}`,
          dates: [predictedDate],
          highlight: {
            color: 'pink',
            fillMode: 'outline',
            contentClass: isPast ? 'past-opacity' : '',
          },
          popover: { label: 'Prochaines règles estimées' },
        },
        {
          key: `ovulation-${i}`,
          dates: [ovulationDate],
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
  }
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
