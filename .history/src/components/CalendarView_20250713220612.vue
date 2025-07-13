<template>
  <div class="p-4">
    <v-calendar
      is-expanded
      :attributes="calendarAttributes"
      @dayclick="onDayClick"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

const selectedDates = ref([])
const calendarAttributes = ref([])
const isSaving = ref(false)
const showSettings = ref(false)
const cycleDuration = ref(28) // Valeur par défaut

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
        startDate.getDate() +
          Math.floor((predictedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) / 2),
      )

      selectedDates.value = [startDate, predictedDate, ovulationDate]

      // Mise à jour dynamique du cycleDuration (moyenne des derniers cycles)
      const durations = periods
        .slice(0, 5)
        .map((p) => {
          const start = new Date(p.startDate)
          const predicted = new Date(p.predictedDate)
          return (predicted - start) / (1000 * 60 * 60 * 24)
        })
        .filter((n) => !isNaN(n))

      if (durations.length > 0) {
        const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        cycleDuration.value = avg
        console.log('Cycle moyen recalculé:', avg)
      }
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
    const periods = snapshot.docs.map((doc) => doc.data())
    const exists = periods.some((p) => p.startDate === start.toISOString())

    // Cherche la prédiction précédente si disponible
    const previousPrediction = periods.length > 0 ? new Date(periods[0].predictedDate) : null
    const diffInDays = previousPrediction
      ? Math.round((start - previousPrediction) / (1000 * 60 * 60 * 24))
      : null

    if (!exists) {
      await addDoc(periodsCollectionRef, {
        startDate: start.toISOString(),
        predictedDate: prediction.toISOString(),
        actualStartDate: start.toISOString(),
        predictionDelta: diffInDays,
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

onMounted(loadPeriods)
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
