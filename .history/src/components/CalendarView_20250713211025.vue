<template>
  <div class="p-4">
    <VCalendar is-expanded :attributes="calendarAttributes" @dayclick="handleDayClick" />

    <div v-if="selectedPeriod" class="mt-4 space-y-1">
      <p>
        <span class="inline-block w-3 h-3 rounded-full mr-2" style="background-color: red"></span>
        <strong>Début des règles :</strong> {{ selectedPeriod.startDate.toLocaleDateString() }}
      </p>
      <p>
        <span class="inline-block w-3 h-3 rounded-full mr-2" style="background-color: pink"></span>
        <strong>Prochaines règles estimées :</strong>
        {{ selectedPeriod.predictedDate.toLocaleDateString() }}
      </p>
      <p>
        <span class="inline-block w-3 h-3 rounded-full mr-2" style="background-color: green"></span>
        <strong>Ovulation maximale estimée :</strong>
        {{ selectedPeriod.ovulationDate.toLocaleDateString() }}
      </p>
    </div>

    <button class="mt-6 text-sm text-blue-500 underline" @click="showSettings = !showSettings">
      ⚙️ Paramètres
    </button>

    <div v-if="showSettings" class="mt-2">
      <label class="block text-sm font-medium text-gray-700">
        Durée du cycle (en jours) :
        <input
          type="number"
          v-model.number="customCycleLength"
          class="mt-1 block w-20 border border-gray-300 rounded-md px-2 py-1"
          min="10"
        />
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

const calendarAttributes = ref([])
const selectedPeriod = ref(null)
const customCycleLength = ref(28) // valeur par défaut
const showSettings = ref(false)

let clickBuffer = [] // Pour stocker les deux clics

const handleDayClick = async ({ date }) => {
  clickBuffer.push(new Date(date))

  if (clickBuffer.length === 2) {
    const startDate = clickBuffer[0]
    const nextStartDate = clickBuffer[1]
    const calculatedCycleLength = Math.round((nextStartDate - startDate) / (1000 * 60 * 60 * 24))

    // Sauvegarder avec la durée mesurée mais garder la durée personnalisée pour le futur
    await savePeriod(startDate, calculatedCycleLength)

    clickBuffer = [nextStartDate] // Préparer le cycle suivant
  } else {
    // Juste premier clic, affichage temporaire en attente du 2e clic
    selectedPeriod.value = {
      startDate: new Date(date),
      predictedDate: null,
      ovulationDate: null,
    }
  }
}

const savePeriod = async (startDate, cycleLength) => {
  const user = auth.currentUser
  if (!user) return

  const predictedDate = new Date(startDate)
  predictedDate.setDate(predictedDate.getDate() + cycleLength)

  const ovulationDate = new Date(startDate)
  ovulationDate.setDate(ovulationDate.getDate() + Math.round(cycleLength / 2))

  const doc = {
    startDate: startDate.toISOString(),
    predictedDate: predictedDate.toISOString(),
    ovulationDate: ovulationDate.toISOString(),
    createdAt: serverTimestamp(),
  }

  const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
  await addDoc(periodsCollectionRef, doc)

  // Appliquer les pastilles
  calendarAttributes.value.push(
    {
      key: `rules-${startDate.toISOString()}`,
      dates: [startDate],
      highlight: { color: 'red', fillMode: 'solid' },
      popover: { label: 'Début des règles' },
    },
    {
      key: `prediction-${predictedDate.toISOString()}`,
      dates: [predictedDate],
      highlight: { color: 'pink', fillMode: 'outline' },
      popover: { label: 'Prochaines règles estimées' },
    },
    {
      key: `ovulation-${ovulationDate.toISOString()}`,
      dates: [ovulationDate],
      highlight: { color: 'green', fillMode: 'solid' },
      popover: { label: 'Ovulation maximale' },
    },
  )

  selectedPeriod.value = {
    startDate,
    predictedDate,
    ovulationDate,
  }
}

const loadLastCycle = async () => {
  const user = auth.currentUser
  if (!user) return

  const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
  const q = query(periodsCollectionRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  const periods = snapshot.docs.map((doc) => doc.data())

  periods.forEach((period, i) => {
    const startDate = new Date(period.startDate)
    const predictedDate = new Date(period.predictedDate)
    const ovulationDate = new Date(period.ovulationDate)

    calendarAttributes.value.push(
      {
        key: `rules-${i}`,
        dates: [startDate],
        highlight: { color: 'red', fillMode: 'solid', opacity: i === 0 ? 1 : 0.3 },
        popover: { label: 'Début des règles' },
      },
      {
        key: `prediction-${i}`,
        dates: [predictedDate],
        highlight: { color: 'pink', fillMode: 'outline', opacity: i === 0 ? 1 : 0.3 },
        popover: { label: 'Prochaines règles estimées' },
      },
      {
        key: `ovulation-${i}`,
        dates: [ovulationDate],
        highlight: { color: 'green', fillMode: 'solid', opacity: i === 0 ? 1 : 0.3 },
        popover: { label: 'Ovulation maximale' },
      },
    )

    if (i === 0) {
      selectedPeriod.value = {
        startDate,
        predictedDate,
        ovulationDate,
      }
      clickBuffer = [startDate]
    }
  })
}

onMounted(() => {
  loadLastCycle()
})
</script>

<style scoped></style>
