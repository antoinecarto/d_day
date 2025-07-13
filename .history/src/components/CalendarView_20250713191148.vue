<template>
  <div class="p-4">
    <!-- Calendrier -->
    <v-calendar
      is-expanded
      :attributes="calendarAttributes"
      @dayclick="onDayClick"
      :disabled="isSaving"
    />

    <!-- Résumé des prédictions -->
    <div v-if="selectedDates.length" class="mt-4 space-y-2">
      <p><strong>Dernière période enregistrée :</strong></p>
      <p>
        <span class="pastille" :style="{ backgroundColor: colorMap.rules }"></span>
        Début des règles : {{ selectedDates[0].toLocaleDateString() }}
      </p>
      <p>
        <span class="pastille" :style="{ backgroundColor: colorMap.prediction }"></span>
        Prochaines règles estimées : {{ selectedDates[1].toLocaleDateString() }}
      </p>
      <p>
        <span class="pastille" :style="{ backgroundColor: colorMap.ovulation }"></span>
        Ovulation maximale estimée : {{ selectedDates[2].toLocaleDateString() }}
      </p>
    </div>

    <!-- Bouton Paramètres -->
    <div class="mt-6">
      <button @click="showSettings = !showSettings" class="text-sm text-blue-600 underline">
        {{ showSettings ? 'Fermer les paramètres' : 'Paramètres' }}
      </button>
    </div>

    <!-- Zone Paramètres -->
    <div v-if="showSettings" class="mt-4 border rounded p-4 bg-gray-50 max-w-sm">
      <label class="block mb-2">
        Durée du cycle (en jours) :
        <input
          type="number"
          v-model.number="cycleLength"
          min="15"
          max="60"
          class="border px-2 py-1 rounded w-20 ml-2"
        />
      </label>
      <p class="text-xs text-gray-600">
        Par défaut : 28 jours. Cela affectera les prédictions futures.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

const selectedDates = ref([]) // [start, prediction, ovulation]
const calendarAttributes = ref([])
const isSaving = ref(false)
const cycleLength = ref(28) // valeur modifiable
const showSettings = ref(false) // ✅ toggle affichage zone paramètres

const colorMap = {
  rules: 'red',
  prediction: 'pink',
  ovulation: 'green',
}

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

      const prediction = new Date(start)
      prediction.setDate(start.getDate() + cycleLength.value)

      const ovulation = new Date(start)
      ovulation.setDate(start.getDate() + Math.floor(cycleLength.value / 2))

      selectedDates.value = [start, prediction, ovulation]
    }

    const newAttributes = []

    periods.forEach((period, i) => {
      const startDate = new Date(period.startDate)
      const predictedDate = new Date(startDate)
      predictedDate.setDate(startDate.getDate() + cycleLength.value)

      const ovulationDate = new Date(startDate)
      ovulationDate.setDate(startDate.getDate() + 14)

      newAttributes.push(
        {
          key: `rules-${i}`,
          dates: [startDate],
          highlight: { color: colorMap.rules, fillMode: 'solid' },
          popover: { label: 'Début des règles' },
        },
        {
          key: `prediction-${i}`,
          dates: [predictedDate],
          highlight: { color: colorMap.prediction, fillMode: 'outline' },
          popover: { label: 'Prochaines règles estimées' },
        },
        {
          key: `ovulation-${i}`,
          dates: [ovulationDate],
          highlight: { color: colorMap.ovulation, fillMode: 'solid' },
          popover: { label: 'Ovulation maximale' },
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

  const start = new Date(date)
  const prediction = new Date(start)
  prediction.setDate(start.getDate() + cycleLength.value)

  const user = auth.currentUser
  if (!user) {
    isSaving.value = false
    return
  }

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

onMounted(() => {
  loadPeriods()
})
</script>

<style scoped>
.pastille {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
</style>
