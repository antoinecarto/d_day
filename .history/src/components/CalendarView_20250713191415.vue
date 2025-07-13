<template>
  <div class="p-4">
    <v-calendar
      is-expanded
      :attributes="calendarAttributes"
      @dayclick="onDayClick"
      :disabled="isSaving"
    />

    <div v-if="selectedDates.length" class="mt-4 space-y-2">
      <p><strong>Dernière période enregistrée :</strong></p>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-red-500"></span>
        <span>Début des règles : {{ selectedDates[0].toLocaleDateString() }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full border border-pink-500"></span>
        <span>Prochaines règles estimées : {{ selectedDates[1].toLocaleDateString() }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-green-500"></span>
        <span>Ovulation maximale : {{ selectedDates[2].toLocaleDateString() }}</span>
      </div>
    </div>

    <div class="mt-6 text-center">
      <button class="text-sm text-blue-600 underline" @click="showSettings = !showSettings">
        ⚙️ Paramètres
      </button>
    </div>

    <div v-if="showSettings" class="mt-4 border-t pt-4">
      <label for="cycleLength" class="block mb-2 font-medium"
        >Durée du cycle menstruel (jours)</label
      >
      <input
        id="cycleLength"
        type="number"
        v-model="cycleLength"
        min="20"
        max="45"
        class="border rounded px-2 py-1 w-24"
      />
      <p class="text-sm text-gray-600 mt-2">
        L'ovulation maximale est estimée à {{ Math.floor(cycleLength / 2) }} jours après le début
        des règles.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

const selectedDates = ref([])
const calendarAttributes = ref([])
const isSaving = ref(false)
const showSettings = ref(false)
const cycleLength = ref(28)

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
      ovulationDate.setDate(startDate.getDate() + Math.floor(cycleLength.value / 2))

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
    console.warn('Utilisateur non connecté')
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
      console.log('Nouvelle période sauvegardée')
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

// Recharger les périodes si cycleLength change
watch(cycleLength, () => {
  loadPeriods()
})
</script>
