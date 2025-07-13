<template>
  <div class="p-4">
    <VCalendar is-expanded :attributes="calendarAttributes" @dayclick="onDayClick" />

    <div v-if="selectedDates.length" class="mt-4">
      <p><strong>Dernière période enregistrée :</strong></p>
      <p>
        <span class="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
        Début des règles : {{ selectedDates[0].toLocaleDateString() }}
      </p>
      <p>
        <span class="inline-block w-3 h-3 bg-pink-300 rounded-full mr-2"></span>
        Prochaines règles estimées : {{ selectedDates[1].toLocaleDateString() }}
      </p>
      <p>
        <span class="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
        Ovulation estimée : {{ selectedDates[2].toLocaleDateString() }}
      </p>
    </div>

    <!-- Roue en bas à droite -->
    <div class="fixed bottom-4 right-4">
      <button @click="showSettings = !showSettings" title="Paramètres">⚙️ Paramètres</button>
    </div>

    <div v-if="showSettings" class="mt-4 p-4 border rounded bg-gray-100">
      <label for="cycleLength" class="block text-sm font-medium text-gray-700">
        Durée du cycle (en jours)
      </label>
      <input
        type="number"
        id="cycleLength"
        v-model.number="cycleLength"
        class="mt-1 p-2 border rounded w-24"
        min="15"
        max="60"
      />

      <div class="mt-4 text-sm">
        <p><strong>Prochaine ovulation estimée :</strong></p>
        <p v-if="selectedDates.length">{{ nextOvulationDate?.toLocaleDateString() }}</p>
        <p v-else class="italic text-gray-500">Aucune donnée disponible</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

const selectedDates = ref([])
const calendarAttributes = ref([])
const isSaving = ref(false)
const cycleLength = ref(28)
const showSettings = ref(false)
const nextOvulationDate = ref(null)

const loadPeriods = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const q = query(periodsCollectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    const periods = snapshot.docs.map((doc) => doc.data())

    if (periods.length > 0) {
      const start = new Date(periods[0].startDate)
      const prediction = new Date(periods[0].predictedDate)

      const cycleDays = Math.floor((prediction.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const ovulation = new Date(start)
      ovulation.setDate(start.getDate() + Math.floor(cycleDays / 2))

      selectedDates.value = [start, prediction, ovulation]
    }

    const newAttributes = []

    periods.forEach((period, i) => {
      const startDate = new Date(period.startDate)
      const predictedDate = new Date(period.predictedDate)

      const cycleDays = Math.floor(
        (predictedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      const ovulationDate = new Date(startDate)
      ovulationDate.setDate(startDate.getDate() + Math.floor(cycleDays / 2))

      newAttributes.push(
        {
          key: `rules-${i}`,
          dates: [startDate],
          highlight: { color: 'red', fillMode: 'solid' },
          popover: { label: 'Début des règles' },
        },
        {
          key: `prediction-${i}`,
          dates: [predictedDate],
          highlight: { color: 'pink', fillMode: 'outline' },
          popover: { label: 'Prochaines règles estimées' },
        },
        {
          key: `ovulation-${i}`,
          dates: [ovulationDate],
          highlight: { color: 'green', fillMode: 'solid' },
          popover: { label: 'Ovulation estimée' },
        },
      )
    })

    calendarAttributes.value = newAttributes
  } catch (error) {
    console.error('Erreur chargement périodes:', error)
  }
}

const onDayClick = async ({ date }) => {
  if (isSaving.value) return
  isSaving.value = true

  const user = auth.currentUser
  if (!user) {
    isSaving.value = false
    return
  }

  try {
    const start = new Date(date)
    const prediction = new Date(start)
    prediction.setDate(start.getDate() + cycleLength.value)

    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')

    await addDoc(periodsCollectionRef, {
      startDate: start.toISOString(),
      predictedDate: prediction.toISOString(),
      createdAt: new Date().toISOString(),
    })

    await loadPeriods()
  } catch (error) {
    console.error('Erreur lors de l’enregistrement:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(loadPeriods)
</script>

<style scoped>
/* Tu peux ajouter des styles personnalisés ici si nécessaire */
</style>
