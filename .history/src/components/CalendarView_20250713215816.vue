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
        <span class="dot" :style="{ backgroundColor: predIsPerfect ? 'blue' : 'pink' }"></span>
        Prochaines règles estimées : {{ selectedDates[1].toLocaleDateString() }}
      </p>
      <p>
        <span class="dot green"></span>
        Ovulation maximale : {{ selectedDates[2].toLocaleDateString() }}
      </p>
    </div>

    <div class="mt-4 text-right">
      <button @click="showSettings = !showSettings">⚙️ Paramètres</button>
    </div>

    <div v-if="showSettings" class="mt-2">
      <label
        >Durée du cycle (jours) :
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

// Flag qui indique si la prédiction est confirmée
const predIsPerfect = ref(false)
const perfectPredDate = ref(null)

const loadPeriods = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const q = query(periodsCollectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    const periods = snapshot.docs.map((doc) => doc.data())

    const newAttributes = []

    if (periods.length > 0) {
      const latest = periods[0]
      const startDate = new Date(latest.startDate)
      const predictedDate = new Date(latest.predictedDate)
      const ovulationDate = new Date(startDate)
      const cycleDays = Math.floor(
        (predictedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      ovulationDate.setDate(startDate.getDate() + Math.floor(cycleDays / 2))

      selectedDates.value = [startDate, predictedDate, ovulationDate]

      // Reset flag si on recharge périodes
      predIsPerfect.value = false
      perfectPredDate.value = null
    }

    periods.forEach((period, i) => {
      const startDate = new Date(period.startDate)
      const predictedDate = new Date(period.predictedDate)
      const cycleDays = Math.floor(
        (predictedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      const ovulationDate = new Date(startDate)
      ovulationDate.setDate(startDate.getDate() + Math.floor(cycleDays / 2))

      // Détermine si la date est passée par rapport à aujourd'hui
      const now = new Date()
      const isPastStart = startDate < now
      const isPastPrediction = predictedDate < now
      const isPastOvulation = ovulationDate < now

      // Couleurs et opacités
      newAttributes.push(
        {
          key: `start-${i}`,
          dates: startDate,
          highlight: {
            backgroundColor: isPastStart ? 'rgba(255,0,0,0.3)' : 'red',
            fillMode: 'solid',
          },
          dot: {
            color: isPastStart ? '#ff9999' : 'red',
          },
          popover: { label: 'Début des règles' },
        },
        {
          key: `prediction-${i}`,
          dates: predictedDate,
          highlight: {
            backgroundColor:
              predIsPerfect.value &&
              perfectPredDate.value?.toDateString() === predictedDate.toDateString()
                ? 'rgba(0,0,255,0.3)'
                : isPastPrediction
                  ? 'rgba(255,192,203,0.3)'
                  : 'pink',
            fillMode: 'solid',
          },
          dot: {
            color:
              predIsPerfect.value &&
              perfectPredDate.value?.toDateString() === predictedDate.toDateString()
                ? 'blue'
                : isPastPrediction
                  ? '#f7c4d4'
                  : 'pink',
          },
          popover: { label: 'Prochaines règles estimées' },
        },
        {
          key: `ovulation-${i}`,
          dates: ovulationDate,
          highlight: {
            backgroundColor: isPastOvulation ? 'rgba(0,128,0,0.3)' : 'green',
            fillMode: 'solid',
          },
          dot: {
            color: isPastOvulation ? '#a3d9a5' : 'green',
          },
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

  const user = auth.currentUser
  if (!user) {
    isSaving.value = false
    return
  }

  const clickedDate = new Date(date)
  clickedDate.setHours(0, 0, 0, 0)

  // Vérifie si le clic est sur une prédiction existante
  if (
    selectedDates.value.length >= 2 &&
    clickedDate.toDateString() === selectedDates.value[1].toDateString()
  ) {
    // Valide visuellement la prédiction
    predIsPerfect.value = true
    perfectPredDate.value = clickedDate
    isSaving.value = false
    return
  }

  // Sinon, c'est un nouveau début de règles
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const prediction = new Date(start)
  prediction.setDate(start.getDate() + cycleDuration.value)
  const ovulation = new Date(start)
  ovulation.setDate(start.getDate() + Math.floor(cycleDuration.value / 2))

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const snapshot = await getDocs(periodsCollectionRef)
    const exists = snapshot.docs.some(
      (doc) => new Date(doc.data().startDate).toDateString() === start.toDateString(),
    )

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
</style>
